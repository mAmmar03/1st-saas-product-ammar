import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Workspace from '../models/Workspace.js';
import BrandProfile from '../models/BrandProfile.js';
import { sendVerificationEmail, sendPasswordResetEmail } from '../services/emailService.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ammardev_master_enterprise_secret_key_2026!';

export const SUPER_ADMIN_PERMISSIONS = {
  canAccessDashboard: true,
  canAccessInventory: true,
  canAccessDeals: true,
  canAccessSchedule: true,
  canAccessInfluencers: true,
  canAccessCompany: true,
  canAccessBudget: true,
  canDispatchPR: true,
  canSettlePayment: true,
  canDeleteRecords: true,
  canExportData: true,
};

export const DEFAULT_STAFF_PERMISSIONS = {
  canAccessDashboard: true,
  canAccessInventory: true,
  canAccessDeals: true,
  canAccessSchedule: true,
  canAccessInfluencers: true,
  canAccessCompany: false,
  canAccessBudget: false,
  canDispatchPR: true,
  canSettlePayment: false,
  canDeleteRecords: false,
  canExportData: false,
};

// Helper: Generate secure 6-digit random code
const generateSixDigitCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Helper to ensure default Super Admin exists for legacy root compatibility
export const initDefaultUsers = async () => {
  try {
    const superAdmin = await User.findOne({ role: 'super_admin' });
    if (!superAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('AmmarDev@Super2026!', salt);
      const masterPinHash = await bcrypt.hash('9900', salt);

      const defaultUser = await User.create({
        username: 'superadmin',
        name: 'Muhammad Ammar (Super Admin)',
        email: 'ammar@ammardev.com',
        passwordHash,
        masterPinHash,
        role: 'super_admin',
        isEmailVerified: true,
        isActive: true,
      });

      const defaultWorkspace = await Workspace.create({
        name: 'Stylish Collection Workspace',
        slug: 'stylish-collection',
        owner: defaultUser._id,
        status: 'active',
      });

      defaultUser.workspaceId = defaultWorkspace._id;
      await defaultUser.save();

      await BrandProfile.create({
        workspaceId: defaultWorkspace._id,
        brandName: 'Stylish Collection',
        tagline: 'Luxury Pret & Festive Collection',
        email: 'ammar@ammardev.com',
        authorizedSignatory: 'Muhammad Ammar (Super Admin)',
      });

      console.log('[Security] Super Admin initialized: superadmin / AmmarDev@Super2026! (Master PIN: 9900)');
    }
  } catch (error) {
    console.error('[Security] Error initializing default accounts:', error);
  }
};

// 0. Brand Workspace Registration / Sign-Up Endpoint
export const register = async (req, res) => {
  try {
    const { brandName, name, username, email, password, masterPin } = req.body;

    if (!name || !username || !password) {
      return res.status(400).json({ error: 'Full name, username, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const cleanUsername = username.toLowerCase().trim();
    if (cleanUsername.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters long.' });
    }

    const cleanEmail = email ? email.toLowerCase().trim() : '';
    if (!cleanEmail) {
      return res.status(400).json({ error: 'A valid work email is required for workspace registration.' });
    }

    const existingUser = await User.findOne({ username: cleanUsername });
    if (existingUser) {
      return res.status(409).json({ error: `Username "${cleanUsername}" is already registered. Please choose another username or sign in.` });
    }

    const existingEmail = await User.findOne({ email: cleanEmail });
    if (existingEmail) {
      return res.status(409).json({ error: `Email "${cleanEmail}" is already registered. Please sign in or use Forgot Password.` });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const pin = masterPin && String(masterPin).trim() ? String(masterPin).trim() : '9900';
    const masterPinHash = await bcrypt.hash(pin, salt);

    // 6-digit email verification code (expires in 15 mins)
    const verificationCode = generateSixDigitCode();
    const verificationExpiry = new Date(Date.now() + 15 * 60 * 1000);

    // 1. Create User
    const newUser = new User({
      username: cleanUsername,
      name: name.trim(),
      email: cleanEmail,
      passwordHash,
      masterPinHash,
      role: 'super_admin',
      isEmailVerified: false,
      emailVerificationCode: verificationCode,
      emailVerificationExpires: verificationExpiry,
      isActive: true,
    });

    // 2. Create Isolated Workspace
    const finalBrandName = brandName && brandName.trim() ? brandName.trim() : `${name.trim()}'s Brand`;
    const newWorkspace = await Workspace.create({
      name: finalBrandName,
      slug: cleanUsername,
      owner: newUser._id,
      status: 'active',
    });

    // Link user to workspace
    newUser.workspaceId = newWorkspace._id;
    await newUser.save();

    // 3. Create Dedicated BrandProfile for this Workspace
    await BrandProfile.create({
      workspaceId: newWorkspace._id,
      brandName: finalBrandName,
      email: cleanEmail,
      authorizedSignatory: `${name.trim()} (Super Admin)`,
      tagline: 'Luxury Pret & Influencer PR Management',
    });

    // 4. Send Verification Email via SMTP
    sendVerificationEmail({
      email: cleanEmail,
      code: verificationCode,
      brandName: finalBrandName,
    }).catch((err) => console.error('[Registration Email Async Error]:', err));

    res.status(201).json({
      message: `Workspace "${finalBrandName}" created! We sent a 6-digit verification code to ${cleanEmail}.`,
      requiresVerification: true,
      email: cleanEmail,
      username: cleanUsername,
    });
  } catch (error) {
    console.error('[Registration Error]:', error);
    res.status(500).json({ error: error.message || 'Failed to create brand workspace.' });
  }
};

// 1. Verify Email Endpoint (6-Digit OTP)
export const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: 'Email and 6-digit verification code are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = String(code).trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    if (user.isEmailVerified) {
      // Already verified, generate login token directly
      const token = jwt.sign(
        { id: user._id, username: user.username, role: user.role, workspaceId: user.workspaceId },
        JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({
        message: 'Email is already verified. Logging in...',
        token,
        user: {
          id: user._id,
          username: user.username,
          name: user.name,
          role: user.role,
          email: user.email,
          workspaceId: user.workspaceId,
          permissions: user.role === 'super_admin' ? SUPER_ADMIN_PERMISSIONS : DEFAULT_STAFF_PERMISSIONS,
        },
      });
    }

    if (user.emailVerificationCode !== cleanCode) {
      return res.status(400).json({ error: 'Invalid verification code. Please check and try again.' });
    }

    if (user.emailVerificationExpires && user.emailVerificationExpires < new Date()) {
      return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
    }

    // Mark verified and clear code
    user.isEmailVerified = true;
    user.emailVerificationCode = null;
    user.emailVerificationExpires = null;
    await user.save();

    const token = jwt.sign(
      { id: user._id, username: user.username, role: user.role, workspaceId: user.workspaceId },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Email verified successfully! Workspace unlocked.',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email,
        workspaceId: user.workspaceId,
        permissions: user.role === 'super_admin' ? SUPER_ADMIN_PERMISSIONS : DEFAULT_STAFF_PERMISSIONS,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Verification failed: ' + error.message });
  }
};

// 2. Resend Verification Code
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email address.' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ error: 'This email is already verified. You can sign in.' });
    }

    const newCode = generateSixDigitCode();
    user.emailVerificationCode = newCode;
    user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const brand = await BrandProfile.findOne({ workspaceId: user.workspaceId });
    sendVerificationEmail({
      email: cleanEmail,
      code: newCode,
      brandName: brand?.brandName || 'Brand Workspace',
    }).catch((err) => console.error('[Resend Email Async Error]:', err));

    res.json({ message: `A new 6-digit verification code has been sent to ${cleanEmail}.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to resend code: ' + error.message });
  }
};

// 3. Login Endpoint
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const cleanIdentifier = username.toLowerCase().trim();
    // Allow login by either username OR email
    const user = await User.findOne({
      $or: [{ username: cleanIdentifier }, { email: cleanIdentifier }],
    });

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account has been deactivated. Contact Super Admin.' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    // Check email verification status
    if (!user.isEmailVerified && user.email) {
      // Generate fresh OTP code and send to user
      const code = generateSixDigitCode();
      user.emailVerificationCode = code;
      user.emailVerificationExpires = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      const brand = await BrandProfile.findOne({ workspaceId: user.workspaceId });
      sendVerificationEmail({
        email: user.email,
        code,
        brandName: brand?.brandName || 'Brand Workspace',
      }).catch((err) => console.error('[Login Verification Email Async Error]:', err));

      return res.status(403).json({
        error: 'Your email address is not verified yet. We have sent a 6-digit verification code to your email.',
        requiresVerification: true,
        email: user.email,
      });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name,
        workspaceId: user.workspaceId,
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const effectivePermissions =
      user.role === 'super_admin'
        ? SUPER_ADMIN_PERMISSIONS
        : { ...DEFAULT_STAFF_PERMISSIONS, ...(user.permissions?.toObject ? user.permissions.toObject() : user.permissions) };

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        role: user.role,
        email: user.email,
        workspaceId: user.workspaceId,
        permissions: effectivePermissions,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed: ' + error.message });
  }
};

// 4. Forgot Password - Request 6-Digit Reset Code
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Registered email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      // Return ambiguous success for security so email enumeration is mitigated
      return res.json({
        message: 'If an account exists with this email, a 6-digit password reset code has been sent.',
      });
    }

    const resetCode = generateSixDigitCode();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    sendPasswordResetEmail({
      email: cleanEmail,
      code: resetCode,
      name: user.name,
    }).catch((err) => console.error('[Password Reset Email Async Error]:', err));

    res.json({
      message: `A 6-digit password reset code has been sent to ${cleanEmail}.`,
      email: cleanEmail,
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to process forgot password request: ' + error.message });
  }
};

// 5. Reset Password with 6-Digit OTP
export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, 6-digit code, and new password are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanCode = String(code).trim();

    const user = await User.findOne({ email: cleanEmail });
    if (!user) {
      return res.status(404).json({ error: 'No account found with this email.' });
    }

    if (!user.resetPasswordCode || user.resetPasswordCode !== cleanCode) {
      return res.status(400).json({ error: 'Invalid password reset code. Please check and try again.' });
    }

    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ error: 'Password reset code has expired. Please request a new one.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    user.resetPasswordCode = null;
    user.resetPasswordExpires = null;
    // Password reset also verifies email if not previously verified
    user.isEmailVerified = true;
    await user.save();

    res.json({ message: 'Password has been reset successfully! You can now log in.' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password: ' + error.message });
  }
};

// 6. Get Current Authenticated User (Scoped)
export const getMe = async (req, res) => {
  const user = req.user;
  const effectivePermissions =
    user.role === 'super_admin'
      ? SUPER_ADMIN_PERMISSIONS
      : { ...DEFAULT_STAFF_PERMISSIONS, ...(user.permissions?.toObject ? user.permissions.toObject() : user.permissions) };

  res.json({
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
      email: user.email,
      workspaceId: user.workspaceId,
      permissions: effectivePermissions,
      lastLogin: user.lastLogin,
    },
  });
};

// 7. Super Admin Set / Change Super Admin Password
export const setSuperAdminPassword = async (req, res) => {
  try {
    const { newPassword, newMasterPin } = req.body;

    if (!newPassword && !newMasterPin) {
      return res.status(400).json({ error: 'Please provide a new password or master PIN.' });
    }

    const superAdmin = await User.findOne({
      _id: req.user._id,
      role: 'super_admin',
    });

    if (!superAdmin) {
      return res.status(404).json({ error: 'Super Admin account not found.' });
    }

    const salt = await bcrypt.genSalt(10);
    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }
      superAdmin.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    if (newMasterPin) {
      if (newMasterPin.length < 4) {
        return res.status(400).json({ error: 'Master PIN must be at least 4 digits.' });
      }
      superAdmin.masterPinHash = await bcrypt.hash(newMasterPin, salt);
    }

    await superAdmin.save();
    res.json({ message: 'Super Admin credentials updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update credentials: ' + error.message });
  }
};

// 8. Super Admin Create New Admin (Scoped strictly to Super Admin's workspace)
export const createAdmin = async (req, res) => {
  try {
    const { username, name, password, email, permissions } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required for new Admin.' });
    }

    const cleanUsername = username.toLowerCase().trim();
    const existing = await User.findOne({ username: cleanUsername });
    if (existing) {
      return res.status(400).json({ error: 'An account with this username already exists.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const mergedPermissions = {
      ...DEFAULT_STAFF_PERMISSIONS,
      ...(permissions || {}),
    };

    const admin = await User.create({
      workspaceId: req.user.workspaceId,
      username: cleanUsername,
      name: name || 'PR Staff Admin',
      email: email ? email.toLowerCase().trim() : '',
      passwordHash,
      role: 'admin',
      isEmailVerified: true, // Created by Super Admin inside active workspace
      permissions: mergedPermissions,
      isActive: true,
    });

    res.status(201).json({
      message: 'Admin account created successfully!',
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        permissions: admin.permissions,
        isActive: admin.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create admin: ' + error.message });
  }
};

// 9. Super Admin Update / Reset Admin Account (Scoped to Super Admin's workspace)
export const manageAdminAccount = async (req, res) => {
  try {
    const { adminId, newPassword, isActive, name, permissions } = req.body;

    const admin = await User.findOne({
      _id: adminId,
      workspaceId: req.user.workspaceId,
      role: 'admin',
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found in your workspace.' });
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters.' });
      }
      const salt = await bcrypt.genSalt(10);
      admin.passwordHash = await bcrypt.hash(newPassword, salt);
    }

    if (typeof isActive === 'boolean') {
      admin.isActive = isActive;
    }

    if (name) {
      admin.name = name;
    }

    if (permissions && typeof permissions === 'object') {
      admin.permissions = {
        ...(admin.permissions?.toObject ? admin.permissions.toObject() : admin.permissions),
        ...permissions,
      };
    }

    await admin.save();
    res.json({ message: 'Admin account updated successfully!', admin });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update Admin account: ' + error.message });
  }
};

// 10. Super Admin Delete Admin Account (Scoped to Super Admin's workspace)
export const deleteAdminAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findOneAndDelete({
      _id: id,
      workspaceId: req.user.workspaceId,
      role: 'admin',
    });

    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found in your workspace.' });
    }
    res.json({ message: `Admin account "${admin.username}" deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete admin: ' + error.message });
  }
};

// 11. Get All Users for this Workspace (Super Admin Only)
export const getUsersList = async (req, res) => {
  try {
    const users = await User.find({ workspaceId: req.user.workspaceId })
      .select('-passwordHash -masterPinHash -emailVerificationCode -resetPasswordCode')
      .sort({ role: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

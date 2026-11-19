import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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

// Helper to ensure ONLY default Super Admin exists (NO automatic admin!)
export const initDefaultUsers = async () => {
  try {
    const superAdmin = await User.findOne({ role: 'super_admin' });
    if (!superAdmin) {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('AmmarDev@Super2026!', salt);
      const masterPinHash = await bcrypt.hash('9900', salt);

      await User.create({
        username: 'superadmin',
        name: 'Muhammad Ammar (Super Admin)',
        email: 'ammar@ammardev.com',
        passwordHash,
        masterPinHash,
        role: 'super_admin',
        isActive: true,
      });
      console.log('[Security] Super Admin account initialized: superadmin / AmmarDev@Super2026! (Master PIN: 9900)');
    }
  } catch (error) {
    console.error('[Security] Error initializing default accounts:', error);
  }
};

// 1. Login Endpoint
export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required.' });
    }

    const user = await User.findOne({ username: username.toLowerCase().trim() });
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

    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
        name: user.name,
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
        permissions: effectivePermissions,
        lastLogin: user.lastLogin,
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Authentication failed: ' + error.message });
  }
};

// 2. Get Current Authenticated User
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
      permissions: effectivePermissions,
      lastLogin: user.lastLogin,
    },
  });
};

// 3. Super Admin Set / Change Super Admin Password
export const setSuperAdminPassword = async (req, res) => {
  try {
    const { newPassword, newMasterPin } = req.body;

    if (!newPassword && !newMasterPin) {
      return res.status(400).json({ error: 'Please provide a new password or master PIN.' });
    }

    const superAdmin = await User.findOne({ role: 'super_admin' });
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
    res.json({ message: 'Super Admin password updated successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update password: ' + error.message });
  }
};

// 4. Super Admin Create New Admin (Only when Super Admin explicitly wants to)
export const createAdmin = async (req, res) => {
  try {
    const { username, name, password, permissions } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required for new Admin.' });
    }

    const existing = await User.findOne({ username: username.toLowerCase().trim() });
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
      username: username.toLowerCase().trim(),
      name: name || 'PR Staff Admin',
      passwordHash,
      role: 'admin',
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

// 5. Super Admin Update / Reset Admin Account (Password, Name, Active Status, Permissions)
export const manageAdminAccount = async (req, res) => {
  try {
    const { adminId, newPassword, isActive, name, permissions } = req.body;

    const admin = await User.findOne({ _id: adminId, role: 'admin' });
    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found.' });
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

// 6. Super Admin Delete Admin Account
export const deleteAdminAccount = async (req, res) => {
  try {
    const { id } = req.params;
    const admin = await User.findOneAndDelete({ _id: id, role: 'admin' });
    if (!admin) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }
    res.json({ message: `Admin account "${admin.username}" deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete admin: ' + error.message });
  }
};

// 7. Get All Users (Super Admin Only)
export const getUsersList = async (req, res) => {
  try {
    const users = await User.find().select('-passwordHash -masterPinHash').sort({ role: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

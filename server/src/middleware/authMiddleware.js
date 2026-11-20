import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ammardev_master_enterprise_secret_key_2026!';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. Please log in.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(decoded.id).select('-passwordHash -masterPinHash');
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'User account is inactive or not found.' });
    }

    req.user = user;
    req.workspaceId = user.workspaceId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired session token. Please log in again.' });
  }
};

export const requireSuperAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'super_admin') {
    return res.status(403).json({
      error: 'Access denied. Master Super Admin authorization is required for this action.',
    });
  }
  next();
};

import React, { createContext, useContext } from 'react';
import { useAuth } from './AuthContext';

const RoleContext = createContext(null);

export const ALL_PERMISSIONS = {
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

export function RoleProvider({ children }) {
  const { currentUser, isSuperAdmin } = useAuth();

  const userRole = currentUser?.role || 'admin';
  const userPermissions = currentUser?.permissions || (isSuperAdmin ? ALL_PERMISSIONS : DEFAULT_STAFF_PERMISSIONS);

  // Check if current user has permission
  const hasPermission = (permissionKey) => {
    if (isSuperAdmin) return true; // Super Admin always has full unrestricted authority
    if (!currentUser) return false;
    return Boolean(userPermissions[permissionKey]);
  };

  const can = hasPermission;

  return (
    <RoleContext.Provider
      value={{
        currentRole: userRole,
        isSuperAdmin,
        userPermissions,
        hasPermission,
        can,
      }}
    >
      {children}
    </RoleContext.Provider>
  );
}

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

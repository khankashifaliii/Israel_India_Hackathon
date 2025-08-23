import { create } from 'zustand';
import type { RoleStore, RolePermissions, UserRole } from '@/lib/contracts';

/**
 * Role-based access control store for managing user permissions
 */
export const useRoleStore = create<RoleStore>((set, get) => ({
  permissions: null,

  canAccess: (resource: string) => {
    const { permissions } = get();
    if (!permissions) return false;

    // Resource access mapping
    const resourcePermissionMap: Record<string, keyof RolePermissions['permissions']> = {
      '/dashboard': 'canViewDashboard',
      '/gait': 'canAccessGaitPortal',
      '/session': 'canAccessSessionPortal',
      '/nutritionist': 'canAccessNutritionPortal',
      '/admin': 'canManageUsers',
      '/reports': 'canViewReports',
      '/export': 'canExportData',
      '/plans': 'canCreatePlans',
    };

    const requiredPermission = resourcePermissionMap[resource];
    if (!requiredPermission) return true; // Allow access to unmapped resources

    return permissions.permissions[requiredPermission];
  },

  hasPermission: (permission: keyof RolePermissions['permissions']) => {
    const { permissions } = get();
    return permissions?.permissions[permission] ?? false;
  },

  updatePermissions: (role: UserRole) => {
    // Define role-based permissions
    const rolePermissions: Record<UserRole, RolePermissions> = {
      patient: {
        role: 'patient',
        permissions: {
          canViewDashboard: true,
          canAccessGaitPortal: true,
          canAccessSessionPortal: true,
          canAccessNutritionPortal: false,
          canManageUsers: false,
          canExportData: true,
          canViewReports: true,
          canCreatePlans: false,
        },
      },
      therapist: {
        role: 'therapist',
        permissions: {
          canViewDashboard: true,
          canAccessGaitPortal: true,
          canAccessSessionPortal: true,
          canAccessNutritionPortal: false,
          canManageUsers: false,
          canExportData: true,
          canViewReports: true,
          canCreatePlans: false,
        },
      },
      nutritionist: {
        role: 'nutritionist',
        permissions: {
          canViewDashboard: true,
          canAccessGaitPortal: false,
          canAccessSessionPortal: false,
          canAccessNutritionPortal: true,
          canManageUsers: false,
          canExportData: true,
          canViewReports: true,
          canCreatePlans: true,
        },
      },
      admin: {
        role: 'admin',
        permissions: {
          canViewDashboard: true,
          canAccessGaitPortal: true,
          canAccessSessionPortal: true,
          canAccessNutritionPortal: true,
          canManageUsers: true,
          canExportData: true,
          canViewReports: true,
          canCreatePlans: true,
        },
      },
    };

    set({ permissions: rolePermissions[role] });
  },
}));

// Selectors for easier access
export const usePermissions = () => useRoleStore(state => state.permissions);
export const useCanAccess = () => useRoleStore(state => state.canAccess);
export const useHasPermission = () => useRoleStore(state => state.hasPermission);
export const useUserRole = () => useRoleStore(state => state.permissions?.role);

// Permission check hooks for common use cases
export const useCanViewDashboard = () => useRoleStore(state => state.hasPermission('canViewDashboard'));
export const useCanAccessGait = () => useRoleStore(state => state.hasPermission('canAccessGaitPortal'));
export const useCanAccessSession = () => useRoleStore(state => state.hasPermission('canAccessSessionPortal'));
export const useCanAccessNutrition = () => useRoleStore(state => state.hasPermission('canAccessNutritionPortal'));
export const useCanManageUsers = () => useRoleStore(state => state.hasPermission('canManageUsers'));
export const useCanExportData = () => useRoleStore(state => state.hasPermission('canExportData'));
export const useCanCreatePlans = () => useRoleStore(state => state.hasPermission('canCreatePlans'));
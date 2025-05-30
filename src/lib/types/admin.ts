export interface AdminUser {
  id?: string;
  email: string;
  displayName: string;
  role: 'admin' | 'super-admin' | 'editor';
  permissions: string[];
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLogin?: string;
  createdBy?: string;
}

export const ADMIN_PERMISSIONS = [
  { id: 'read', name: 'View Dashboard & Data' },
  { id: 'write', name: 'Create & Edit Content' },
  { id: 'delete', name: 'Delete Content & Data' },
  { id: 'manage_users', name: 'Manage Customers' },
  { id: 'manage_orders', name: 'Manage Orders' },
  { id: 'manage_admins', name: 'Manage Admin Users' },
  { id: 'manage_settings', name: 'Modify Site Settings' },
];

export const ADMIN_ROLES = [
  { id: 'editor', name: 'Editor', description: 'Can view and edit content, but cannot delete or manage users' },
  { id: 'admin', name: 'Administrator', description: 'Full access to most features, excluding admin management' },
  { id: 'super-admin', name: 'Super Administrator', description: 'Complete access to all features' },
];

// Default permissions by role
export const DEFAULT_ROLE_PERMISSIONS = {
  'editor': ['read', 'write'],
  'admin': ['read', 'write', 'delete', 'manage_users', 'manage_orders', 'manage_settings'],
  'super-admin': ['read', 'write', 'delete', 'manage_users', 'manage_orders', 'manage_admins', 'manage_settings'],
};
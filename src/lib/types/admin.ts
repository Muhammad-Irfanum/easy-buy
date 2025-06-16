import { Timestamp } from 'firebase/firestore';

export type AdminRole = 'super-admin' | 'admin' | 'editor' | 'viewer';

export interface AdminUser {
  id?: string;
  uid: string;
  email: string;
  name: string;
  role: AdminRole;
  permissions: string[];
  active: boolean;
  createdAt?: string | Timestamp; // ISO string or Firestore Timestamp
  updatedAt?: string | Timestamp; // ISO string or Firestore Timestamp
  lastLogin?: string | Timestamp;
  createdBy?: string;
}

export interface AdminClaims {
  admin: boolean;
  role: AdminRole;
  permissions: string[];
}

// Permission sets by role
export const ROLE_PERMISSIONS: Record<AdminRole, string[]> = {
  'super-admin': [
    'read', 'write', 'delete', 
    'manage-users', 'manage-admins', 'manage-settings',
    'manage-products', 'manage-orders', 'manage-categories',
    'manage-brands', 'view-analytics'
  ],
  'admin': [
    'read', 'write', 'delete',
    'manage-users', 'manage-products', 'manage-orders', 
    'manage-categories', 'manage-brands'
  ],
  'editor': ['read', 'write', 'manage-products', 'manage-categories', 'manage-brands'],
  'viewer': ['read']
};
import { NextRequest } from "next/server";
import { adminAuth } from "./config";
import { AdminRole } from "@/lib/types/admin";


export interface AuthUser {
  uid: string;
  email?: string
  admin?: boolean;
  role?: AdminRole;
  permissions?: string[];
}

//verify admin token from request headers
export async function verifyAdminToken(
  req: NextRequest
): Promise<{ user: AuthUser | null; error?: string }> {
  try {
    // Get the authorization header
    const authHeader = req.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { 
        user: null, 
        error: 'Unauthorized: Missing or invalid token' 
      };
    }
     
    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Check if this user has admin privileges
    if (!decodedToken.admin) {
      return { 
        user: null, 
        error: 'Forbidden: User is not an admin' 
      };
    }

      // Return the user with admin details
    return {
      user: {
        uid: decodedToken.uid,
        email: decodedToken.email,
        admin: decodedToken.admin,
        role: decodedToken.role as AdminRole,
        permissions: decodedToken.permissions,
      }
    };
  } catch (error: unknown) {
    console.error('Admin token verification error:', error);
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return { 
      user: null, 
      error: `Authentication error: ${errorMessage}` 
    };
  }
}

// Check if user has the required permission
export function hasPermission(
  user: AuthUser | null, 
  permission: string
): boolean {
  if (!user || !user.admin) return false;
  
  // Super admins have all permissions
  if (user.role === 'super-admin') return true;
  
  // Otherwise check the specific permission
  return user.permissions?.includes(permission) || false;
}

// Set custom claims for a user to make them an admin
export async function setAdminClaims(
  uid: string,
  role: AdminRole,
  permissions: string[]
): Promise<void> {
  try {
    await adminAuth.setCustomUserClaims(uid, {
      admin: true,
      role,
      permissions
    });
    console.log(`Admin role ${role} set for user ${uid}`);
  } catch (error) {
    console.error('Error setting admin claims:', error);
    throw error;
  }
}
// Remove admin claims from a user
export async function removeAdminRole(uid: string): Promise<void> {
  try {
    await adminAuth.setCustomUserClaims(uid, { admin: false });
    console.log(`Admin role removed from user ${uid}`);
  } catch (error) {
    console.error('Error removing admin role:', error);
    throw error;
  }
}
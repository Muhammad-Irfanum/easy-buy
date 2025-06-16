import { adminAuth, adminDb } from '../admin/config';
import { AdminUser, ROLE_PERMISSIONS } from '@/lib/types/admin';

const ADMIN_COLLECTION = 'adminUsers';

// Get all admin users
export async function getAllAdmins(): Promise<AdminUser[]> {
  try {
    const snapshot = await adminDb
      .collection(ADMIN_COLLECTION)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AdminUser));
  } catch (error) {
    console.error('Error fetching admin users:', error);
    throw error;
  }
}

// Get admin by ID
export async function getAdminById(id: string): Promise<AdminUser | null> {
  try {
    const doc = await adminDb.collection(ADMIN_COLLECTION).doc(id).get();
    
    if (!doc.exists) return null;
    
    return {
      id: doc.id,
      ...doc.data()
    } as AdminUser;
  } catch (error) {
    console.error('Error fetching admin by ID:', error);
    throw error;
  }
}

// Get admin by Firebase UID
export async function getAdminByUid(uid: string): Promise<AdminUser | null> {
  try {
    const snapshot = await adminDb
      .collection(ADMIN_COLLECTION)
      .where('uid', '==', uid)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as AdminUser;
  } catch (error) {
    console.error('Error fetching admin by UID:', error);
    throw error;
  }
}

// Create a new admin user
export async function createAdmin(adminData: Omit<AdminUser, 'id'>): Promise<AdminUser> {
  try {
    // Check if the email is already registered as admin
    const userSnapshot = await adminDb
      .collection(ADMIN_COLLECTION)
      .where('email', '==', adminData.email.toLowerCase())
      .limit(1)
      .get();
    
    if (!userSnapshot.empty) {
      throw new Error('This email is already registered as an admin');
    }
    
    // Try to get existing Firebase user
    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(adminData.email);
    } catch (error) {
      // Create the user if not found
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).toUpperCase().slice(-4);
      userRecord = await adminAuth.createUser({
        email: adminData.email,
        displayName: adminData.name,
        password: randomPassword, // They can reset this with the password reset flow
        emailVerified: true,
      });
    }
    
    // Define permissions based on role
    const permissions = adminData.permissions || ROLE_PERMISSIONS[adminData.role];
    
    // Set custom claims
    await adminAuth.setCustomUserClaims(userRecord.uid, {
      admin: true,
      role: adminData.role,
      permissions: permissions
    });
    
    // Prepare the admin document
    const now = new Date().toISOString();
    
    const adminDoc: AdminUser = {
      uid: userRecord.uid,
      email: adminData.email.toLowerCase(),
      name: adminData.name,
      role: adminData.role,
      permissions: permissions,
      active: adminData.active !== undefined ? adminData.active : true,
      createdAt: now,
      updatedAt: now,
      createdBy: adminData.createdBy,
    };
    
    // Save to Firestore
    const docRef = await adminDb.collection(ADMIN_COLLECTION).add(adminDoc);
    
    // Return the created admin user
    return {
      id: docRef.id,
      ...adminDoc
    };
  } catch (error: unknown) {
    console.error('Error creating admin user:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to create admin user: ${error.message}`);
    } else {
      throw new Error('Failed to create admin user: Unknown error');
    }
  }
}

// Update an admin user
export async function updateAdmin(id: string, updates: Partial<AdminUser>): Promise<AdminUser> {
  try {
    // Get the existing admin
    const admin = await getAdminById(id);
    if (!admin) {
      throw new Error('Admin user not found');
    }
    
    // Update Firebase Auth user if needed
    if (updates.email || updates.name) {
      await adminAuth.updateUser(admin.uid, {
        email: updates.email,
        displayName: updates.name,
      });
    }
    
    // Update admin claims if role/permissions changed
    if (updates.role || updates.permissions) {
      // Define new permissions
      const permissions = updates.permissions || 
        (updates.role ? ROLE_PERMISSIONS[updates.role] : admin.permissions);
      
      // Set the updated claims
      await adminAuth.setCustomUserClaims(admin.uid, {
        admin: true,
        role: updates.role || admin.role,
        permissions: permissions
      });
      
      // Make sure to update the local record too
      if (updates.role) {
        updates.role = updates.role;
      }
      if (!updates.permissions) {
        updates.permissions = permissions;
      }
    }
    
    // Update Firestore
    await adminDb.collection(ADMIN_COLLECTION).doc(id).update({
      ...updates,
      updatedAt: new Date().toISOString()
    });
    
    // Get the updated admin
    const updatedAdmin = await getAdminById(id);
    if (!updatedAdmin) {
      throw new Error('Failed to retrieve updated admin user');
    }
    
    return updatedAdmin;
  } catch (error: unknown) {
    console.error('Error updating admin user:', error);
    if (error instanceof Error) {
      throw new Error(`Failed to update admin user: ${error.message}`);
    }else {
    throw new Error(`Failed to update admin user: `);
    }
  }
}

// Delete an admin user
export async function deleteAdmin(id: string): Promise<void> {
  try {
    // Get the admin user
    const admin = await getAdminById(id);
    if (!admin) {
      throw new Error('Admin user not found');
    }
    
    // Remove admin claims
    await adminAuth.setCustomUserClaims(admin.uid, { admin: false });
    
    // Delete from Firestore
    await adminDb.collection(ADMIN_COLLECTION).doc(id).delete();
  } catch (error: unknown) {
  if (error instanceof Error) {
    console.error('Error deleting admin user:', error.message);
  } else {
    console.error('Error deleting admin user: Unknown error');
  }
  }
}
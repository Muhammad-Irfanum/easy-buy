import { db } from '../config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';



import { AdminUser, DEFAULT_ROLE_PERMISSIONS } from '@/lib/types/admin';
import { auth } from '../config';

const COLLECTION_NAME = 'admins';

// Convert Firestore document to AdminUser
const convertDocToAdminUser = (doc: import('firebase/firestore').DocumentSnapshot): AdminUser => {
  const data = doc.data();
  if (!data) {
    throw new Error('Document data is undefined');
  }
  return {
    id: doc.id,
    email: data.email,
    displayName: data.displayName || '',
    role: data.role || 'admin',
    permissions: data.permissions || [],
    active: data.active ?? true,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    lastLogin: data.lastLogin instanceof Timestamp ? data.lastLogin.toDate().toISOString() : data.lastLogin,
    createdBy: data.createdBy || '',
  };
};

// Get all admin users
export const getAllAdminUsers = async (): Promise<AdminUser[]> => {
  try {
    const adminsRef = collection(db, COLLECTION_NAME);
    const q = query(adminsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(convertDocToAdminUser);
  } catch (error) {
    console.error('Error getting admin users:', error);
    throw error;
  }
};

// Get admin user by ID
export const getAdminUserById = async (id: string): Promise<AdminUser | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertDocToAdminUser(docSnap);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting admin user:', error);
    throw error;
  }
};

// Check if email is already an admin
export const isExistingAdminEmail = async (email: string): Promise<boolean> => {
  try {
    const adminsRef = collection(db, COLLECTION_NAME);
    const q = query(adminsRef, where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking admin email:', error);
    throw error;
  }
};

// Create a new admin user
export const createAdminUser = async (adminData: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminUser> => {
  try {
    // Check if email already exists
    const exists = await isExistingAdminEmail(adminData.email);
    if (exists) {
      throw new Error('An admin with this email already exists');
    }
    
    // Ensure email is lowercase for consistency
    const email = adminData.email.toLowerCase();
    
    // Set default permissions if not provided
    let permissions = adminData.permissions;
    if (!permissions || permissions.length === 0) {
      permissions = DEFAULT_ROLE_PERMISSIONS[adminData.role] || ['read'];
    }
    
    // Get current user as creator
    const currentUser = await getCurrentUser();
    
    // Create new admin data with timestamps
    const newAdminData = {
      ...adminData,
      email,
      permissions,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: currentUser?.uid || 'system',
    };
    
    // Use email as document ID for easy lookup
    const adminRef = doc(collection(db, COLLECTION_NAME), email.replace(/[^a-zA-Z0-9]/g, '_'));
    await setDoc(adminRef, newAdminData);
    
    // Get the saved document with the ID
    const savedAdmin = await getDoc(adminRef);
    return convertDocToAdminUser(savedAdmin);
  } catch (error) {
    console.error('Error creating admin user:', error);
    throw error;
  }
};

// Update an admin user
export const updateAdminUser = async (id: string, adminData: Partial<AdminUser>): Promise<AdminUser> => {
  try {
    // Update admin data
    const updateData = {
      ...adminData,
      updatedAt: serverTimestamp(),
    };
    
    const adminRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(adminRef, updateData);
    
    // Get updated admin
    const updatedAdmin = await getDoc(adminRef);
    if (!updatedAdmin.exists()) {
      throw new Error('Admin user not found after update');
    }
    
    return convertDocToAdminUser(updatedAdmin);
  } catch (error) {
    console.error('Error updating admin user:', error);
    throw error;
  }
};

// Delete an admin user
export const deleteAdminUser = async (id: string): Promise<void> => {
  try {
    // Get the admin to check if it's a super-admin
    const adminRef = doc(db, COLLECTION_NAME, id);
    const adminDoc = await getDoc(adminRef);
    
    if (!adminDoc.exists()) {
      throw new Error('Admin user not found');
    }
    
    const adminData = adminDoc.data();
    
    // Prevent deleting the last super-admin
    if (adminData.role === 'super-admin') {
      // Count super-admins
      const adminsRef = collection(db, COLLECTION_NAME);
      const q = query(adminsRef, where('role', '==', 'super-admin'));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.size <= 1) {
        throw new Error('Cannot delete the only super-admin. Create another super-admin first.');
      }
    }
    
    // Delete the admin
    await deleteDoc(adminRef);
  } catch (error) {
    console.error('Error deleting admin user:', error);
    throw error;
  }
};

// Create admin with Firebase Auth account
export const createAdminWithAccount = async (email: string, password: string, adminData: Omit<AdminUser, 'id' | 'email' | 'createdAt' | 'updatedAt'>): Promise<AdminUser> => {
  try {
    // First create the Firebase Auth account
    // const userCredential = await createUserWithEmail(email, password);
    // const uid = userCredential.user.uid;
    
    // Then create the admin record in Firestore
    const newAdmin: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'> = {
      email: email.toLowerCase(),
      displayName: adminData.displayName,
      role: adminData.role,
      permissions: adminData.permissions,
      active: adminData.active ?? true,
    };
    
    return await createAdminUser(newAdmin);
  } catch (error) {
    console.error('Error creating admin with account:', error);
    throw error;
  }
};

// Search admin users
export const searchAdminUsers = async (searchTerm: string): Promise<AdminUser[]> => {
  try {
    // Since Firestore doesn't support native text search, we'll get all admins and filter
    const admins = await getAllAdminUsers();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return admins.filter(admin => 
      admin.email.toLowerCase().includes(lowerSearchTerm) ||
      admin.displayName.toLowerCase().includes(lowerSearchTerm) ||
      admin.role.toLowerCase().includes(lowerSearchTerm)
    );
  } catch (error) {
    console.error('Error searching admin users:', error);
    throw error;
  }
};

// Update the auth function to include admin check
export const getCurrentUser = async () => {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('User not authenticated');
  }
  return currentUser;
};
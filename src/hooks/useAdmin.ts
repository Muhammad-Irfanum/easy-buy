'use client';

import { useState, useEffect } from 'react';

import { AdminUser } from '@/lib/types/admin';
import { 
  collection, 
  doc, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase/config';
import { useAuth } from '@/providers/AuthProvider';

interface UseAdminResult {
  isAdmin: boolean;
  adminRole: AdminUser | null;
  adminLoading: boolean;
  hasPermission: (permission: string) => boolean;
}

export function useAdmin(): UseAdminResult {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [adminRole, setAdminRole] = useState<AdminUser | null>(null);
  const [adminLoading, setAdminLoading] = useState<boolean>(true);
  
  // Admin cache to avoid repeated DB queries
  const adminCache = new Map<string, AdminUser | null>();

  // Check if a user has admin privileges
  const checkAdminStatus = async (email: string): Promise<AdminUser | null> => {
    // Return from cache if available
    if (adminCache.has(email)) {
      return adminCache.get(email) || null;
    }
    
    try {
      // Query admin document by email
      const adminsRef = collection(db, 'admins');
      const q = query(adminsRef, where('email', '==', email.toLowerCase()));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        // Get the first matching admin document
        const adminDoc = querySnapshot.docs[0];
        const adminData = adminDoc.data() as AdminUser;
        
        // Add id to the admin data
        const adminWithId: AdminUser = {
          ...adminData,
          id: adminDoc.id
        };
        
        // Update last login timestamp
        await updateDoc(doc(db, 'admins', adminDoc.id), {
          lastLogin: serverTimestamp()
        });
        
        // Cache the result
        adminCache.set(email, adminWithId);
        
        return adminWithId;
      }
      
      // Not an admin
      adminCache.set(email, null);
      return null;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return null;
    }
  };

  useEffect(() => {
    async function checkAdmin() {
      if (!user) {
        setIsAdmin(false);
        setAdminRole(null);
        setAdminLoading(false);
        return;
      }

      try {
        // Check if user email exists in admins collection
        if (user.email) {
          const adminData = await checkAdminStatus(user.email);
          
          if (adminData && adminData.active) {
            setIsAdmin(true);
            setAdminRole(adminData);
          } else {
            setIsAdmin(false);
            setAdminRole(null);
          }
        } else {
          setIsAdmin(false);
          setAdminRole(null);
        }
      } catch (error) {
        console.error('Error determining admin status:', error);
        setIsAdmin(false);
        setAdminRole(null);
      } finally {
        setAdminLoading(false);
      }
    }

    if (!loading) {
      checkAdmin();
    }
  }, [user, loading]);

  // Function to check if the admin has a specific permission
  const hasPermission = (permission: string): boolean => {
    if (!adminRole || !adminRole.permissions) {
      return false;
    }
    
    return adminRole.permissions.includes(permission);
  };

  return { isAdmin, adminRole, adminLoading, hasPermission };
}
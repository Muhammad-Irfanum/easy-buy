'use client';

import { useState, useEffect } from 'react';

import { AdminUser } from '@/lib/types/admin';
import { useAuth } from '@/providers/AuthProvider';

export function useAdminUsers() {
  const { user, getIdToken } = useAuth(); 
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch all admins
  const fetchAdmins = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = await getIdToken();
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch admins');
      }
      
      const data = await response.json();
      setAdmins(data.admins);
    } catch (error: unknown) {
      setError(error.message);
      console.error('Error fetching admins:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get a single admin by ID
  const getAdmin = async (id: string) => {
    try {
      const token = await getIdT oken();
      const response = await fetch(`/api/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to fetch admin');
      }
      
      return await response.json();
    } catch (error: any) {
      console.error(`Error fetching admin ${id}:`, error);
      throw error;
    }
  };

  // Create a new admin
  const createAdmin = async (adminData: Omit<AdminUser, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => {
    try {
      const token = await getIdToken();
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create admin');
      }
      
      const newAdmin = await response.json();
      await fetchAdmins(); // Refresh the list
      return newAdmin;
    } catch (error: any) {
      console.error('Error creating admin:', error);
      throw error;
    }
  };

  // Update an admin
  const updateAdmin = async (id: string, adminData: Partial<AdminUser>) => {
    try {
      const token = await getIdToken();
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(adminData)
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update admin');
      }
      
      const updatedAdmin = await response.json();
      await fetchAdmins(); // Refresh the list
      return updatedAdmin;
    } catch (error: any) {
      console.error(`Error updating admin ${id}:`, error);
      throw error;
    }
  };

  // Delete an admin
  const deleteAdmin = async (id: string) => {
    try {
      const token = await getIdToken();
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete admin');
      }
      
      await fetchAdmins(); // Refresh the list
      return true;
    } catch (error: any) {
      console.error(`Error deleting admin ${id}:`, error);
      throw error;
    }
  };

  // Load admins on component mount
  useEffect(() => {
    if (user) {
      fetchAdmins();
    }
  }, [user]);

  return {
    admins,
    loading,
    error,
    fetchAdmins,
    getAdmin,
    createAdmin,
    updateAdmin,
    deleteAdmin
  };
}
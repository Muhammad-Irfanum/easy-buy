'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';


export function useProtectedRoute(requiredPermission?: string) {
  const router = useRouter();
  const { user, loading, userClaims } = useAuth(); // Adjust based on your auth hook
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // If still loading, do nothing yet
    if (loading) return;

    // If not logged in, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if user is an admin
    if (!userClaims?.admin) {
      router.push('/unauthorized');
      return;
    }

    // If specific permission is required, check for it
    if (requiredPermission) {
      // Super-admin has all permissions
      const hasSuperAdmin = userClaims.role === 'super-admin';
      
      // Check specific permission
      const hasRequiredPermission = userClaims.permissions?.includes(requiredPermission);
      
      if (!hasSuperAdmin && !hasRequiredPermission) {
        router.push('/unauthorized');
        return;
      }
    }

    // User is authorized
    setAuthorized(true);
  }, [user, loading, userClaims, router, requiredPermission]);

  return { authorized, loading };
}
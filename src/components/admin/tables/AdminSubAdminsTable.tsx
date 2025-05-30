'use client';

import { useState } from 'react';
import Link from 'next/link';
import { EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import { cn } from '@/lib/utils';
import DeleteConfirmation from '@/components/admin/modals/DeleteConfirmation';
import { AdminUser } from '@/lib/types/admin';
import { deleteAdminUser } from '@/lib/firebase/admin/adminUserService';
import toast from 'react-hot-toast';

interface AdminUsersTableProps {
  isLoading?: boolean;
  adminUsers: AdminUser[];
  onAdminDeleted?: (adminId: string) => void;
  currentAdminId: string;
}

export default function AdminUsersTable({
  isLoading = false,
  adminUsers = [],
  onAdminDeleted,
  currentAdminId,
}: AdminUsersTableProps) {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState<string | null>(null);
  const [deletingAdmin, setDeletingAdmin] = useState<boolean>(false);

  const handleDeleteClick = (adminId: string) => {
    setAdminToDelete(adminId);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (adminToDelete) {
      try {
        setDeletingAdmin(true);
        await deleteAdminUser(adminToDelete);
        
        // Call the callback to update the parent component state
        if (onAdminDeleted) {
          onAdminDeleted(adminToDelete);
        }
        
        toast.success('Admin user deleted successfully');
        setDeleteModalOpen(false);
        setAdminToDelete(null);
      } catch (error: unknown) {
        if (error instanceof Error) {
          toast.error(`Failed to delete admin user: ${error.message}`);
        }
      } finally {
        setDeletingAdmin(false);
      }
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'super-admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'admin':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'editor':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="px-6 py-4 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 animate-pulse rounded"></div>
              ))}
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Admin User
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Role
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                  >
                    Last Login
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {adminUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                      No admin users found.
                    </td>
                  </tr>
                ) : (
                  adminUsers.map((admin) => {
                    // Check if this is the current admin user
                    const isCurrentUser = admin.id === currentAdminId;
                    
                    return (
                      <tr key={admin.id} className={isCurrentUser ? "bg-blue-50 dark:bg-blue-900/10" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-gray-600 dark:text-gray-300 font-medium text-sm">
                                {admin.displayName.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {admin.displayName}
                                {isCurrentUser && (
                                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">(You)</span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {admin.email}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span 
                            className={cn(
                              'px-2 inline-flex text-xs leading-5 font-medium rounded-full',
                              getRoleBadgeClass(admin.role)
                            )}
                          >
                            {admin.role === 'super-admin' ? 'Super Admin' : 
                             admin.role === 'admin' ? 'Administrator' : 
                             'Editor'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={cn(
                              'px-2 inline-flex text-xs leading-5 font-medium rounded-full',
                              admin.active
                                ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-400'
                                : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                            )}
                          >
                            {admin.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                          {admin.lastLogin ? new Date(admin.lastLogin).toLocaleString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              href={`/admin/users/${admin.id}`}
                              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                            >
                              <EyeIcon className="h-5 w-5" />
                              <span className="sr-only">View</span>
                            </Link>
                            
                            <Link
                              href={`/admin/users/${admin.id}/edit`}
                              className="text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                            >
                              <PencilSquareIcon className="h-5 w-5" />
                              <span className="sr-only">Edit</span>
                            </Link>
                            
                            {/* Don't allow deleting self or if only one super-admin */}
                            {!isCurrentUser && (
                              <button
                                onClick={() => handleDeleteClick(admin.id!)}
                                className="text-red-400 hover:text-red-500 dark:hover:text-red-300"
                                disabled={deletingAdmin || isCurrentUser}
                              >
                                <TrashIcon className="h-5 w-5" />
                                <span className="sr-only">Delete</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Admin User"
        message="Are you sure you want to delete this admin user? They will lose all access to the admin dashboard."
        isLoading={deletingAdmin}
      />
    </>
  );
}
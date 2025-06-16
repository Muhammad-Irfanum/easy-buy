"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  TrashIcon,
  KeyIcon,
  CalendarIcon,
  UserIcon,
  CheckBadgeIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";
import DeleteConfirmation from "@/components/admin/modals/DeleteConfirmation";
import toast from "react-hot-toast";
import { AdminUser, ADMIN_PERMISSIONS } from "@/lib/types/admin";

import { useAdmin } from "@/hooks/useAdmin";
import {
  deleteAdminUser,
  getAdminUserById,
} from "@/lib/firebase/services/adminUserService";

export default function AdminUserDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { adminRole } = useAdmin();
  const adminId = params.adminId as string;

  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingAdmin, setDeletingAdmin] = useState<boolean>(false);

  // Check if user is super-admin
  const isSuperAdmin = adminRole?.role === "super-admin";
  const isCurrentUser = adminRole?.id === adminId;

  // Fetch admin data
  useEffect(() => {
    const fetchAdminUser = async () => {
      if (!isSuperAdmin) {
        // Only super-admins can view admin details
        setIsLoading(false);
        return;
      }

      try {
        const data = await getAdminUserById(adminId);
        setAdminUser(data);
      } catch (error) {
        console.error("Error fetching admin user:", error);
        toast.error("Failed to load admin details.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminUser();
  }, [adminId, isSuperAdmin]);

  const handleDelete = async () => {
    try {
      setDeletingAdmin(true);
      await deleteAdminUser(adminId);

      toast.success("Admin user deleted successfully");
      router.push("/admin/users");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error deleting admin user:", error);
        toast.error(`Failed to delete admin user: ${error.message}`);
      }
    } finally {
      setDeletingAdmin(false);
      setDeleteModalOpen(false);
    }
  };

  // Access denied if not super-admin
  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 p-4 rounded-md mb-4">
          <p className="font-medium">Access Restricted</p>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          You don&apos;t have permission to view admin user details. This area
          is restricted to Super Administrators.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!adminUser) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Admin user not found
        </h3>
        <div className="mt-4">
          <Link
            href="/admin/users"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Admin Users
          </Link>
        </div>
      </div>
    );
  }

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "super-admin":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "admin":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "editor":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with navigation and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/admin/users"
            className="mr-4 p-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin User Details
          </h1>
        </div>

        <div className="flex space-x-3">
          <Link
            href={`/admin/users/${adminId}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PencilSquareIcon
              className="mr-2 -ml-1 h-5 w-5"
              aria-hidden="true"
            />
            Edit
          </Link>

          {/* Don't show delete button for current user */}
          {!isCurrentUser && (
            <button
              onClick={() => setDeleteModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <TrashIcon className="mr-2 -ml-1 h-5 w-5" aria-hidden="true" />
              Delete
            </button>
          )}
        </div>
      </div>

      {/* Admin user details */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden rounded-lg">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              {adminUser.displayName}
              {isCurrentUser && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  (You)
                </span>
              )}
            </h3>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(
                  adminUser.role
                )}`}
              >
                {adminUser.role === "super-admin"
                  ? "Super Admin"
                  : adminUser.role === "admin"
                  ? "Administrator"
                  : "Editor"}
              </span>

              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  adminUser.active
                    ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                    : "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300"
                }`}
              >
                {adminUser.active ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700">
          <dl>
            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <UserIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                Display Name
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {adminUser.displayName}
              </dd>
            </div>

            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <KeyIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                Email
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {adminUser.email}
              </dd>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <ShieldCheckIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                Role
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(
                    adminUser.role
                  )}`}
                >
                  {adminUser.role === "super-admin"
                    ? "Super Administrator"
                    : adminUser.role === "admin"
                    ? "Administrator"
                    : "Editor"}
                </span>
              </dd>
            </div>

            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Status
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {adminUser.active ? "Active" : "Inactive"}
              </dd>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
                Last Login
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {adminUser.lastLogin
                  ? new Date(adminUser.lastLogin).toLocaleString()
                  : "Never logged in"}
              </dd>
            </div>

            <div className="bg-white dark:bg-gray-800 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Created At
              </dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white sm:mt-0 sm:col-span-2">
                {adminUser.createdAt
                  ? new Date(adminUser.createdAt).toLocaleString()
                  : "Unknown"}
              </dd>
            </div>
          </dl>
        </div>

        {/* Permissions */}
        <div className="px-4 py-5 sm:px-6">
          <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-4 flex items-center">
            <CheckBadgeIcon className="h-5 w-5 mr-2 text-gray-400 dark:text-gray-500" />
            Permissions
          </h4>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {ADMIN_PERMISSIONS.map((permission) => (
              <div key={permission.id} className="flex items-center">
                <div
                  className={`h-5 w-5 mr-2 ${
                    adminUser.permissions.includes(permission.id)
                      ? "text-green-500 dark:text-green-400"
                      : "text-gray-300 dark:text-gray-600"
                  }`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span
                  className={`text-sm ${
                    adminUser.permissions.includes(permission.id)
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                >
                  {permission.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <DeleteConfirmation
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Admin User"
        message={`Are you sure you want to delete the admin user "${adminUser.displayName}"? They will lose all access to the admin dashboard.`}
        isLoading={deletingAdmin}
      />
    </div>
  );
}

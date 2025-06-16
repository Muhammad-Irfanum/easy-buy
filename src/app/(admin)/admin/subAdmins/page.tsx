"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { PlusIcon } from "@heroicons/react/24/outline";
import { useAdmin } from "@/hooks/useAdmin";
import {
  getAllAdminUsers,
  searchAdminUsers,
} from "@/lib/firebase/services/adminUserService";
import { AdminUser } from "@/lib/types/admin";
import toast from "react-hot-toast";
import AdminUsersTable from "@/components/admin/tables/AdminSubAdminsTable";

export default function AdminUsersPage() {
  const { adminRole } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [filteredAdmins, setFilteredAdmins] = useState<AdminUser[]>([]);

  // Check if user is super-admin
  const isSuperAdmin = adminRole?.role === "super-admin";

  // Fetch admins from Firestore
  useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true);
      try {
        const data = await getAllAdminUsers();
        setAdmins(data);
        setFilteredAdmins(data);
      } catch (error) {
        console.error("Error fetching admin users:", error);
        toast.error("Failed to load admin users");
      } finally {
        setIsLoading(false);
      }
    };

    if (isSuperAdmin) {
      fetchAdmins();
    } else {
      setIsLoading(false);
    }
  }, [isSuperAdmin]);

  // Handle search
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        setFilteredAdmins(admins);
        return;
      }

      try {
        const results = await searchAdminUsers(searchQuery);
        setFilteredAdmins(results);
      } catch (error) {
        console.error("Error searching admin users:", error);
        toast.error("Search failed. Please try again.");
      }
    };

    // Use debounce to avoid too many search requests
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, admins]);

  // Check access permission
  if (!isSuperAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 p-4 rounded-md mb-4">
          <p className="font-medium">Access Restricted</p>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          You dont have permission to manage admin users. This area is
          restricted to Super Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Admin Users
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Manage administrators who can access the dashboard
          </p>
        </div>
        <Link
          href="/admin/users/new"
          className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <PlusIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
          Add Admin User
        </Link>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5">
        <div className="w-full sm:max-w-xs">
          <label htmlFor="search" className="sr-only">
            Search
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <input
              id="search"
              name="search"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-800 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search admins"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Admin Users Table */}
      <AdminUsersTable
        isLoading={isLoading}
        adminUsers={filteredAdmins}
        onAdminDeleted={(adminId) => {
          setAdmins((prev) => prev.filter((admin) => admin.id !== adminId));
        }}
        currentAdminId={adminRole?.id || ""}
      />
    </div>
  );
}

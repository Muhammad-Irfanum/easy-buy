"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

import { PlusIcon } from "@heroicons/react/24/outline";
// import { useAdmin } from '@/hooks/useAdmin';

import { Category } from "@/lib/types/category";
import toast from "react-hot-toast";
import {
  getAllCategories,
  searchCategories,
} from "@/lib/firebase/services/categoryService";
import AdminCategoriesTable from "@/components/admin/tables/AdminCategoriesTable";

export default function CategoriesPage() {
  // const { adminRole } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);

  // Determine if user can create categories
  // const canCreateCategories = adminRole?.permissions?.includes('write') || false;

  const canCreateCategories = true; // Replace with: adminRole?.permissions?.includes('write') || false;

  // Fetch categories from Firestore
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const data = await getAllCategories();
        setCategories(data);
        setFilteredCategories(data);
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Handle search
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        setFilteredCategories(categories);
        return;
      }

      try {
        const results = await searchCategories(searchQuery);
        setFilteredCategories(results);
      } catch (error) {
        console.error("Error searching categories:", error);
        toast.error("Search failed. Please try again.");
      }
    };

    // Use debounce to avoid too many search requests
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, categories]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Categories
        </h1>
        {canCreateCategories && (
          <Link
            href="/admin/categories/new"
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
            Add Category
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-grow">
            <input
              type="text"
              name="search"
              id="search"
              placeholder="Search categories..."
              className="block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white p-4"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Categories Table */}
      <AdminCategoriesTable
        isLoading={isLoading}
        categories={filteredCategories}
        // canEdit={adminRole?.permissions?.includes('write') || false}
        // canDelete={adminRole?.permissions?.includes('delete') || false}
        onCategoryDeleted={(categoryId) => {
          setCategories((prev) =>
            prev.filter((category) => category.id !== categoryId)
          );
        }}
      />
    </div>
  );
}

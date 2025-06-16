"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminBrandsTable from "@/components/admin/tables/AdminBrandsTable";
import { PlusIcon } from "@heroicons/react/24/outline";
// import { useAdmin } from '@/hooks/useAdmin';

import { Brand } from "@/lib/types/brand";
import toast from "react-hot-toast";
import {
  getAllBrands,
  searchBrands,
} from "@/lib/firebase/services/brandService";

export default function BrandsPage() {
  // const { adminRole } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filteredBrands, setFilteredBrands] = useState<Brand[]>([]);

  // Determine if user can create brands
  // const canCreateBrands = adminRole?.permissions?.includes('write') || false;

  // TODO: Replace with real permission check when adminRole is available
  const canCreateBrands = true;

  // Fetch brands from Firestore
  useEffect(() => {
    const fetchBrands = async () => {
      setIsLoading(true);
      try {
        const data = await getAllBrands();
        setBrands(data);
        setFilteredBrands(data);
      } catch (error) {
        console.error("Error fetching brands:", error);
        toast.error("Failed to load brands");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

  // Handle search
  useEffect(() => {
    const handleSearch = async () => {
      if (!searchQuery.trim()) {
        setFilteredBrands(brands);
        return;
      }

      try {
        const results = await searchBrands(searchQuery);
        setFilteredBrands(results);
      } catch (error) {
        console.error("Error searching brands:", error);
        toast.error("Search failed. Please try again.");
      }
    };

    // Use debounce to avoid too many search requests
    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, brands]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Brands
        </h1>
        {canCreateBrands && (
          <Link
            href="/admin/brands/new"
            className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <PlusIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
            Add Brand
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
              placeholder="Search brands..."
              className="block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Brands Table */}
      <AdminBrandsTable
        isLoading={isLoading}
        brands={filteredBrands}
        // canEdit={adminRole?.permissions?.includes('write') || false}
        // canDelete={adminRole?.permissions?.includes('delete') || false}
        onBrandDeleted={(brandId) => {
          setBrands((prev) => prev.filter((brand) => brand.id !== brandId));
        }}
      />
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import AdminProductsTable from "@/components/admin/tables/AdminProductsTable";
import {
  PlusIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { useAdmin } from "@/hooks/useAdmin";

import { Product } from "@/lib/types/product";
import { Category } from "@/lib/types/category";
import { Brand } from "@/lib/types/brand";
import toast from "react-hot-toast";
import {
  getAllProducts,
  searchProducts,
} from "@/lib/firebase/services/productService";
import { getActiveBrands } from "@/lib/firebase/services/brandService";
import { getActiveCategories } from "@/lib/firebase/services/categoryService";

export default function ProductsPage() {
  const { adminRole } = useAdmin();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  // Filter states
  const [categoryFilter, setCategoryFilter] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [inventoryFilter, setInventoryFilter] = useState("all");

  // Determine if user can create products
  const canCreateProducts = adminRole?.permissions?.includes("write") || true;
  const canEditProducts = adminRole?.permissions?.includes("write") || true;
  const canDeleteProducts = adminRole?.permissions?.includes("delete") || true;

  // Fetch products, categories, and brands
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [productsData, categoriesData, brandsData] = await Promise.all([
          getAllProducts(100),
          getActiveCategories(),
          getActiveBrands(),
        ]);
        setProducts(productsData);
        setFilteredProducts(productsData);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search and filters
  useEffect(() => {
    const filterProducts = async () => {
      try {
        let results = [...products];

        // Apply search filter
        if (searchQuery) {
          results = await searchProducts(searchQuery);
        }

        // Apply category filter
        if (categoryFilter) {
          results = results.filter(
            (product) => product.categoryId === categoryFilter
          );
        }

        // Apply brand filter
        if (brandFilter) {
          results = results.filter(
            (product) => product.brandId === brandFilter
          );
        }

        // Apply status filter
        if (statusFilter !== "all") {
          results = results.filter(
            (product) => product.status === statusFilter
          );
        }

        // Apply inventory filter
        if (inventoryFilter === "in-stock") {
          results = results.filter((product) => product.inventoryQuantity > 0);
        } else if (inventoryFilter === "out-of-stock") {
          results = results.filter(
            (product) => product.inventoryQuantity === 0
          );
        } else if (inventoryFilter === "low-stock") {
          results = results.filter(
            (product) =>
              product.inventoryQuantity > 0 && product.inventoryQuantity <= 10
          );
        }

        setFilteredProducts(results);
      } catch (error) {
        console.error("Error filtering products:", error);
      }
    };

    filterProducts();
  }, [
    products,
    searchQuery,
    categoryFilter,
    brandFilter,
    statusFilter,
    inventoryFilter,
  ]);

  // Reset filters
  const handleResetFilters = () => {
    setCategoryFilter("");
    setBrandFilter("");
    setStatusFilter("all");
    setInventoryFilter("all");
    setSearchQuery("");
  };

  // Refresh products
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const productsData = await getAllProducts(100);
      setProducts(productsData);
      setFilteredProducts(productsData);
      toast.success("Products refreshed");
    } catch (error) {
      console.error("Error refreshing products:", error);
      toast.error("Failed to refresh products");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle product deletion
  const handleProductDeleted = (productId: string) => {
    setProducts((prevProducts) =>
      prevProducts.filter((p) => p.id !== productId)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Products
        </h1>
        <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={handleRefresh}
            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
          {canCreateProducts && (
            <Link
              href="/admin/products/new"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <PlusIcon className="-ml-1 mr-2 h-4 w-4" aria-hidden="true" />
              Add Product
            </Link>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-5">
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              placeholder="Search products..."
              className="block w-full pl-10 rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FunnelIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
            Filters
          </button>
          {(categoryFilter ||
            brandFilter ||
            statusFilter !== "all" ||
            inventoryFilter !== "all") && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <XMarkIcon className="-ml-1 mr-2 h-5 w-5 text-gray-400" />
              Clear Filters
            </button>
          )}
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 gap-y-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-x-6 sm:gap-y-0">
            <div>
              <label
                htmlFor="category"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="brand"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Brand
              </label>
              <select
                id="brand"
                name="brand"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
              >
                <option value="">All Brands</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="inventory"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Inventory
              </label>
              <select
                id="inventory"
                name="inventory"
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-700 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                value={inventoryFilter}
                onChange={(e) => setInventoryFilter(e.target.value)}
              >
                <option value="all">All Products</option>
                <option value="in-stock">In Stock</option>
                <option value="out-of-stock">Out of Stock</option>
                <option value="low-stock">Low Stock (≤ 10)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Products Table */}
      <AdminProductsTable
        isLoading={isLoading}
        products={filteredProducts}
        canEdit={canEditProducts}
        canDelete={canDeleteProducts}
        onProductDeleted={handleProductDeleted}
        searchQuery={searchQuery}
      />
    </div>
  );
}

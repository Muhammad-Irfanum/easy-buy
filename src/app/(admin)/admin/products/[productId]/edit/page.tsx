"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import ProductForm from "@/components/admin/forms/ProductForm";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import toast from "react-hot-toast";
import { Product } from "@/lib/types/product";

import { useAdmin } from "@/hooks/useAdmin";
import { getProductById } from "@/lib/firebase/services/productService";

export default function EditProductPage() {
  const params = useParams();

  // const { adminRole, hasPermission } = useAdmin();
  const { hasPermission } = useAdmin();
  const productId = params.productId as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check if user can edit products
  const canEditProducts = hasPermission("write");

  // Fetch product data from Firestore
  useEffect(() => {
    const fetchProduct = async () => {
      if (!canEditProducts) {
        // User doesn't have permission to edit products
        setIsLoading(false);
        return;
      }

      try {
        const data = await getProductById(productId);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId, canEditProducts]);

  // Access denied if user can't edit products
  if (!canEditProducts) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 p-4 rounded-md mb-4">
          <p className="font-medium">Access Restricted</p>
        </div>
        <p className="text-gray-600 dark:text-gray-400 max-w-md">
          You don&apos;t have permission to edit products. Please contact an
          administrator.
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

  if (!product) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          Product not found
        </h3>
        <div className="mt-4">
          <Link
            href="/admin/products"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Return to Products
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link
          href="/admin/products"
          className="mr-4 p-1 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <ArrowLeftIcon className="h-5 w-5" aria-hidden="true" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Product
        </h1>
      </div>

      <ProductForm initialData={product} isEditing={true} />
    </div>
  );
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { SwitchField } from "@/components/ui/SwitchField";
import toast from "react-hot-toast";
import {
  Product,
  ProductImage,
  ProductOption,
  ProductVariant,
  PRODUCT_STATUS_OPTIONS,
  WEIGHT_UNITS,
  DIMENSION_UNITS,
} from "@/lib/types/product";
import { v4 as uuidv4 } from "uuid";
import {
  XMarkIcon,
  PlusIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import { getActiveCategories } from "@/lib/firebase/services/categoryService";
import { getActiveBrands } from "@/lib/firebase/services/brandService";
import {
  createProduct,
  generateUniqueSlug,
  updateProduct,
} from "@/lib/firebase/services/productService";
import { Category } from "@/lib/types/category";
import { Brand } from "@/lib/types/brand";

interface ProductFormProps {
  initialData?: Product;
  isEditing?: boolean;
}

export default function ProductForm({
  initialData,
  isEditing = false,
}: ProductFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [activeTab, setActiveTab] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [visibleSpecs, setVisibleSpecs] = useState(true);
  const [visibleOptions, setVisibleOptions] = useState(true);
  const [visibleVariants, setVisibleVariants] = useState(true);
  const [visibleMeta, setVisibleMeta] = useState(true);
  const [visibleShipping, setVisibleShipping] = useState(true);

  // Initialize empty form data
  const emptyProductData: Product = {
    title: "",
    slug: "",
    description: "",
    price: 0,
    compareAtPrice: undefined,
    costPrice: undefined,
    sku: "",
    barcode: "",
    inventoryQuantity: 0,
    trackInventory: true,
    categoryId: "",
    brandId: "",
    images: [],
    options: [],
    variants: [],
    specifications: [],
    status: "draft",
    featured: false,
    tags: [],
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    weight: undefined,
    weightUnit: "kg",
    dimensions: undefined,
    relatedProductIds: [],
    tax: { taxable: false },
  };

  const [formData, setFormData] = useState<Product>(emptyProductData);
  const [newTag, setNewTag] = useState("");
  const [newOptionName, setNewOptionName] = useState("");
  const [newOptionValue, setNewOptionValue] = useState("");
  const [newSpecName, setNewSpecName] = useState("");
  const [newSpecValue, setNewSpecValue] = useState("");

  // Fetch categories and brands
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [categoriesData, brandsData] = await Promise.all([
          getActiveCategories(),
          getActiveBrands(),
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);
      } catch (error) {
        console.error("Error fetching categories or brands:", error);
        toast.error("Failed to load categories or brands");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize form with initial data if editing
  useEffect(() => {
    if (isEditing && initialData) {
      setFormData(initialData);
    }
  }, [isEditing, initialData]);

  // Update category name when categoryId changes
  useEffect(() => {
    if (formData.categoryId) {
      const category = categories.find((cat) => cat.id === formData.categoryId);
      if (category && category.name !== formData.categoryName) {
        setFormData((prev) => ({
          ...prev,
          categoryName: category.name,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        categoryName: undefined,
      }));
    }
  }, [formData.categoryId, categories, formData.categoryName]);

  // Update brand name when brandId changes
  useEffect(() => {
    if (formData.brandId) {
      const brand = brands.find((b) => b.id === formData.brandId);
      if (brand && brand.name !== formData.brandName) {
        setFormData((prev) => ({
          ...prev,
          brandName: brand.name,
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        brandName: undefined,
      }));
    }
  }, [formData.brandId, brands, formData.brandName]);

  // Auto-generate variants when options change
  useEffect(() => {
    if (formData.options.length > 0) {
      generateVariants();
    }
  }, [formData.options]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Special handling for numeric fields
    if (
      [
        "price",
        "compareAtPrice",
        "costPrice",
        "inventoryQuantity",
        "weight",
      ].includes(name)
    ) {
      const numValue = parseFloat(value);
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue,
      }));
      return;
    }

    // Generate slug from title if name field is changed and we're not in edit mode
    if (name === "title" && !isEditing) {
      const slugifiedTitle = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        slug: slugifiedTitle,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleTaxableChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      tax: {
        ...prev.tax,
        taxable: checked,
      },
    }));
  };

  const handleDimensionsChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    const numValue = name !== "unit" ? parseFloat(value) : value;

    setFormData((prev) => ({
      ...prev,
      dimensions: {
        ...(prev.dimensions || { length: 0, width: 0, height: 0, unit: "cm" }),
        [name]: name !== "unit" && isNaN(numValue as number) ? 0 : numValue,
      },
    }));
  };

  // Handle adding a new tag
  const handleAddTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, newTag.trim()],
      });
      setNewTag("");
    }
  };

  // Handle removing a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove),
    });
  };

  // Handle image URL changes
  const handleImageUrlChange = (imageUrl: string) => {
    if (imageUrl.trim()) {
      const newImage: ProductImage = {
        id: uuidv4(),
        url: imageUrl,
        alt: formData.title,
        isDefault: formData.images.length === 0, // First image is default
        sortOrder: formData.images.length,
      };

      setFormData({
        ...formData,
        images: [...formData.images, newImage],
      });
    }
  };

  // Handle setting default image
  const handleSetDefaultImage = (imageId: string) => {
    setFormData({
      ...formData,
      images: formData.images.map((image) => ({
        ...image,
        isDefault: image.id === imageId,
      })),
    });
  };

  // Handle removing an image
  const handleRemoveImage = (imageId: string) => {
    const newImages = formData.images.filter((image) => image.id !== imageId);

    // If we removed the default image, make the first remaining image default
    if (newImages.length > 0 && !newImages.some((img) => img.isDefault)) {
      newImages[0].isDefault = true;
    }

    setFormData({
      ...formData,
      images: newImages,
    });
  };

  // Handle reordering images
  const handleMoveImage = (imageId: string, direction: "up" | "down") => {
    const imageIndex = formData.images.findIndex((img) => img.id === imageId);
    if (imageIndex === -1) return;

    const newImages = [...formData.images];

    if (direction === "up" && imageIndex > 0) {
      // Swap with previous image
      [newImages[imageIndex - 1], newImages[imageIndex]] = [
        newImages[imageIndex],
        newImages[imageIndex - 1],
      ];
    } else if (direction === "down" && imageIndex < newImages.length - 1) {
      // Swap with next image
      [newImages[imageIndex], newImages[imageIndex + 1]] = [
        newImages[imageIndex + 1],
        newImages[imageIndex],
      ];
    }

    // Update sort order
    const updatedImages = newImages.map((img, index) => ({
      ...img,
      sortOrder: index,
    }));

    setFormData({
      ...formData,
      images: updatedImages,
    });
  };

  // Handle adding a specification
  const handleAddSpecification = () => {
    if (newSpecName.trim() && newSpecValue.trim()) {
      setFormData({
        ...formData,
        specifications: [
          ...formData.specifications,
          {
            name: newSpecName.trim(),
            value: newSpecValue.trim(),
          },
        ],
      });
      setNewSpecName("");
      setNewSpecValue("");
    }
  };

  // Handle removing a specification
  const handleRemoveSpecification = (index: number) => {
    setFormData({
      ...formData,
      specifications: formData.specifications.filter((_, i) => i !== index),
    });
  };

  // Handle adding a new option
  const handleAddOption = () => {
    if (newOptionName.trim() && newOptionValue.trim()) {
      const optionValues = newOptionValue
        .split(",")
        .map((val) => val.trim())
        .filter((val) => val);

      if (optionValues.length === 0) return;

      const newOption: ProductOption = {
        id: uuidv4(),
        name: newOptionName.trim(),
        values: optionValues,
      };

      setFormData({
        ...formData,
        options: [...formData.options, newOption],
      });

      setNewOptionName("");
      setNewOptionValue("");
    }
  };

  // Handle removing an option
  const handleRemoveOption = (optionId: string) => {
    setFormData({
      ...formData,
      options: formData.options.filter((opt) => opt.id !== optionId),
    });
  };

  // Generate combinations of options for variants
  const generateCombinations = (
    options: ProductOption[]
  ): { [optionId: string]: string }[] => {
    if (options.length === 0) return [];

    const firstOption = options[0];
    const restOptions = options.slice(1);

    // Base case with just the first option
    if (restOptions.length === 0) {
      return firstOption.values.map((value) => ({ [firstOption.id]: value }));
    }

    // Recursive case
    const restCombinations = generateCombinations(restOptions);

    // Combine first option with all combinations of the rest
    const allCombinations: { [optionId: string]: string }[] = [];

    for (const value of firstOption.values) {
      for (const combination of restCombinations) {
        allCombinations.push({
          [firstOption.id]: value,
          ...combination,
        });
      }
    }

    return allCombinations;
  };

  // Generate variants based on options
  const generateVariants = useCallback(() => {
    if (formData.options.length === 0) {
      // With no options, use the main product as the only variant
      const mainVariant: ProductVariant = {
        id: uuidv4(),
        title: formData.title,
        price: formData.price,
        compareAtPrice: formData.compareAtPrice,
        sku: formData.sku,
        barcode: formData.barcode,
        inventoryQuantity: formData.inventoryQuantity,
        optionValues: {},
        weight: formData.weight,
        weightUnit: formData.weightUnit,
      };

      setFormData((prev) => ({
        ...prev,
        variants: [mainVariant],
      }));

      return;
    }

    // Generate all possible combinations of options
    const combinations = generateCombinations(formData.options);

    // Create or update variants based on combinations
    const newVariants: ProductVariant[] = [];

    combinations.forEach((combination) => {
      // Generate a title for the variant based on its options
      const variantTitle = Object.entries(combination)
        .map(([optionId, value]) => {
          const option = formData.options.find((opt) => opt.id === optionId);
          return option ? value : "";
        })
        .join(" / ");

      // Look for existing variant with the same options
      const existingVariant = formData.variants.find((variant) => {
        // Check if all option values match
        return Object.entries(combination).every(
          ([optionId, value]) => variant.optionValues[optionId] === value
        );
      });

      if (existingVariant) {
        // Keep existing variant but update its title
        newVariants.push({
          ...existingVariant,
          title: variantTitle,
        });
      } else {
        // Create a new variant
        const basePrice = formData.price;
        const baseSku = formData.sku || "";

        const variantSku = baseSku
          ? `${baseSku}-${variantTitle.replace(/\s+/g, "-").toLowerCase()}`
          : `${formData.title}-${variantTitle}`
              .replace(/\s+/g, "-")
              .toLowerCase();

        newVariants.push({
          id: uuidv4(),
          title: variantTitle,
          price: basePrice,
          compareAtPrice: formData.compareAtPrice,
          sku: variantSku,
          barcode: "",
          inventoryQuantity: 0,
          optionValues: combination,
          weight: formData.weight,
          weightUnit: formData.weightUnit,
        });
      }
    });

    setFormData((prev) => ({
      ...prev,
      variants: newVariants,
    }));
  }, [
    formData.options,
    formData.variants,
    formData.title,
    formData.price,
    formData.compareAtPrice,
    formData.sku,
    formData.barcode,
    formData.inventoryQuantity,
    formData.weight,
    formData.weightUnit,
  ]);

  // Handle variant field changes
  const handleVariantChange = (
    variantId: string,
    field: keyof ProductVariant,
    value: string | number
  ) => {
    setFormData({
      ...formData,
      variants: formData.variants.map((variant) => {
        if (variant.id === variantId) {
          return {
            ...variant,
            [field]:
              field === "price" ||
              field === "compareAtPrice" ||
              field === "inventoryQuantity" ||
              field === "weight"
                ? parseFloat(value as string)
                : value,
          };
        }
        return variant;
      }),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Basic validation
      if (!formData.title.trim()) {
        throw new Error("Product title is required");
      }

      if (!formData.slug.trim()) {
        // Generate a slug if not provided
        const generatedSlug = await generateUniqueSlug(formData.title);
        formData.slug = generatedSlug;
      }

      // Ensure at least one image
      if (formData.images.length === 0) {
        throw new Error("At least one product image is required");
      }

      // Make sure price is positive
      if (formData.price <= 0) {
        throw new Error("Product price must be greater than zero");
      }

      // Generate variants if options exist
      if (formData.options.length > 0 && formData.variants.length === 0) {
        generateVariants();
      }

      if (isEditing && initialData?.id) {
        // Update existing product
        await updateProduct(initialData.id, formData);
        toast.success("Product updated successfully");
      } else {
        // Create new product
        await createProduct(formData);
        toast.success("Product created successfully");
      }

      // Redirect to products page
      router.push("/admin/products");
    } catch (error: unknown) {
      if (error instanceof Error) {
        toast.error(error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6 overflow-x-auto">
          <button
            type="button"
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "basic"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
            onClick={() => setActiveTab("basic")}
          >
            Basic Information
          </button>
          <button
            type="button"
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "images"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
            onClick={() => setActiveTab("images")}
          >
            Images
          </button>
          <button
            type="button"
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "variants"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
            onClick={() => setActiveTab("variants")}
          >
            Options & Variants
          </button>
          <button
            type="button"
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "details"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
            onClick={() => setActiveTab("details")}
          >
            Additional Details
          </button>
          <button
            type="button"
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === "seo"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
            onClick={() => setActiveTab("seo")}
          >
            SEO
          </button>
        </nav>
      </div>

      {/* Basic Information Tab */}
      <div className={activeTab === "basic" ? "block" : "hidden"}>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Product Title <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Slug <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="slug"
                  id="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                  required
                />
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                URL-friendly version of the name. Generated automatically but
                can be edited.
              </p>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Status
              </label>
              <div className="mt-1">
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                >
                  {PRODUCT_STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-6">
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Description
              </label>
              <div className="mt-1">
                <textarea
                  id="description"
                  name="description"
                  rows={5}
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Price ($) <span className="text-red-500">*</span>
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="price"
                  id="price"
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                  required
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="compareAtPrice"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Compare At Price ($)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="compareAtPrice"
                  id="compareAtPrice"
                  min="0"
                  step="0.01"
                  value={formData.compareAtPrice || ""}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="costPrice"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Cost Price ($)
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="costPrice"
                  id="costPrice"
                  min="0"
                  step="0.01"
                  value={formData.costPrice || ""}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="sku"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                SKU
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="sku"
                  id="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="barcode"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Barcode
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  name="barcode"
                  id="barcode"
                  value={formData.barcode || ""}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="inventoryQuantity"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Inventory Quantity
              </label>
              <div className="mt-1">
                <input
                  type="number"
                  name="inventoryQuantity"
                  id="inventoryQuantity"
                  min="0"
                  step="1"
                  value={formData.inventoryQuantity}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                />
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="categoryId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Category
              </label>
              <div className="mt-1">
                <select
                  id="categoryId"
                  name="categoryId"
                  value={formData.categoryId || ""}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                >
                  <option value="">No Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <label
                htmlFor="brandId"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Brand
              </label>
              <div className="mt-1">
                <select
                  id="brandId"
                  name="brandId"
                  value={formData.brandId || ""}
                  onChange={handleChange}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                >
                  <option value="">No Brand</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sm:col-span-3">
              <SwitchField
                label="Track Inventory"
                description="Enable inventory tracking for this product"
                checked={formData.trackInventory}
                onChange={(checked) =>
                  handleSwitchChange("trackInventory", checked)
                }
              />
            </div>

            <div className="sm:col-span-3">
              <SwitchField
                label="Featured Product"
                description="Highlight this product on the homepage and featured collections"
                checked={formData.featured}
                onChange={(checked) => handleSwitchChange("featured", checked)}
              />
            </div>

            <div className="sm:col-span-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Tags
              </label>
              <div className="mt-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1.5 h-4 w-4 rounded-full flex items-center justify-center text-blue-400 hover:bg-blue-200 hover:text-blue-600 focus:outline-none"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add a tag"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 flex-grow sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-l-md p-3"
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddTag();
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Add
                  </button>
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Press Enter or click Add to add a tag
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Images Tab */}
      <div className={activeTab === "images" ? "block" : "hidden"}>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="space-y-6">
            <div>
              <label
                htmlFor="imageUrl"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Add Image URL <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 flex">
                <input
                  type="url"
                  id="imageUrl"
                  placeholder="https://i.ibb.co/..."
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 flex-grow sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-l-md p-3"
                  onChange={(e) => setNewTag(e.target.value)}
                  value={newTag}
                />
                <button
                  type="button"
                  onClick={() => {
                    handleImageUrlChange(newTag);
                    setNewTag("");
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Image
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                1. Upload your image to{" "}
                <a
                  href="https://imgbb.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline"
                >
                  ImageBB
                </a>{" "}
                first
                <br />
                2. Copy the direct link and paste it here
              </p>
            </div>

            {formData.images.length > 0 ? (
              <div>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Product Images
                </h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                  {formData.images.map((image, index) => (
                    <div key={image.id} className="relative group">
                      <div
                        className={`relative aspect-w-1 aspect-h-1 rounded-lg bg-gray-100 dark:bg-gray-700 overflow-hidden border-2 ${
                          image.isDefault
                            ? "border-blue-500 dark:border-blue-400"
                            : "border-transparent"
                        }`}
                      >
                        <img
                          src={image.url}
                          alt={image.alt || ""}
                          className="object-cover w-full h-full"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "/placeholder-image.png";
                          }}
                        />
                      </div>
                      <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex space-x-1">
                          <button
                            type="button"
                            onClick={() => handleSetDefaultImage(image.id)}
                            className="p-1 bg-blue-500 rounded-full text-white hover:bg-blue-600"
                            title="Set as default image"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveImage(image.id, "up")}
                            disabled={index === 0}
                            className={`p-1 rounded-full text-white ${
                              index === 0
                                ? "bg-gray-400"
                                : "bg-gray-700 hover:bg-gray-800"
                            }`}
                            title="Move up"
                          >
                            <ChevronUpIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleMoveImage(image.id, "down")}
                            disabled={index === formData.images.length - 1}
                            className={`p-1 rounded-full text-white ${
                              index === formData.images.length - 1
                                ? "bg-gray-400"
                                : "bg-gray-700 hover:bg-gray-800"
                            }`}
                            title="Move down"
                          >
                            <ChevronDownIcon className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(image.id)}
                            className="p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                            title="Remove image"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      {image.isDefault && (
                        <div className="absolute bottom-1 right-1 bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded">
                          Default
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  Hover over an image to access controls. Set one image as
                  default.
                </p>
              </div>
            ) : (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  No images added yet. Use the field above to add product
                  images.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Options & Variants Tab */}
      <div className={activeTab === "variants" ? "block" : "hidden"}>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          {/* Product Options Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Product Options
              </h3>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setVisibleOptions(!visibleOptions)}
              >
                {visibleOptions ? "Hide" : "Show"}
              </button>
            </div>

            {visibleOptions && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={newOptionName}
                      onChange={(e) => setNewOptionName(e.target.value)}
                      placeholder="Option Name (e.g. Size, Color)"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={newOptionValue}
                      onChange={(e) => setNewOptionValue(e.target.value)}
                      placeholder="Option Values (comma separated)"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddOption}
                      className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="h-5 w-5 mr-1" />
                      Add
                    </button>
                  </div>
                </div>

                {formData.options.length > 0 ? (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Defined Options
                    </h4>
                    <div className="space-y-3">
                      {formData.options.map((option) => (
                        <div
                          key={option.id}
                          className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md"
                        >
                          <div>
                            <div className="font-medium text-gray-700 dark:text-gray-300">
                              {option.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              Values: {option.values.join(", ")}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveOption(option.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    No options defined yet. Add options like &quot;Size&quot; or
                    &quot;Color&quot; to create variants.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Product Variants Section */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Product Variants
              </h3>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setVisibleVariants(!visibleVariants)}
              >
                {visibleVariants ? "Hide" : "Show"}
              </button>
            </div>

            {visibleVariants && (
              <div className="mt-4">
                {formData.options.length > 0 ? (
                  <div>
                    {formData.variants.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                          <thead className="bg-gray-50 dark:bg-gray-700/50">
                            <tr>
                              <th
                                scope="col"
                                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                              >
                                Variant
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                              >
                                Price
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                              >
                                SKU
                              </th>
                              <th
                                scope="col"
                                className="px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                              >
                                Inventory
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {formData.variants.map((variant) => (
                              <tr key={variant.id}>
                                <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                  {variant.title}
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm">
                                  <input
                                    type="number"
                                    value={variant.price}
                                    onChange={(e) =>
                                      handleVariantChange(
                                        variant.id,
                                        "price",
                                        e.target.value
                                      )
                                    }
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2"
                                    min="0"
                                    step="0.01"
                                  />
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm">
                                  <input
                                    type="text"
                                    value={variant.sku}
                                    onChange={(e) =>
                                      handleVariantChange(
                                        variant.id,
                                        "sku",
                                        e.target.value
                                      )
                                    }
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2"
                                  />
                                </td>
                                <td className="px-3 py-3 whitespace-nowrap text-sm">
                                  <input
                                    type="number"
                                    value={variant.inventoryQuantity}
                                    onChange={(e) =>
                                      handleVariantChange(
                                        variant.id,
                                        "inventoryQuantity",
                                        e.target.value
                                      )
                                    }
                                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-2"
                                    min="0"
                                    step="1"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <button
                          type="button"
                          onClick={generateVariants}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          Generate Variants
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                    <p className="text-gray-500 dark:text-gray-400">
                      Add product options above to generate variants.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Additional Details Tab */}
      <div className={activeTab === "details" ? "block" : "hidden"}>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          {/* Specifications Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Specifications
              </h3>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setVisibleSpecs(!visibleSpecs)}
              >
                {visibleSpecs ? "Hide" : "Show"}
              </button>
            </div>

            {visibleSpecs && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={newSpecName}
                      onChange={(e) => setNewSpecName(e.target.value)}
                      placeholder="Specification Name"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                    />
                  </div>
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      value={newSpecValue}
                      onChange={(e) => setNewSpecValue(e.target.value)}
                      placeholder="Specification Value"
                      className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      type="button"
                      onClick={handleAddSpecification}
                      className="w-full inline-flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <PlusIcon className="h-5 w-5 mr-1" />
                      Add
                    </button>
                  </div>
                </div>

                {formData.specifications.length > 0 ? (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Product Specifications
                    </h4>
                    <div className="overflow-hidden border-b border-gray-200 dark:border-gray-700 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-700/50">
                          <tr>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                            >
                              Name
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                            >
                              Value
                            </th>
                            <th
                              scope="col"
                              className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                            >
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {formData.specifications.map((spec, index) => (
                            <tr key={index}>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {spec.name}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {spec.value}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleRemoveSpecification(index)
                                  }
                                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                >
                                  <XMarkIcon className="h-5 w-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    No specifications added yet. Specifications provide
                    additional information about your product.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Shipping Information */}
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Shipping Information
              </h3>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                onClick={() => setVisibleShipping(!visibleShipping)}
              >
                {visibleShipping ? "Hide" : "Show"}
              </button>
            </div>

            {visibleShipping && (
              <div className="mt-4 space-y-4">
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="weight"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Weight
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="weight"
                        id="weight"
                        min="0"
                        step="0.01"
                        value={formData.weight || ""}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label
                      htmlFor="weightUnit"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Weight Unit
                    </label>
                    <div className="mt-1">
                      <select
                        id="weightUnit"
                        name="weightUnit"
                        value={formData.weightUnit || "kg"}
                        onChange={handleChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                      >
                        {WEIGHT_UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit.toUpperCase()}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-6">
                  Dimensions
                </h4>
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-1">
                    <label
                      htmlFor="length"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Length
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="length"
                        id="length"
                        min="0"
                        step="0.01"
                        value={formData.dimensions?.length || ""}
                        onChange={handleDimensionsChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label
                      htmlFor="width"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      {" "}
                      Width
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="width"
                        id="width"
                        min="0"
                        step="0.01"
                        value={formData.dimensions?.width || ""}
                        onChange={handleDimensionsChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label
                      htmlFor="height"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Height
                    </label>
                    <div className="mt-1">
                      <input
                        type="number"
                        name="height"
                        id="height"
                        min="0"
                        step="0.01"
                        value={formData.dimensions?.height || ""}
                        onChange={handleDimensionsChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <label
                      htmlFor="unit"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Unit
                    </label>
                    <div className="mt-1">
                      <select
                        id="unit"
                        name="unit"
                        value={formData.dimensions?.unit || "cm"}
                        onChange={handleDimensionsChange}
                        className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                      >
                        {DIMENSION_UNITS.map((unit) => (
                          <option key={unit} value={unit}>
                            {unit}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center">
                  <SwitchField
                    label="Product is taxable"
                    description="Enable if this product is subject to tax"
                    checked={formData.tax?.taxable || false}
                    onChange={handleTaxableChange}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* SEO Tab */}
      <div className={activeTab === "seo" ? "block" : "hidden"}>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              SEO Information
            </h3>
            <button
              type="button"
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              onClick={() => setVisibleMeta(!visibleMeta)}
            >
              {visibleMeta ? "Hide" : "Show"}
            </button>
          </div>

          {visibleMeta && (
            <div className="space-y-6">
              <div>
                <label
                  htmlFor="metaTitle"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Meta Title
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="metaTitle"
                    id="metaTitle"
                    value={formData.metaTitle || ""}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  If left blank, the product title will be used
                </p>
              </div>

              <div>
                <label
                  htmlFor="metaDescription"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Meta Description
                </label>
                <div className="mt-1">
                  <textarea
                    id="metaDescription"
                    name="metaDescription"
                    rows={3}
                    value={formData.metaDescription || ""}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Brief description for search engine results
                </p>
              </div>

              <div>
                <label
                  htmlFor="metaKeywords"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Meta Keywords
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="metaKeywords"
                    id="metaKeywords"
                    value={formData.metaKeywords || ""}
                    onChange={handleChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md p-3"
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Comma-separated keywords related to the product
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => router.push("/admin/products")}
          disabled={isSaving}
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-75 disabled:cursor-not-allowed"
          disabled={isSaving}
        >
          {isSaving ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {isEditing ? "Updating Product..." : "Creating Product..."}
            </>
          ) : isEditing ? (
            "Update Product"
          ) : (
            "Create Product"
          )}
        </button>
      </div>
    </form>
  );
}

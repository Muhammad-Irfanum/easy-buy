import { FieldValue } from "firebase/firestore";

export interface ProductOption{
  id: string;
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  title: string;
  price: number;
  compareAtPrice?: number;
  sku: string;
  barcode?: string;
  inventoryQuantity: number;
  optionValues: {
    [optionId: string]: string
  };
  imageUrl?: string;
  weight?: number;
  weightUnit?: 'g' | 'kg' | 'oz' | 'lb';
}

export interface ProductImage {
  id: string;
  url: string;
  alt?: string;
  isDefault?: boolean;
  sortOrder: number;
}

export interface ProductSpecification {
  name: string;
  value: string;
}

export interface Product {
  id?: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  sku: string;
  barcode?: string;
  inventoryQuantity: number;
  trackInventory: boolean;
  categoryId?: string;
  categoryName?: string;
  brandId?: string;
  brandName?: string;
  images: ProductImage[];
  options: ProductOption[];
  variants: ProductVariant[];
  specifications: ProductSpecification[];
  status: 'active' | 'draft' | 'archived';
  featured: boolean;
  tags: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  createdAt?: string;
  updatedAt?: string| FieldValue;
  publishedAt?: string | FieldValue;
  sellerId?: string;
  rating?: number;
  reviewCount?: number;
  weight?: number;
  weightUnit?: 'kg' | 'g' | 'lb' | 'oz';
  dimensions?: {
    length: number;
    width: number;
    height: number;
    unit: 'cm' | 'in';
  };
  relatedProductIds?: string[];
  tax?: {
    taxable: boolean;
    taxCode?: string;
    taxRate?: number;
  };
}

export const WEIGHT_UNITS = ['kg', 'g', 'lb', 'oz'];
export const DIMENSION_UNITS = ['cm', 'in'];
export const PRODUCT_STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' }
];
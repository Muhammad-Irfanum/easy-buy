export interface Category {
  id?: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string; // Store the ImageBB URL here
  isActive: boolean;
  parentId?: string | null;
  parentName?: string | null;
  productCount?: number;
  createdAt?: string;
  updatedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
}
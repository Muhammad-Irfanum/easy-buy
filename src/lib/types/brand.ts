export interface Brand{
  id?: string;
  name: string;
  slug: string;
  logoUrl: string;
  description: string;
  website?: string;
  isActive: boolean;
  featured: boolean;
  productsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  metaTitle?: string;
  metaDescription?: string;
}
import { Brand } from "@/lib/types/brand";
import { collection, deleteDoc, doc, getDoc, getDocs, orderBy, query, serverTimestamp, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import { db } from "../config";


const COLLECTION_NAME = 'brands';

import { DocumentSnapshot } from "firebase/firestore";

const convertDocToBrand = (doc: DocumentSnapshot): Brand => {
  const data = doc.data();
  if (!data) {
    throw new Error(`Document data is undefined for doc id: ${doc.id}`);
  }
  return {
    id: doc.id,
    name: data.name,
    slug: data.slug,
    logoUrl: data.logoUrl || '',
    description: data.description || '',
    website: data.website || '',
    isActive: data.isActive ?? true,
    featured: data.featured ?? false,
    productsCount: data.productCount || 0,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    metaTitle: data.metaTitle || '',
    metaDescription: data.metaDescription || '',
  };
}

// Get all brands
export const getAllBrands = async (): Promise<Brand[]> => {
  try {
    const brandsRef = collection(db, COLLECTION_NAME);
    const q = query(brandsRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(convertDocToBrand);
  } catch (error) {
    console.error('Error getting brands:', error);
    throw error;
  }
}

// Get active brands
export const getActiveBrands = async (): Promise<Brand[]> => {
  try {
    const brandsRef = collection(db, COLLECTION_NAME);
    const q = query(brandsRef, where('isActive', '==', true), orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(convertDocToBrand);
  } catch (error) {
    console.error('Error getting active brands:', error);
    throw error;
  }
}

// Get brand by ID
export const getBrandById = async (id: string): Promise<Brand | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertDocToBrand(docSnap);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting brand:', error);
    throw error;
  }
}

// Get featured brands
export const getFeaturedBrands = async (): Promise<Brand[]> => {
  try {
    const brandsRef = collection(db, COLLECTION_NAME);
    const q = query(brandsRef, where('featured', '==', true), 
    where('isActive', '==', true), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertDocToBrand);
  } catch (error) {
    console.error('Error getting featured brands:', error);
    throw error;
  }
}

// Get brand by slug
export const getBrandBySlug = async (slug: string): Promise<Brand | null> => {
  try {
    const brandsRef = collection(db, COLLECTION_NAME);
    const q = query(brandsRef, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return convertDocToBrand(querySnapshot.docs[0]);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting brand by slug:', error);
    throw error;
  }
};

// Create a new brand
export const createBrand = async (brandData: Omit<Brand, 'id' | 'createdAt' | 'updatedAt'>): Promise<Brand> => {
  try {
    // Check if slug already exists
    const existingBrand = await getBrandBySlug(brandData.slug);
    if (existingBrand) {
      throw new Error('A brand with this slug already exists');
    }
    
    // Create new brand data with timestamps
    const newBrandData = {
      ...brandData,
      productCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Add to Firestore with auto-generated ID
    const brandRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(brandRef, newBrandData);
    
    // Get the saved document with the ID
    const savedBrand = await getDoc(brandRef);
    return convertDocToBrand(savedBrand);
  } catch (error) {
    console.error('Error creating brand:', error);
    throw error;
  }
};

// Update a brand
export const updateBrand = async (id: string, brandData: Partial<Brand>): Promise<Brand> => {
  try {
    // Check if slug changed and already exists
    if (brandData.slug) {
      const existingBrand = await getBrandBySlug(brandData.slug);
      if (existingBrand && existingBrand.id !== id) {
        throw new Error('A brand with this slug already exists');
      }
    }
    
    // Update brand data
    const updateData = {
      ...brandData,
      updatedAt: serverTimestamp(),
    };
    
    const brandRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(brandRef, updateData);
    
    // Get updated brand
    const updatedBrand = await getDoc(brandRef);
    if (!updatedBrand.exists()) {
      throw new Error('Brand not found after update');
    }
    
    return convertDocToBrand(updatedBrand);
  } catch (error) {
    console.error('Error updating brand:', error);
    throw error;
  }
};

// Delete a brand
export const deleteBrand = async (id: string): Promise<void> => {
  try {
    // Check if this brand has products before deletion
    const brandRef = doc(db, COLLECTION_NAME, id);
    const brandDoc = await getDoc(brandRef);
    
    if (!brandDoc.exists()) {
      throw new Error('Brand not found');
    }
    
    const brandData = brandDoc.data();
    if (brandData?.productCount && brandData.productCount > 0) {
      throw new Error(`Cannot delete brand that has ${brandData.productCount} products associated with it`);
    }
    
    // Delete the brand
    await deleteDoc(brandRef);
  } catch (error) {
    console.error('Error deleting brand:', error);
    throw error;
  }
};

// Update brand product count
export const updateBrandProductCount = async (brandId: string, count: number): Promise<void> => {
  try {
    const brandRef = doc(db, COLLECTION_NAME, brandId);
    await updateDoc(brandRef, {
      productCount: count,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating brand product count:', error);
    throw error;
  }
};

// Search brands
export const searchBrands = async (searchTerm: string): Promise<Brand[]> => {
  try {
    // Since Firestore doesn't support native text search, we'll get all brands and filter
    const brands = await getAllBrands();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return brands.filter(brand => 
      brand.name.toLowerCase().includes(lowerSearchTerm) ||
      brand.description.toLowerCase().includes(lowerSearchTerm) ||
      brand.slug.toLowerCase().includes(lowerSearchTerm) ||
      (brand.website && brand.website.toLowerCase().includes(lowerSearchTerm))
    );
  } catch (error) {
    console.error('Error searching brands:', error);
    throw error;
  }
};
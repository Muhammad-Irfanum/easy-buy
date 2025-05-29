import { db } from '../config';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,

} from 'firebase/firestore';
import { Category } from '@/lib/types/category'; // Adjust the import path as necessary

const COLLECTION_NAME = 'categories';

// Convert Firestore document to Category
import { DocumentSnapshot } from 'firebase/firestore';

const convertDocToCategory = (doc: DocumentSnapshot): Category => {
  const data = doc.data();
  if (!data) {
    throw new Error(`Document data is undefined for doc id: ${doc.id}`);
  }
  return {
    id: doc.id,
    name: data.name,
    slug: data.slug,
    description: data.description || '',
    imageUrl: data.imageUrl || '',
    isActive: data.isActive ?? true,
    parentId: data.parentId || null,
    parentName: data.parentName || null,
    productCount: data.productCount || 0,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate().toISOString() : data.createdAt,
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate().toISOString() : data.updatedAt,
    metaTitle: data.metaTitle || '',
    metaDescription: data.metaDescription || '',
  };
};

// Get all categories
export const getAllCategories = async (): Promise<Category[]> => {
  try {
    const categoriesRef = collection(db, COLLECTION_NAME);
    const q = query(categoriesRef, orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(convertDocToCategory);
  } catch (error) {
    console.error('Error getting categories:', error);
    throw error;
  }
};

// Get active categories
export const getActiveCategories = async (): Promise<Category[]> => {
  try {
    const categoriesRef = collection(db, COLLECTION_NAME);
    const q = query(categoriesRef, where('isActive', '==', true), orderBy('name'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(convertDocToCategory);
  } catch (error) {
    console.error('Error getting active categories:', error);
    throw error;
  }
};

// Get category by ID
export const getCategoryById = async (id: string): Promise<Category | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return convertDocToCategory(docSnap);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting category:', error);
    throw error;
  }
};

// Get category by slug
export const getCategoryBySlug = async (slug: string): Promise<Category | null> => {
  try {
    const categoriesRef = collection(db, COLLECTION_NAME);
    const q = query(categoriesRef, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return convertDocToCategory(querySnapshot.docs[0]);
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error getting category by slug:', error);
    throw error;
  }
};

// Create a new category
export const createCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> => {
  try {
    // Check if slug already exists
    const existingCategory = await getCategoryBySlug(categoryData.slug);
    if (existingCategory) {
      throw new Error('A category with this slug already exists');
    }
    
    // If parentId is provided, get parent name
    let parentName = null;
    if (categoryData.parentId) {
      const parent = await getCategoryById(categoryData.parentId);
      parentName = parent?.name || null;
    }
    
    // Create new category data with timestamps
    const newCategoryData = {
      ...categoryData,
      parentName,
      productCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Add to Firestore with auto-generated ID
    const categoryRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(categoryRef, newCategoryData);
    
    // Get the saved document with the ID
    const savedCategory = await getDoc(categoryRef);
    return convertDocToCategory(savedCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
};

// Update a category
export const updateCategory = async (id: string, categoryData: Partial<Category>): Promise<Category> => {
  try {
    // Check if slug changed and already exists
    if (categoryData.slug) {
      const existingCategory = await getCategoryBySlug(categoryData.slug);
      if (existingCategory && existingCategory.id !== id) {
        throw new Error('A category with this slug already exists');
      }
    }
    
    // If parentId is provided, get parent name
    let parentName = undefined;
    if (categoryData.parentId !== undefined) {
      if (categoryData.parentId) {
        const parent = await getCategoryById(categoryData.parentId);
        parentName = parent?.name || null;
      } else {
        parentName = null;
      }
    }
    
    // Update category data
    const updateData = {
      ...categoryData,
      ...(parentName !== undefined && { parentName }),
      updatedAt: serverTimestamp(),
    };
    
    const categoryRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(categoryRef, updateData);
    
    // Get updated category
    const updatedCategory = await getDoc(categoryRef);
    if (!updatedCategory.exists()) {
      throw new Error('Category not found after update');
    }
    
    return convertDocToCategory(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

// Delete a category
export const deleteCategory = async (id: string): Promise<void> => {
  try {
    // First, check if this category is a parent of other categories
    const categoriesRef = collection(db, COLLECTION_NAME);
    const q = query(categoriesRef, where('parentId', '==', id));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      throw new Error('Cannot delete category that has subcategories');
    }
    
    // Then delete the category
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Update category product count
export const updateCategoryProductCount = async (categoryId: string, count: number): Promise<void> => {
  try {
    const categoryRef = doc(db, COLLECTION_NAME, categoryId);
    await updateDoc(categoryRef, {
      productCount: count,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating category product count:', error);
    throw error;
  }
};

// Search categories
export const searchCategories = async (searchTerm: string): Promise<Category[]> => {
  try {
    // Since Firestore doesn't support native text search, we'll get all categories and filter
    const categories = await getAllCategories();
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return categories.filter(category => 
      category.name.toLowerCase().includes(lowerSearchTerm) ||
      category.description.toLowerCase().includes(lowerSearchTerm) ||
      category.slug.toLowerCase().includes(lowerSearchTerm)
    );
  } catch (error) {
    console.error('Error searching categories:', error);
    throw error;
  }
};
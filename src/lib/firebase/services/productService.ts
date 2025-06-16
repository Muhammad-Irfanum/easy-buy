import { Product } from "@/lib/types/product";
import { db, storage } from "../config";
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
  startAfter,
  DocumentSnapshot,
  writeBatch,
  FieldValue,
} from "firebase/firestore";
import { limit } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import slugify from "slugify";
import { v4 as uuidv4 } from "uuid";
import { updateCategoryProductCount } from "./categoryService";
import { updateBrandProductCount } from "./brandService";
const COLLECTION_NAME = "products";
const BATCH_SIZE = 20;

function removeUndefinedDeep<T>(obj: T): T {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj
      .map((item) => removeUndefinedDeep(item))
      .filter((item) => item !== undefined) as unknown as T;
  }

  const cleaned: Record<string, unknown> = {};

  for (const key in obj as Record<string, unknown>) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const value = (obj as Record<string, unknown>)[key];
      if (value !== undefined) {
        cleaned[key] = removeUndefinedDeep(value);
      }
    }
  }

  return cleaned as T;
}
// Convert Firestore document to Product
const convertDocToProduct = (doc: DocumentSnapshot): Product => {
  const data = doc.data();
  if (!data) {
    throw new Error("Document data is undefined");
  }
  return {
    id: doc.id,
    title: data.title || "",
    slug: data.slug || "",
    description: data.description || "",
    price: data.price || 0,
    compareAtPrice: data.compareAtPrice,
    costPrice: data.costPrice,
    sku: data.sku || "",
    barcode: data.barcode || "",
    inventoryQuantity: data.inventoryQuantity || 0,
    trackInventory:
      data.trackInventory !== undefined ? data.trackInventory : true,
    categoryId: data.categoryId || null,
    categoryName: data.categoryName || null,
    brandId: data.brandId || null,
    brandName: data.brandName || null,
    images: data.images || [],
    options: data.options || [],
    variants: data.variants || [],
    specifications: data.specifications || [],
    status: data.status || "draft",
    featured: data.featured || false,
    tags: data.tags || [],
    metaTitle: data.metaTitle || "",
    metaDescription: data.metaDescription || "",
    metaKeywords: data.metaKeywords || "",
    createdAt:
      data.createdAt instanceof Timestamp
        ? data.createdAt.toDate().toISOString()
        : data.createdAt,
    updatedAt:
      data.updatedAt instanceof Timestamp
        ? data.updatedAt.toDate().toISOString()
        : data.updatedAt,
    publishedAt:
      data.publishedAt instanceof Timestamp
        ? data.publishedAt.toDate().toISOString()
        : data.publishedAt,
    sellerId: data.sellerId || "",
    rating: data.rating || 0,
    reviewCount: data.reviewCount || 0,
    weight: data.weight,
    weightUnit: data.weightUnit,
    dimensions: data.dimensions,
    relatedProductIds: data.relatedProductIds || [],
    tax: data.tax || { taxable: false },
  };
};

// Get all products
export const getAllProducts = async (pageLimit = 50): Promise<Product[]> => {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(
      productsRef,
      orderBy("updatedAt", "desc"),
      limit(pageLimit)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(convertDocToProduct);
  } catch (error) {
    console.error("Error getting products:", error);
    throw error;
  }
};

// Get products with pagination
export const getProductsPaginated = async (
  lastDoc: DocumentSnapshot | null,
  pageSize = BATCH_SIZE
): Promise<{ products: Product[]; lastDoc: DocumentSnapshot | null }> => {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    let q;

    if (lastDoc) {
      q = query(
        productsRef,
        orderBy("updatedAt", "desc"),
        startAfter(lastDoc),
        limit(pageSize)
      );
    } else {
      q = query(productsRef, orderBy("updatedAt", "desc"), limit(pageSize));
    }

    const querySnapshot = await getDocs(q);
    const products = querySnapshot.docs.map(convertDocToProduct);

    // Get the last document for pagination
    const lastVisible =
      querySnapshot.docs.length > 0
        ? querySnapshot.docs[querySnapshot.docs.length - 1]
        : null;

    return {
      products,
      lastDoc: lastVisible,
    };
  } catch (error) {
    console.error("Error getting paginated products:", error);
    throw error;
  }
};

// Get active products
export const getActiveProducts = async (pageLimit = 50): Promise<Product[]> => {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(
      productsRef,
      where("status", "==", "active"),
      orderBy("updatedAt", "desc"),
      limit(pageLimit)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(convertDocToProduct);
  } catch (error) {
    console.error("Error getting active products:", error);
    throw error;
  }
};

// Get featured products
export const getFeaturedProducts = async (
  pageLimit = 10
): Promise<Product[]> => {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(
      productsRef,
      where("status", "==", "active"),
      where("featured", "==", true),
      orderBy("updatedAt", "desc"),
      limit(pageLimit)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(convertDocToProduct);
  } catch (error) {
    console.error("Error getting featured products:", error);
    throw error;
  }
};

// Get products by category
export const getProductsByCategory = async (
  categoryId: string,
  pageLimit = 50
): Promise<Product[]> => {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(
      productsRef,
      where("status", "==", "active"),
      where("categoryId", "==", categoryId),
      orderBy("updatedAt", "desc"),
      limit(pageLimit)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(convertDocToProduct);
  } catch (error) {
    console.error(`Error getting products for category ${categoryId}:`, error);
    throw error;
  }
};

// Get products by brand
export const getProductsByBrand = async (
  brandId: string,
  pageLimit = 50
): Promise<Product[]> => {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(
      productsRef,
      where("status", "==", "active"),
      where("brandId", "==", brandId),
      orderBy("updatedAt", "desc"),
      limit(pageLimit)
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(convertDocToProduct);
  } catch (error) {
    console.error(`Error getting products for brand ${brandId}:`, error);
    throw error;
  }
};

// Get product by ID
export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return convertDocToProduct(docSnap);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting product:", error);
    throw error;
  }
};

// Get product by slug
export const getProductBySlug = async (
  slug: string
): Promise<Product | null> => {
  try {
    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(productsRef, where("slug", "==", slug));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      return convertDocToProduct(querySnapshot.docs[0]);
    } else {
      return null;
    }
  } catch (error) {
    console.error("Error getting product by slug:", error);
    throw error;
  }
};

// Generate a unique slug
export const generateUniqueSlug = async (title: string): Promise<string> => {
  try {
    const baseSlug = slugify(title, { lower: true, strict: true });

    // Check if the slug exists
    const existingProduct = await getProductBySlug(baseSlug);

    if (!existingProduct) {
      return baseSlug;
    }

    // If slug exists, append a unique suffix
    const timestamp = new Date().getTime();
    return `${baseSlug}-${timestamp.toString().slice(-6)}`;
  } catch (error) {
    console.error("Error generating unique slug:", error);
    throw error;
  }
};

// Create a new product
export const createProduct = async (
  productData: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<Product> => {
  try {
    // Generate slug if not provided
    let slug = productData.slug;
    if (!slug || slug.trim() === "") {
      slug = await generateUniqueSlug(productData.title);
    } else {
      // Check if the provided slug already exists
      const existingProduct = await getProductBySlug(slug);
      if (existingProduct) {
        throw new Error("A product with this slug already exists");
      }
    }

    // Create new product data with timestamps
    const newProductData = removeUndefinedDeep({
      ...productData,
      slug,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      publishedAt: productData.status === "active" ? serverTimestamp() : null,
    });

    // Add to Firestore with auto-generated ID
    const productRef = doc(collection(db, COLLECTION_NAME));
    await setDoc(productRef, newProductData);

    // Update category and brand product counts
    if (productData.categoryId) {
      await updateCategoryProductCount(productData.categoryId, 1);
    }

    if (productData.brandId) {
      await updateBrandProductCount(productData.brandId, 1);
    }

    // Get the saved document with the ID
    const savedProduct = await getDoc(productRef);
    return convertDocToProduct(savedProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    throw error;
  }
};

// Update a product
export const updateProduct = async (
  id: string,
  productData: Partial<Product>
): Promise<Product> => {
  try {
    // Get the existing product
    const existingProduct = await getProductById(id);
    if (!existingProduct) {
      throw new Error("Product not found");
    }

    // Check if slug changed and already exists
    if (productData.slug && productData.slug !== existingProduct.slug) {
      const existingProductWithSlug = await getProductBySlug(productData.slug);
      if (existingProductWithSlug && existingProductWithSlug.id !== id) {
        throw new Error("A product with this slug already exists");
      }
    }

    // Create update data
    const updateData: Partial<Product> & {
      updatedAt: FieldValue;
      publishedAt?: string | FieldValue;
    } = {
      ...productData,
      updatedAt: serverTimestamp(),
    };

    // Set publishedAt only if status changed to active
    if (
      productData.status === "active" &&
      existingProduct.status !== "active"
    ) {
      updateData.publishedAt = serverTimestamp();
    }

    // Update product
    const productRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(productRef, updateData);

    // Update category product count if changed
    if (
      productData.categoryId &&
      productData.categoryId !== existingProduct.categoryId
    ) {
      if (existingProduct.categoryId) {
        await updateCategoryProductCount(existingProduct.categoryId, -1);
      }
      await updateCategoryProductCount(productData.categoryId, 1);
    }

    // Update brand product count if changed
    if (
      productData.brandId &&
      productData.brandId !== existingProduct.brandId
    ) {
      if (existingProduct.brandId) {
        await updateBrandProductCount(existingProduct.brandId, -1);
      }
      await updateBrandProductCount(productData.brandId, 1);
    }

    // Get updated product
    const updatedProduct = await getDoc(productRef);
    return convertDocToProduct(updatedProduct);
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  try {
    // Get the product first to update category and brand counts
    const product = await getProductById(id);
    if (!product) {
      throw new Error("Product not found");
    }

    // Delete the product
    await deleteDoc(doc(db, COLLECTION_NAME, id));

    // Update category and brand product counts
    if (product.categoryId) {
      await updateCategoryProductCount(product.categoryId, -1);
    }

    if (product.brandId) {
      await updateBrandProductCount(product.brandId, -1);
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    throw error;
  }
};

// Search products
export const searchProducts = async (
  searchTerm: string,
  limit = 50
): Promise<Product[]> => {
  try {
    // Since Firestore doesn't support native text search, we'll get products and filter
    // In a production app, consider using a service like Algolia for better search
    const products = await getAllProducts(200); // Get a larger set to search through
    const lowerSearchTerm = searchTerm.toLowerCase();

    const results = products.filter(
      (product) =>
        product.title.toLowerCase().includes(lowerSearchTerm) ||
        product.description.toLowerCase().includes(lowerSearchTerm) ||
        product.sku.toLowerCase().includes(lowerSearchTerm) ||
        (product.barcode &&
          product.barcode.toLowerCase().includes(lowerSearchTerm)) ||
        product.tags.some((tag) => tag.toLowerCase().includes(lowerSearchTerm))
    );

    return results.slice(0, limit);
  } catch (error) {
    console.error("Error searching products:", error);
    throw error;
  }
};

// Upload a product image to storage and return URL
export const uploadProductImage = async (file: File): Promise<string> => {
  try {
    const uniqueId = uuidv4();
    const storageRef = ref(storage, `product-images/${uniqueId}_${file.name}`);

    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Progress can be tracked here
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          reject(error);
        },
        async () => {
          // Upload completed successfully, get download URL
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadURL);
        }
      );
    });
  } catch (error) {
    console.error("Error uploading product image:", error);
    throw error;
  }
};

// Bulk update products
export const bulkUpdateProducts = async (
  updates: { id: string; data: Partial<Product> }[]
): Promise<void> => {
  try {
    // Firestore allows up to 500 operations in a batch
    // Split into multiple batches if needed
    const batches = [];
    const batchSize = 500;

    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = writeBatch(db);
      const chunk = updates.slice(i, i + batchSize);

      chunk.forEach((update) => {
        const productRef = doc(db, COLLECTION_NAME, update.id);
        batch.update(productRef, {
          ...update.data,
          updatedAt: serverTimestamp(),
        });
      });

      batches.push(batch);
    }

    // Commit all batches
    await Promise.all(batches.map((batch) => batch.commit()));
  } catch (error) {
    console.error("Error bulk updating products:", error);
    throw error;
  }
};

// Get related products
export const getRelatedProducts = async (
  productId: string,
  categoryId: string | undefined,
  pageLimit = 6
): Promise<Product[]> => {
  try {
    if (!categoryId) {
      return [];
    }

    const productsRef = collection(db, COLLECTION_NAME);
    const q = query(
      productsRef,
      where("status", "==", "active"),
      where("categoryId", "==", categoryId),
      where("id", "!=", productId),
      orderBy("id"),
      orderBy("updatedAt", "desc"),
      limit(pageLimit)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(convertDocToProduct);
  } catch (error) {
    console.error("Error getting related products:", error);
    return [];
  }
};

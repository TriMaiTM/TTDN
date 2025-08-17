import { Injectable } from '@angular/core';
import { Observable, from, map, of } from 'rxjs';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  startAfter,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  Timestamp
} from 'firebase/firestore';
import { firebaseConfig } from '../../environments/firebase.config';
import { Product, Category, SearchParams, SearchResult } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DirectFirebaseProductService {
  private db: any;

  constructor() {
    const app = initializeApp(firebaseConfig);
    this.db = getFirestore(app);
  }

  // Get all products with optional filtering and pagination
  getProducts(params?: SearchParams): Observable<SearchResult<Product>> {
    return from(this.fetchProductsInternal(params));
  }

  // Public method to fetch products (for admin panel)
  async fetchProducts(params?: SearchParams): Promise<Product[]> {
    try {
      const result = await this.fetchProductsInternal(params);
      return result.items;
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  private async fetchProductsInternal(params?: SearchParams): Promise<SearchResult<Product>> {
    try {
      const productsCollection = collection(this.db, 'products');
      let q = query(productsCollection);

      // For category filtering, use client-side filtering to avoid index issues
      if (params?.filter?.category) {
        console.log('Filtering by category:', params.filter.category); // Debug log
        
        // Get all products first, then filter client-side
        q = query(q, orderBy('createdAt', 'desc'), firestoreLimit(1000));
        
        const querySnapshot = await getDocs(q);
        const allProducts: Product[] = [];
        
        console.log('Firebase query results count:', querySnapshot.size); // Debug log

        querySnapshot.forEach((doc) => {
          const data = doc.data() as any;
          const product = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          };
          console.log('Product from Firebase:', product.name, 'Category:', product.category); // Debug log
          allProducts.push(product);
        });

        console.log('Total products after Firebase query:', allProducts.length); // Debug log

        // Client-side category filtering
        const categoryFilteredProducts = allProducts.filter(product => 
          product.category === params?.filter?.category
        );
        
        console.log('Products after category filter:', categoryFilteredProducts.length);

        // Apply search query if needed
        let filteredProducts = categoryFilteredProducts;
        if (params?.query) {
          const searchQuery = params.query.toLowerCase();
          filteredProducts = categoryFilteredProducts.filter(product =>
            product.name.toLowerCase().includes(searchQuery) ||
            product.description.toLowerCase().includes(searchQuery) ||
            product.tags?.some(tag => tag.toLowerCase().includes(searchQuery))
          );
        }

        // Apply pagination
        const startIndex = ((params?.page || 1) - 1) * (params?.limit || 12);
        const endIndex = startIndex + (params?.limit || 12);
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        const result: SearchResult<Product> = {
          items: paginatedProducts,
          total: filteredProducts.length,
          page: params?.page || 1,
          limit: params?.limit || 12,
          hasNext: endIndex < filteredProducts.length,
          hasPrev: (params?.page || 1) > 1
        };

        console.log('Final result:', result); // Debug log
        return result;
      } else {
        // No category filter - use server-side query
        if (params?.sortBy) {
          q = query(q, orderBy(params.sortBy, params.sortOrder || 'asc'));
        } else {
          q = query(q, orderBy('createdAt', 'desc'));
        }
      }

      // Apply limit
      const limitCount = params?.limit || 12;
      q = query(q, firestoreLimit(limitCount));

      const querySnapshot = await getDocs(q);
      const products: Product[] = [];
      
      console.log('Firebase query results count:', querySnapshot.size); // Debug log

      querySnapshot.forEach((doc) => {
        const data = doc.data() as any;
        const product = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
        console.log('Product from Firebase:', product.name, 'Category:', product.category); // Debug log
        products.push(product);
      });

      console.log('Total products after Firebase query:', products.length); // Debug log

      // Apply client-side filtering if needed
      let filteredProducts = products;

      if (params?.query) {
        const searchQuery = params.query.toLowerCase();
        filteredProducts = products.filter(product =>
          product.name.toLowerCase().includes(searchQuery) ||
          product.description.toLowerCase().includes(searchQuery) ||
          product.tags?.some(tag => tag.toLowerCase().includes(searchQuery))
        );
      }

      const result: SearchResult<Product> = {
        items: filteredProducts,
        total: filteredProducts.length,
        page: params?.page || 1,
        limit: limitCount,
        hasNext: false, // Simplified for now
        hasPrev: (params?.page || 1) > 1
      };

      console.log('Final result:', result); // Debug log
      return result;
    } catch (error) {
      console.error('Error fetching products:', error);
      return {
        items: [],
        total: 0,
        page: 1,
        limit: 12,
        hasNext: false,
        hasPrev: false
      };
    }
  }

  // Get featured products
  getFeaturedProducts(limitCount: number = 8): Observable<Product[]> {
    return from(this.fetchFeaturedProducts(limitCount));
  }

  private async fetchFeaturedProducts(limitCount: number): Promise<Product[]> {
    try {
      const productsCollection = collection(this.db, 'products');
      const q = query(
        productsCollection, 
        where('featured', '==', true),
        orderBy('rating', 'desc'),
        firestoreLimit(limitCount)
      );

      const querySnapshot = await getDocs(q);
      const products: Product[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as any;
        products.push({
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        });
      });

      return products;
    } catch (error) {
      console.error('Error fetching featured products:', error);
      return [];
    }
  }

  // Get categories
  getCategories(): Observable<Category[]> {
    return from(this.fetchCategoriesInternal());
  }

  // Public method to fetch categories (for admin panel)
  async fetchCategories(): Promise<Category[]> {
    try {
      const categoriesCollection = collection(this.db, 'categories');
      const q = query(categoriesCollection, orderBy('sortOrder', 'asc'));
      
      const querySnapshot = await getDocs(q);
      const categories: Category[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as any;
        categories.push({
          id: doc.id,
          ...data
        });
      });

      // Organize categories into hierarchy
      const mainCategories = categories.filter(cat => !cat.parentId);
      const subCategories = categories.filter(cat => cat.parentId);

      mainCategories.forEach(mainCat => {
        mainCat.children = subCategories.filter(subCat => subCat.parentId === mainCat.slug);
      });

      return categories; // Return all categories for admin panel
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  private async fetchCategoriesInternal(): Promise<Category[]> {
    try {
      const categoriesCollection = collection(this.db, 'categories');
      const q = query(categoriesCollection, orderBy('sortOrder', 'asc'));
      
      const querySnapshot = await getDocs(q);
      const categories: Category[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data() as any;
        categories.push({
          id: doc.id,
          ...data
        });
      });

      // Organize categories into hierarchy
      const mainCategories = categories.filter(cat => !cat.parentId);
      const subCategories = categories.filter(cat => cat.parentId);

      mainCategories.forEach(mainCat => {
        mainCat.children = subCategories.filter(subCat => subCat.parentId === mainCat.slug);
      });

      return mainCategories;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Get products by category
  getProductsByCategory(categorySlug: string, params?: SearchParams): Observable<SearchResult<Product>> {
    const modifiedParams = {
      ...params,
      filter: {
        ...params?.filter,
        category: categorySlug
      }
    };
    return this.getProducts(modifiedParams);
  }

  // Get category by slug
  getCategory(slug: string): Observable<Category | null> {
    return from(this.fetchCategoryBySlug(slug));
  }

  private async fetchCategoryBySlug(slug: string): Promise<Category | null> {
    try {
      const categories = await this.fetchCategoriesInternal();
      
      // Search in main categories
      for (const category of categories) {
        if (category.slug === slug) {
          return category;
        }
        // Search in subcategories
        if (category.children) {
          for (const child of category.children) {
            if (child.slug === slug) {
              return child;
            }
          }
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching category:', error);
      return null;
    }
  }

  // Get product by ID
  getProduct(id: string): Observable<Product | null> {
    return from(this.fetchProductById(id));
  }

  private async fetchProductById(id: string): Promise<Product | null> {
    try {
      const products = await this.fetchProducts({ limit: 1000 }); // Get all to search by ID
      return products.find((p: Product) => p.id === id) || null;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  }

  // CRUD Operations for Admin Panel

  // Add new product
  async addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(this.db, 'products'), {
        ...productData,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  // Update existing product
  async updateProduct(id: string, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const productRef = doc(this.db, 'products', id);
      await updateDoc(productRef, {
        ...productData,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete product
  async deleteProduct(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.db, 'products', id));
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Add new category
  async addCategory(categoryData: Omit<Category, 'id'>): Promise<string> {
    try {
      const docRef = await addDoc(collection(this.db, 'categories'), categoryData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }

  // Update existing category
  async updateCategory(id: string, categoryData: Partial<Omit<Category, 'id'>>): Promise<void> {
    try {
      const categoryRef = doc(this.db, 'categories', id);
      await updateDoc(categoryRef, categoryData);
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // Delete category
  async deleteCategory(id: string): Promise<void> {
    try {
      await deleteDoc(doc(this.db, 'categories', id));
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}

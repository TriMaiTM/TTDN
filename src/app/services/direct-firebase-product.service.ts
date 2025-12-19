import { Injectable, inject } from '@angular/core';
import { MultiDbService } from './multi-database';
import { AuthService } from './auth.service';
import { Observable, from, map, of, catchError, switchMap, filter, take } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { initializeApp } from 'firebase/app';
import { Firestore } from '@angular/fire/firestore';
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
  setDoc,
  addDoc,
  writeBatch,
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
  private multiDbService = inject(MultiDbService);
  private authService = inject(AuthService); // Inject AuthService check role
  private defaultDb = inject(Firestore);

  // Create observable in injection context (field initializer)
  private isLoading$ = toObservable(this.authService.isLoading);

  constructor() {
    // Removed manual initialization to use the injected Firestore instance
  }

  // Helper to get the correct DB (Branch or Default)
  private get db(): any {
    const user = this.authService.user();
    console.log('>>> [DB Getter] Current User:', user);
    console.log('>>> [DB Getter] User Role:', user?.role);

    // 1. If user is supposed to be a Branch Admin, MUST use Branch DB
    if (user?.role === 'branch_admin') {
      try {
        const branchDb = this.multiDbService.getDB();
        console.log('>>> [DirectFirebaseProductService] Using BRANCH DB');
        return branchDb;
      } catch (e) {
        console.error('>>> [CRITICAL] Branch Admin but not connected to Branch DB! Throwing error to prevent Main DB fallback.');
        // Throw error to stop execution and prevent showing wrong data
        throw new Error('Branch Database Not Connected');
      }
    }

    // 2. For Super Admin or Regular User, use Default (or configured context switch later)
    return this.defaultDb;
  }

  // Get all products with optional filtering and pagination
  getProducts(params?: SearchParams): Observable<SearchResult<Product>> {
    console.log('DirectFirebaseProductService.getProducts called with:', params);

    // Wait for Auth to finish loading
    return this.isLoading$.pipe(
      filter(isLoading => !isLoading), // Wait until isLoading is false
      take(1), // Take only the first "false" value
      switchMap(() => {
        // Now it's safe to use this.db because role is determined
        return from(this.fetchProductsInternal(params));
      }),
      map(result => {
        console.log('DirectFirebaseProductService.getProducts result:', result);
        return result;
      }),
      catchError((error: any) => {
        console.error('DirectFirebaseProductService.getProducts error:', error);
        return of({
          items: [],
          total: 0,
          page: 1,
          limit: 10,
          pages: 0,
          hasNext: false,
          hasPrev: false
        });
      })
    );
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
    console.log('--- fetchProductsInternal START ---');
    console.log('Params:', params);
    try {
      const dbInstance = this.db;
      // Log the app name to verify connection (dbInstance.app.options.projectId for Modular SDK might differ structure, but let's try)
      console.log('Using DB Instance Type:', dbInstance.type);
      // console.log('DB App Name:', dbInstance.app?.name); 

      const productsCollection = collection(dbInstance, 'products');
      let q = query(productsCollection);

      // For category filtering, use client-side filtering to avoid index issues
      if (params?.filter?.category) {
        console.log('Filtering by category:', params.filter.category);

        // Get all products first, then filter client-side
        q = query(q, orderBy('createdAt', 'desc'), firestoreLimit(1000));

        console.log('Executing Query for ALL products (Category Filter active)...');
        const querySnapshot = await getDocs(q);
        console.log('Query Snapshot Size:', querySnapshot.size);

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

  // CRUD Operations for Admin Panel

  // CRUD Operations for Admin Panel

  /**
   * Add Product - DUAL WRITE Strategy
   */
  async addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const now = Timestamp.now();
      const dataToSave = {
        ...productData,
        createdAt: now,
        updatedAt: now
      };

      // 1. Write to Main DB (Always)
      const mainDocRef = await addDoc(collection(this.defaultDb, 'products'), dataToSave);
      const generatedId = mainDocRef.id;
      console.log(`[DualWrite] Added to Main DB: ${generatedId}`);

      // 2. Write to Branch DB (If connected)
      try {
        const branchDb = this.multiDbService.getDB();
        const branchDocRef = doc(branchDb, 'products', generatedId);
        await setDoc(branchDocRef, dataToSave);
        console.log(`[DualWrite] Synced to Branch DB: ${generatedId}`);
      } catch (e) {
        console.warn('[DualWrite] Branch DB write skipped:', e);
      }

      return generatedId;
    } catch (error) {
      console.error('Error adding product:', error);
      throw error;
    }
  }

  /**
   * Update Product - DUAL WRITE Strategy
   */
  async updateProduct(id: string, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    try {
      const updatePayload = {
        ...productData,
        updatedAt: Timestamp.now()
      };

      // 1. Update Main DB
      const mainRef = doc(this.defaultDb, 'products', id);
      // Try/Catch for Main DB in case doc doesn't exist (though it should)
      try {
        await updateDoc(mainRef, updatePayload);
      } catch (e) {
        console.warn('Could not update Main DB (doc might be missing):', e);
      }

      // 2. Update Branch DB
      try {
        const branchDb = this.multiDbService.getDB();
        const branchRef = doc(branchDb, 'products', id);
        await updateDoc(branchRef, updatePayload);
        console.log(`[DualWrite] Updated Branch DB: ${id}`);
      } catch (e) {
        console.warn('[DualWrite] Branch DB update skipped:', e);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      throw error;
    }
  }

  /**
   * Delete Product - DUAL WRITE Strategy
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      // 1. Delete from Main DB
      await deleteDoc(doc(this.defaultDb, 'products', id));

      // 2. Delete from Branch DB
      try {
        const branchDb = this.multiDbService.getDB();
        await deleteDoc(doc(branchDb, 'products', id));
        console.log(`[DualWrite] Deleted from Branch DB: ${id}`);
      } catch (e) {
        // Ignore
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Add new category - DUAL WRITE
  async addCategory(categoryData: Omit<Category, 'id'>): Promise<string> {
    try {
      const now = Timestamp.now();
      // 1. Main DB
      const mainDocRef = await addDoc(collection(this.defaultDb, 'categories'), categoryData);
      const generatedId = mainDocRef.id;

      // 2. Branch DB
      try {
        const branchDb = this.multiDbService.getDB();
        const branchDocRef = doc(branchDb, 'categories', generatedId);
        await setDoc(branchDocRef, categoryData);
      } catch (e) {
        // Ignore
      }
      return generatedId;
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }

  // Update existing category - DUAL WRITE
  async updateCategory(id: string, categoryData: Partial<Omit<Category, 'id'>>): Promise<void> {
    try {
      // 1. Main DB
      await updateDoc(doc(this.defaultDb, 'categories', id), categoryData);

      // 2. Branch DB
      try {
        const branchDb = this.multiDbService.getDB();
        await updateDoc(doc(branchDb, 'categories', id), categoryData);
      } catch (e) {
        // Ignore
      }
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // Delete category - DUAL WRITE
  async deleteCategory(id: string): Promise<void> {
    try {
      // 1. Main DB
      await deleteDoc(doc(this.defaultDb, 'categories', id));

      // 2. Branch DB
      try {
        const branchDb = this.multiDbService.getDB();
        await deleteDoc(doc(branchDb, 'categories', id));
      } catch (e) {
        // Ignore
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }
}

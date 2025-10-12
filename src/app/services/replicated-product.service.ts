import { Injectable } from '@angular/core';
import { Observable, from, map, catchError, of } from 'rxjs';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit as firestoreLimit,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  Timestamp,
  Firestore
} from 'firebase/firestore';
import { Product, Category, SearchParams, SearchResult } from '../models';
import { FirebaseReplicationService } from './firebase-replication.service';

@Injectable({
  providedIn: 'root'
})
export class ReplicatedProductService {

  constructor(
    private replicationService: FirebaseReplicationService
  ) {}

  /**
   * Get all products with replication support
   */
  getProducts(params?: SearchParams): Observable<SearchResult<Product>> {
    console.log('ReplicatedProductService.getProducts called with:', params);
    
    return this.replicationService.executeQuery(db => 
      this.fetchProductsInternal(db, params)
    ).pipe(
      map(result => {
        console.log('ReplicatedProductService.getProducts result:', result);
        return result;
      }),
      catchError((error: any) => {
        console.error('ReplicatedProductService.getProducts error:', error);
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

  /**
   * Get featured products with replication support
   */
  getFeaturedProducts(limitCount: number = 8): Observable<Product[]> {
    return this.replicationService.executeQuery(db => 
      this.fetchFeaturedProducts(db, limitCount)
    );
  }

  /**
   * Get categories with replication support
   */
  getCategories(): Observable<Category[]> {
    return this.replicationService.executeQuery(db => 
      this.fetchCategoriesInternal(db)
    );
  }

  /**
   * Get products by category with replication support
   */
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

  /**
   * Get category by slug with replication support
   */
  getCategory(slug: string): Observable<Category | null> {
    return this.replicationService.executeQuery(db => 
      this.fetchCategoryBySlug(db, slug)
    );
  }

  /**
   * Get product by ID with replication support
   */
  getProduct(id: string): Observable<Product | null> {
    return this.replicationService.executeQuery(db => 
      this.fetchProductById(db, id)
    );
  }

  // CRUD Operations with Cross-Replica Sync

  /**
   * Add new product with replication
   */
  async addProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    // Write to primary only
    const result = await this.replicationService.syncDataAcrossReplicas(async (db: Firestore) => {
      const now = Timestamp.now();
      const docRef = await addDoc(collection(db, 'products'), {
        ...productData,
        createdAt: now,
        updatedAt: now
      });
      return docRef.id;
    });

    // Then replicate the document to other replicas
    const now = Timestamp.now();
    const documentData = {
      ...productData,
      createdAt: now,
      updatedAt: now
    };
    
    await this.replicationService.replicateDocument('products', result, documentData);
    
    return result;
  }

  /**
   * Update existing product with replication
   */
  async updateProduct(id: string, productData: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const primaryDb = this.replicationService.getPrimaryDatabase();
    
    // Update on primary first
    const updateData = {
      ...productData,
      updatedAt: Timestamp.now()
    };
    
    const productRef = doc(primaryDb, 'products', id);
    await updateDoc(productRef, updateData);

    // Then replicate the update to other replicas
    await this.replicationService.replicateDocument('products', id, updateData);
  }

  /**
   * Delete product with replication
   */
  async deleteProduct(id: string): Promise<void> {
    const primaryDb = this.replicationService.getPrimaryDatabase();
    
    // Delete from primary first
    await deleteDoc(doc(primaryDb, 'products', id));

    // Then delete from other replicas
    await this.replicationService.deleteFromReplicas('products', id);
  }

  /**
   * Add new category with replication
   */
  async addCategory(categoryData: Omit<Category, 'id'>): Promise<string> {
    const primaryDb = this.replicationService.getPrimaryDatabase();
    
    // Add to primary first
    const docRef = await addDoc(collection(primaryDb, 'categories'), categoryData);
    
    // Then replicate to other databases
    await this.replicationService.replicateDocument('categories', docRef.id, categoryData);
    
    return docRef.id;
  }

  /**
   * Update existing category with replication
   */
  async updateCategory(id: string, categoryData: Partial<Omit<Category, 'id'>>): Promise<void> {
    const primaryDb = this.replicationService.getPrimaryDatabase();
    
    // Update on primary first
    const categoryRef = doc(primaryDb, 'categories', id);
    await updateDoc(categoryRef, categoryData);

    // Then replicate the update to other replicas
    await this.replicationService.replicateDocument('categories', id, categoryData);
  }

  /**
   * Delete category with replication
   */
  async deleteCategory(id: string): Promise<void> {
    const primaryDb = this.replicationService.getPrimaryDatabase();
    
    // Delete from primary first
    await deleteDoc(doc(primaryDb, 'categories', id));

    // Then delete from other replicas
    await this.replicationService.deleteFromReplicas('categories', id);
  }

  // Public methods for admin panel
  async fetchProducts(params?: SearchParams): Promise<Product[]> {
    try {
      const result = await this.replicationService.executeQuery(db => 
        this.fetchProductsInternal(db, params)
      ).toPromise();
      return result?.items || [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }

  async fetchCategories(): Promise<Category[]> {
    try {
      return await this.replicationService.executeQuery(db => 
        this.fetchCategoriesForAdmin(db)
      ).toPromise() || [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  // Private implementation methods

  private async fetchProductsInternal(db: Firestore, params?: SearchParams): Promise<SearchResult<Product>> {
    try {
      const productsCollection = collection(db, 'products');
      let q = query(productsCollection);

      // Handle category filtering
      if (params?.filter?.category) {
        console.log('Filtering by category:', params.filter.category);
        
        q = query(q, orderBy('createdAt', 'desc'), firestoreLimit(1000));
        
        const querySnapshot = await getDocs(q);
        const allProducts: Product[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data() as any;
          const product = {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date()
          };
          allProducts.push(product);
        });

        // Client-side category filtering
        const categoryFilteredProducts = allProducts.filter(product => 
          product.category === params?.filter?.category
        );

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

        return {
          items: paginatedProducts,
          total: filteredProducts.length,
          page: params?.page || 1,
          limit: params?.limit || 12,
          hasNext: endIndex < filteredProducts.length,
          hasPrev: (params?.page || 1) > 1
        };
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

      querySnapshot.forEach((doc) => {
        const data = doc.data() as any;
        const product = {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
        products.push(product);
      });

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

      return {
        items: filteredProducts,
        total: filteredProducts.length,
        page: params?.page || 1,
        limit: limitCount,
        hasNext: false,
        hasPrev: (params?.page || 1) > 1
      };
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

  private async fetchFeaturedProducts(db: Firestore, limitCount: number): Promise<Product[]> {
    try {
      const productsCollection = collection(db, 'products');
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

  private async fetchCategoriesInternal(db: Firestore): Promise<Category[]> {
    try {
      const categoriesCollection = collection(db, 'categories');
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

  private async fetchCategoriesForAdmin(db: Firestore): Promise<Category[]> {
    try {
      const categoriesCollection = collection(db, 'categories');
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

  private async fetchCategoryBySlug(db: Firestore, slug: string): Promise<Category | null> {
    try {
      const categories = await this.fetchCategoriesInternal(db);
      
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

  private async fetchProductById(db: Firestore, id: string): Promise<Product | null> {
    try {
      const productDoc = doc(db, 'products', id);
      const docSnap = await getDoc(productDoc);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as any;
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching product by ID:', error);
      return null;
    }
  }
}
import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  docData, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  DocumentReference,
  QueryConstraint
} from '@angular/fire/firestore';
import { Observable, map, from, combineLatest } from 'rxjs';
import { Product, Category, SearchParams, SearchResult, ProductFilter } from '../models';

@Injectable({
  providedIn: 'root'
})
export class FirebaseProductService {
  
  constructor(private firestore: Firestore) {}

  // ==================== PRODUCTS ====================
  
  // Get all products with filtering and pagination
  getProducts(params?: SearchParams): Observable<SearchResult<Product>> {
    return from(this.queryProducts(params));
  }

  private async queryProducts(params?: SearchParams): Promise<SearchResult<Product>> {
    const productsRef = collection(this.firestore, 'products');
    const constraints: QueryConstraint[] = [];

    // Apply filters
    if (params?.filter) {
      if (params.filter.category) {
        constraints.push(where('category', '==', params.filter.category));
      }
      if (params.filter.brand) {
        constraints.push(where('brand', '==', params.filter.brand));
      }
      if (params.filter.inStock) {
        constraints.push(where('stock', '>', 0));
      }
      if (params.filter.featured !== undefined) {
        constraints.push(where('featured', '==', params.filter.featured));
      }
    }

    // Apply sorting
    if (params?.sortBy) {
      const direction = params.sortOrder === 'desc' ? 'desc' : 'asc';
      constraints.push(orderBy(params.sortBy, direction));
    } else {
      constraints.push(orderBy('createdAt', 'desc'));
    }

    // Apply pagination
    const pageSize = params?.limit || 12;
    constraints.push(limit(pageSize));

    // Execute query
    const q = query(productsRef, ...constraints);
    const snapshot = await getDocs(q);
    
    const products: Product[] = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      products.push({
        id: doc.id,
        ...data,
        createdAt: data['createdAt']?.toDate() || new Date(),
        updatedAt: data['updatedAt']?.toDate() || new Date()
      } as Product);
    });

    // Apply client-side filters that Firestore can't handle
    let filteredProducts = products;
    
    // Search query filter
    if (params?.query) {
      const query = params.query.toLowerCase();
      filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Price range filter
    if (params?.filter?.priceRange) {
      filteredProducts = filteredProducts.filter(product =>
        product.price >= params.filter!.priceRange!.min &&
        product.price <= params.filter!.priceRange!.max
      );
    }

    // Rating filter
    if (params?.filter?.rating) {
      filteredProducts = filteredProducts.filter(product =>
        product.rating >= params.filter!.rating!
      );
    }

    return {
      items: filteredProducts,
      total: filteredProducts.length,
      page: params?.page || 1,
      limit: pageSize,
      hasNext: false, // Simplified for now
      hasPrev: (params?.page || 1) > 1
    };
  }

  // Get single product by ID
  getProduct(id: string): Observable<Product | null> {
    const productRef = doc(this.firestore, 'products', id);
    return docData(productRef, { idField: 'id' }).pipe(
      map(data => {
        if (!data) return null;
        const productData = data as any;
        return {
          ...productData,
          createdAt: productData.createdAt?.toDate() || new Date(),
          updatedAt: productData.updatedAt?.toDate() || new Date()
        } as Product;
      })
    );
  }

  // Get featured products
  getFeaturedProducts(limitCount: number = 8): Observable<Product[]> {
    const productsRef = collection(this.firestore, 'products');
    const q = query(
      productsRef,
      where('featured', '==', true),
      where('status', '==', 'active'),
      orderBy('rating', 'desc'),
      limit(limitCount)
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(products => products.map(product => {
        const productData = product as any;
        return {
          ...productData,
          createdAt: productData.createdAt?.toDate() || new Date(),
          updatedAt: productData.updatedAt?.toDate() || new Date()
        } as Product;
      }))
    );
  }

  // Get products by category
  getProductsByCategory(categorySlug: string, params?: SearchParams): Observable<SearchResult<Product>> {
    const updatedParams = {
      ...params,
      filter: {
        ...params?.filter,
        category: categorySlug
      }
    };
    return this.getProducts(updatedParams);
  }

  // Add new product (Admin only)
  async addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const productsRef = collection(this.firestore, 'products');
    const productData = {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const docRef = await addDoc(productsRef, productData);
    return docRef.id;
  }

  // Update product (Admin only)
  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    const productRef = doc(this.firestore, 'products', id);
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };
    await updateDoc(productRef, updateData);
  }

  // Delete product (Admin only)
  async deleteProduct(id: string): Promise<void> {
    const productRef = doc(this.firestore, 'products', id);
    await deleteDoc(productRef);
  }

  // ==================== CATEGORIES ====================

  // Get all categories
  getCategories(): Observable<Category[]> {
    const categoriesRef = collection(this.firestore, 'categories');
    const q = query(
      categoriesRef,
      where('isActive', '==', true),
      orderBy('sortOrder', 'asc')
    );

    return collectionData(q, { idField: 'id' }).pipe(
      map(categories => this.buildCategoryTree(categories as Category[]))
    );
  }

  // Get category by slug
  getCategory(slug: string): Observable<Category | null> {
    const categoriesRef = collection(this.firestore, 'categories');
    const q = query(categoriesRef, where('slug', '==', slug), limit(1));
    
    return from(getDocs(q)).pipe(
      map(snapshot => {
        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Category;
      })
    );
  }

  // Add new category (Admin only)
  async addCategory(category: Omit<Category, 'id'>): Promise<string> {
    const categoriesRef = collection(this.firestore, 'categories');
    const docRef = await addDoc(categoriesRef, category);
    return docRef.id;
  }

  // Update category (Admin only)
  async updateCategory(id: string, updates: Partial<Category>): Promise<void> {
    const categoryRef = doc(this.firestore, 'categories', id);
    await updateDoc(categoryRef, updates);
  }

  // Build category tree structure
  private buildCategoryTree(categories: Category[]): Category[] {
    const categoryMap = new Map<string, Category>();
    const rootCategories: Category[] = [];

    // First pass: create map
    categories.forEach(category => {
      categoryMap.set(category.id, { ...category, children: [] });
    });

    // Second pass: build tree
    categories.forEach(category => {
      const categoryWithChildren = categoryMap.get(category.id)!;
      
      if (category.parentId) {
        const parent = categoryMap.get(category.parentId);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(categoryWithChildren);
        }
      } else {
        rootCategories.push(categoryWithChildren);
      }
    });

    return rootCategories;
  }

  // ==================== SEARCH ====================

  // Advanced search with multiple criteria
  searchProducts(searchTerm: string, filters?: ProductFilter): Observable<Product[]> {
    // Firestore doesn't support full-text search natively
    // This is a simplified implementation
    // For production, consider using Algolia or Elasticsearch
    
    const productsRef = collection(this.firestore, 'products');
    const constraints: QueryConstraint[] = [
      where('status', '==', 'active')
    ];

    if (filters?.category) {
      constraints.push(where('category', '==', filters.category));
    }

    const q = query(productsRef, ...constraints);
    
    return collectionData(q, { idField: 'id' }).pipe(
      map(products => {
        const searchLower = searchTerm.toLowerCase();
        return (products as Product[]).filter(product =>
          product.name.toLowerCase().includes(searchLower) ||
          product.description.toLowerCase().includes(searchLower) ||
          product.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      })
    );
  }
}

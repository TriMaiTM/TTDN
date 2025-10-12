import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, of, firstValueFrom } from 'rxjs';
import { Product, Category, SearchParams, SearchResult, ProductFilter } from '../models';
import { ReplicatedProductService } from './replicated-product.service';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private firebaseProductService = inject(ReplicatedProductService);
  private productsSubject = new BehaviorSubject<Product[]>([]);
  public products$ = this.productsSubject.asObservable();

  constructor() {
    // Load initial products from Firebase
    this.loadProductsFromFirebase();
  }

  private async loadProductsFromFirebase(): Promise<void> {
    try {
      const products = await this.firebaseProductService.fetchProducts({ limit: 1000 });
      this.productsSubject.next(products);
    } catch (error) {
      console.error('Error loading products from Firebase:', error);
      this.productsSubject.next([]);
    }
  }

  // Get all products - now delegated to Firebase
  getProducts(params?: SearchParams): Observable<SearchResult<Product>> {
    return this.firebaseProductService.getProducts(params);
  }

  // Get product by ID
  getProduct(id: string): Observable<Product | null> {
    return this.firebaseProductService.getProduct(id);
  }

  // Get featured products
  getFeaturedProducts(limit: number = 8): Observable<Product[]> {
    return this.firebaseProductService.getFeaturedProducts(limit);
  }

  // Get products by category
  getProductsByCategory(categorySlug: string, params?: SearchParams): Observable<SearchResult<Product>> {
    return this.firebaseProductService.getProductsByCategory(categorySlug, params);
  }

  // Search products - use getProducts with query parameter
  searchProducts(searchTerm: string, filters?: ProductFilter): Observable<Product[]> {
    const searchParams: SearchParams = {
      query: searchTerm,
      filter: filters,
      limit: 100 // Get more results for search
    };
    
    return this.firebaseProductService.getProducts(searchParams).pipe(
      map(result => result.items)
    );
  }

  // Check if product can be ordered (inventory check)
  canOrder(productId: string, quantity: number): Observable<boolean> {
    return this.getProduct(productId).pipe(
      map(product => {
        if (!product) {
          console.warn(`Product with ID '${productId}' not found`);
          return false;
        }
        return product.stock >= quantity;
      })
    );
  }

  // Decrease inventory - now works with Firebase products
  async decreaseInventory(productId: string, quantity: number): Promise<void> {
    try {
      const product = await firstValueFrom(this.getProduct(productId));
      
      if (!product) {
        console.warn(`⚠️ Product with ID '${productId}' not found in Firebase. Skipping inventory decrease.`);
        return; // Graceful handling instead of throwing error
      }

      if (product.stock < quantity) {
        console.warn(`⚠️ Insufficient stock for product '${product.name}'. Available: ${product.stock}, Requested: ${quantity}`);
        return;
      }

      const newStock = product.stock - quantity;
      await this.firebaseProductService.updateProduct(productId, { stock: newStock });
      
      console.log(`✅ Decreased inventory for ${product.name}: ${product.stock} → ${newStock}`);
      
      // Refresh local products cache
      await this.loadProductsFromFirebase();

    } catch (error) {
      console.error('Error decreasing inventory:', error);
    }
  }

  // Increase inventory - now works with Firebase products  
  async increaseInventory(productId: string, quantity: number): Promise<void> {
    try {
      const product = await firstValueFrom(this.getProduct(productId));
      
      if (!product) {
        console.warn(`⚠️ Product with ID '${productId}' not found in Firebase. Skipping inventory increase.`);
        return; // Graceful handling instead of throwing error
      }

      const newStock = product.stock + quantity;
      await this.firebaseProductService.updateProduct(productId, { stock: newStock });
      
      console.log(`✅ Increased inventory for ${product.name}: ${product.stock} → ${newStock}`);
      
      // Refresh local products cache
      await this.loadProductsFromFirebase();

    } catch (error) {
      console.error('Error increasing inventory:', error);
    }
  }

  // Get categories
  getCategories(): Observable<Category[]> {
    return this.firebaseProductService.getCategories();
  }

  // Get single category
  getCategory(slug: string): Observable<Category | null> {
    return this.firebaseProductService.getCategory(slug);
  }

  // Admin methods - delegate to Firebase service
  async addProduct(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const productId = await this.firebaseProductService.addProduct(product);
    await this.loadProductsFromFirebase(); // Refresh cache
    return productId;
  }

  async updateProduct(id: string, updates: Partial<Product>): Promise<void> {
    await this.firebaseProductService.updateProduct(id, updates);
    await this.loadProductsFromFirebase(); // Refresh cache
  }

  async deleteProduct(id: string): Promise<void> {
    await this.firebaseProductService.deleteProduct(id);
    await this.loadProductsFromFirebase(); // Refresh cache
  }

  // Utility methods
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  calculateDiscountPrice(product: Product): number {
    if (product.discount && product.originalPrice) {
      return product.originalPrice - (product.originalPrice * product.discount / 100);
    }
    return product.price;
  }

  // Check if product is in stock
  isInStock(product: Product): boolean {
    return product.stock > 0;
  }

  // Get stock status
  getStockStatus(product: Product): 'in-stock' | 'low-stock' | 'out-of-stock' {
    if (product.stock === 0) return 'out-of-stock';
    if (product.stock < 10) return 'low-stock';
    return 'in-stock';
  }
}
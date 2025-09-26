import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { FirebaseProductService } from '../../services/firebase-product.service';
import { DirectFirebaseProductService } from '../../services/direct-firebase-product.service';
import { CartService } from '../../services/cart.service';
import { Product, Category, SearchParams, SearchResult } from '../../models';
import { Observable, combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CategoryFilterComponent } from '../../components/category-filter/category-filter.component';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatCardModule, 
    MatButtonModule, 
    MatIconModule, 
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    CategoryFilterComponent
  ],
  templateUrl: './products.html',
  styleUrls: ['./products.scss']
})
export class ProductsComponent implements OnInit {
  searchResult$!: Observable<SearchResult<Product>>;
  categories$: Observable<Category[]>;
  loading = false;
  
  // Form controls
  searchControl = new FormControl('');
  sortControl = new FormControl('name');
  categoryControl = new FormControl('');
  
  // Pagination
  currentPage = 1;
  pageSize = 12;
  
  // Current category
  currentCategory: Category | null = null;

  constructor(
    private productService: DirectFirebaseProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    console.log('ProductsComponent constructor - initializing...');
    this.categories$ = this.productService.getCategories();
    
    // Direct test of Firebase service
    console.log('🔍 Testing DirectFirebaseProductService...');
    this.productService.getProducts({ limit: 5 }).subscribe({
      next: (result) => {
        console.log('🎯 DirectFirebaseProductService test result:', result);
      },
      error: (error) => {
        console.error('❌ DirectFirebaseProductService test error:', error);
      }
    });
  }

  ngOnInit(): void {
    console.log('ProductsComponent ngOnInit called');
    
    // Initialize products observable
    this.searchResult$ = this.loadProducts();
    
    // Debug subscription
    this.searchResult$.subscribe({
      next: (result) => {
        console.log('🎯 Products loaded successfully:', result);
        if (result.items) {
          console.log(`📦 Found ${result.items.length} products:`, result.items.map(p => p.name));
        }
      },
      error: (error) => {
        console.error('❌ Error loading products:', error);
      }
    });
    
    // Listen to route params for category
    this.route.params.subscribe(params => {
      console.log('Route params:', params);
      if (params['category']) {
        this.categoryControl.setValue(params['category']);
        this.loadCategoryInfo(params['category']);
      }
      this.searchResult$ = this.loadProducts();
    });

    // Listen to form changes
    combineLatest([
      this.searchControl.valueChanges.pipe(startWith('')),
      this.sortControl.valueChanges.pipe(startWith('name')),
      this.categoryControl.valueChanges.pipe(startWith(''))
    ]).subscribe(() => {
      console.log('Form controls changed');
      this.currentPage = 1;
      this.searchResult$ = this.loadProducts();
    });
  }

  private loadProducts(): Observable<SearchResult<Product>> {
    const searchParams: SearchParams = {
      query: this.searchControl.value || '',
      sortBy: this.sortControl.value as any,
      page: this.currentPage,
      limit: this.pageSize,
      filter: {
        category: this.categoryControl.value || undefined
      }
    };

    console.log('LoadProducts called with params:', searchParams);

    if (this.categoryControl.value) {
      console.log('Loading products by category:', this.categoryControl.value);
      return this.productService.getProductsByCategory(
        this.categoryControl.value, 
        searchParams
      );
    } else {
      console.log('Loading all products');
      return this.productService.getProducts(searchParams);
    }
  }

  private loadCategoryInfo(categorySlug: string): void {
    this.productService.getCategory(categorySlug).subscribe((category: Category | null) => {
      this.currentCategory = category;
    });
  }

  onPageChange(event: any): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    this.searchResult$ = this.loadProducts();
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    // Could add a toast notification here
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  getDiscountedPrice(product: Product): number {
    if (product.discount && product.originalPrice) {
      return product.originalPrice - (product.originalPrice * product.discount / 100);
    }
    return product.price;
  }

  clearFilters(): void {
    console.log('Clearing all filters'); // Debug log
    this.searchControl.setValue('');
    this.categoryControl.setValue('');
    this.sortControl.setValue('name');
    this.currentPage = 1;
    this.currentCategory = null;
  }

  // Debug method to test all products
  debugAllProducts(): void {
    console.log('Loading all products for debug...');
    this.productService.getProducts({ limit: 100 }).subscribe((result: SearchResult<Product>) => {
      console.log('All products debug:', result);
      result.items.forEach(p => console.log(`Product: ${p.name}, Category: ${p.category}`));
    });
  }

  goToProduct(productId: string): void {
    this.router.navigate(['/product', productId]).then(() => {
      // Scroll to top after navigation
      window.scrollTo(0, 0);
    });
  }

  addToWishlist(product: Product): void {
    // Add wishlist functionality
    console.log('Added to wishlist:', product.name);
  }

  quickView(product: Product): void {
    // Open quick view modal
    console.log('Quick view:', product.name);
  }

  getMin(a: number, b: number): number {
    return Math.min(a, b);
  }

  onCategorySelected(categorySlug: string | null) {
    console.log('Products component received category:', categorySlug); // Debug log
    this.categoryControl.setValue(categorySlug || '');
    this.currentPage = 1;
    this.searchResult$ = this.loadProducts();
  }

  onQuickFilterApplied(filter: any) {
    switch (filter.filter) {
      case 'newest':
        this.sortControl.setValue('createdAt');
        break;
      case 'cheapest':
        this.sortControl.setValue('price');
        break;
      case 'highest_rated':
        this.sortControl.setValue('rating');
        break;
      case 'on_sale':
        // Could implement discount filtering
        break;
    }
    this.currentPage = 1;
    this.searchResult$ = this.loadProducts();
  }

  // Stock display methods
  getProductStockClass(product: Product): string {
    if (!product.stock || product.stock === 0) return 'stock-out';
    if (product.stock < 5) return 'stock-low';
    return 'stock-ok';
  }

  getProductStockIcon(product: Product): string {
    if (!product.stock || product.stock === 0) return 'cancel';
    if (product.stock < 5) return 'warning';
    return 'check_circle';
  }

  getProductStockText(product: Product): string {
    if (!product.stock || product.stock === 0) return 'Hết hàng';
    if (product.stock < 5) return `Còn ${product.stock}`;
    return `Còn ${product.stock}`;
  }
}

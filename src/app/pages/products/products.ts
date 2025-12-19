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
import { ReplicatedProductService } from '../../services/replicated-product.service';
import { CartService } from '../../services/cart.service';
import { Product, Category, SearchParams, SearchResult } from '../../models';
import { Observable, combineLatest, BehaviorSubject, of } from 'rxjs';
import { map, startWith, shareReplay, switchMap, tap, catchError } from 'rxjs/operators';
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

  constructor(
    private productService: ReplicatedProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    console.log('ProductsComponent constructor - initializing...');
    this.categories$ = this.productService.getCategories();
    
    // Direct test of Firebase service
    console.log('🔍 Testing ReplicatedProductService...');
    this.productService.getProducts({ limit: 5 }).subscribe({
      next: (result) => {
        console.log('🎯 ReplicatedProductService test result:', result);
      },
      error: (error) => {
        console.error('❌ ReplicatedProductService test error:', error);
      }
    });
  }

    // Pagination
    page$ = new BehaviorSubject<number>(1);
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
    }

    ngOnInit(): void {
        console.log('ProductsComponent ngOnInit called');

        // Create a stable stream of search parameters derived from form controls AND page stream
        const searchParams$ = combineLatest([
            this.searchControl.valueChanges.pipe(startWith(this.searchControl.value || '')),
            this.sortControl.valueChanges.pipe(startWith(this.sortControl.value || 'name')),
            this.categoryControl.valueChanges.pipe(startWith(this.categoryControl.value || '')),
            this.page$ // Include page stream
        ]).pipe(
            tap(values => console.log('🔹 detailed info: combineLatest emitted:', values)),
            map(([query, sortBy, category, page]) => {
                const params: SearchParams = {
                    query: query || '',
                    sortBy: sortBy as any,
                    page: page, // Use the page from the stream
                    limit: this.pageSize,
                    filter: {
                        category: category || undefined
                    }
                };
                return params;
            })
        );

        // Define searchResult$ ONCE using switchMap
        // When params change -> Switch to new API call
        this.searchResult$ = searchParams$.pipe(
            tap(params => console.log('🔹 searchParams$ pipeline emitted:', params)),
            switchMap(params => {
                console.log('🔄 switchMap triggering fetch with:', params);
                let obs$: Observable<SearchResult<Product>>;

                if (params.filter?.category) {
                    console.log('📂 Loading products by category:', params.filter.category);
                    obs$ = this.productService.getProductsByCategory(
                        params.filter.category,
                        params
                    );
                } else {
                    console.log('🌍 Loading all products');
                    obs$ = this.productService.getProducts(params);
                }

                return obs$.pipe(
                    tap(result => console.log('✅ Fetch success:', result.total, 'items')),
                    catchError(err => {
                        console.error('🔴 Fetch error in switchMap:', err);
                        return of({ items: [], total: 0, page: 1, limit: 10, hasNext: false, hasPrev: false });
                    })
                );
            }),
            tap(final => console.log('🎁 searchResult$ emitting final result to template')),
            shareReplay(1) // Share result to all subscribers in template
        );

        // Listen to route params
        this.route.params.subscribe(params => {
            console.log('Route params changed:', params);
            if (params['category']) {
                this.categoryControl.setValue(params['category']); // Triggers pipeline
                this.loadCategoryInfo(params['category']);
            }
        });

        this.setupPageReset();
    }

    private loadCategoryInfo(categorySlug: string): void {
        this.productService.getCategory(categorySlug).subscribe((category: Category | null) => {
            this.currentCategory = category;
        });
    }

    onPageChange(event: any): void {
        this.pageSize = event.pageSize;
        this.page$.next(event.pageIndex + 1); // Trigger new emission
    }

    // Reset page on filter change?
    // We can add a tap() in the pipeline or separate logic.
    // For now, let's keep it simple. If we wanted to reset page on filter change, we'd need more complex logic
    // or manually set this.page$.next(1) when controls change.
    // But since controls are observables, we can't easily hook "change -> reset page" inside the same combineLatest without loop.
    // For now, let's add specific subscriptions to reset page.

    private setupPageReset() {
        combineLatest([
            this.searchControl.valueChanges,
            this.sortControl.valueChanges,
            this.categoryControl.valueChanges
        ]).subscribe(() => {
            if (this.page$.value !== 1) {
                this.page$.next(1);
            }
        });
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
        console.log('Clearing all filters');
        this.searchControl.setValue('');
        this.categoryControl.setValue('');
        this.sortControl.setValue('name');
        this.page$.next(1);
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
        console.log('Products component received category:', categorySlug);
        this.categoryControl.setValue(categorySlug || '');
        this.page$.next(1);
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
        this.page$.next(1);
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

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Product, Category } from '../../models';
import { DirectFirebaseProductService } from '../../services/direct-firebase-product.service';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatChipsModule,
    MatTabsModule,
    MatBadgeModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  template: `
    <div class="container" *ngIf="product">
      <!-- Breadcrumb -->
      <nav class="breadcrumb">
        <a routerLink="/home" mat-button>
          <mat-icon>home</mat-icon>
          Trang chủ
        </a>
        <mat-icon>chevron_right</mat-icon>
        <a routerLink="/products" mat-button>Sản phẩm</a>
        <mat-icon>chevron_right</mat-icon>
        <span class="current">{{ product.name }}</span>
      </nav>

      <!-- Product Info -->
      <div class="product-detail">
        <div class="product-images">
          <div class="main-image">
            <img [src]="currentImage || '/assets/images/no-image.png'" 
                 [alt]="product.name" 
                 class="product-image">
          </div>
          
          <div class="image-thumbnails" *ngIf="product.images && product.images.length > 1">
            <img *ngFor="let image of product.images" 
                 [src]="image" 
                 [alt]="product.name"
                 [class.active]="currentImage === image"
                 (click)="currentImage = image"
                 class="thumbnail">
          </div>
        </div>

        <div class="product-info">
          <div class="product-header">
            <h1>{{ product.name }}</h1>
            <div class="product-meta">
              <span class="sku">Mã: {{ product.sku }}</span>
              <div class="rating" *ngIf="product.rating > 0">
                <div class="stars">
                  <mat-icon *ngFor="let star of getStars(product.rating)" 
                           [class]="star > 0 ? 'star-filled' : 'star-empty'">
                    {{ star > 0 ? 'star' : 'star_border' }}
                  </mat-icon>
                </div>
                <span class="rating-text">{{ product.rating }}/5</span>
                <span class="review-count" *ngIf="product.reviewCount > 0">
                  ({{ product.reviewCount }} đánh giá)
                </span>
              </div>
            </div>
          </div>

          <div class="price-section">
            <div class="price">
              <span class="current-price">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</span>
              <span class="original-price" *ngIf="product.originalPrice && product.originalPrice > product.price">
                {{ product.originalPrice | currency:'VND':'symbol':'1.0-0' }}
              </span>
              <span class="discount" *ngIf="product.discount">
                -{{ product.discount }}%
              </span>
            </div>
          </div>

          <div class="stock-section">
            <div class="stock-info" [class]="getStockClass()">
              <mat-icon>{{ getStockIcon() }}</mat-icon>
              <span>{{ getStockText() }}</span>
            </div>
            <span class="unit">Đơn vị: {{ product.unit }}</span>
          </div>

          <div class="category-section">
            <mat-chip>{{ product.category }}</mat-chip>
            <mat-chip *ngIf="product.subcategory">{{ product.subcategory }}</mat-chip>
          </div>

          <div class="quantity-section">
            <label>Số lượng:</label>
            <div class="quantity-controls">
              <button mat-icon-button (click)="decreaseQuantity()" [disabled]="quantity <= 1">
                <mat-icon>remove</mat-icon>
              </button>
              <input [(ngModel)]="quantity" type="number" min="1" [max]="product.stock" class="quantity-input">
              <button mat-icon-button (click)="increaseQuantity()" [disabled]="quantity >= product.stock">
                <mat-icon>add</mat-icon>
              </button>
            </div>
          </div>

          <div class="action-buttons">
            <button mat-raised-button 
                    color="primary" 
                    class="add-to-cart"
                    [disabled]="product.stock === 0"
                    (click)="addToCart()">
              <mat-icon>add_shopping_cart</mat-icon>
              Thêm vào giỏ hàng
            </button>
            
            <button mat-raised-button 
                    color="accent" 
                    class="buy-now"
                    [disabled]="product.stock === 0"
                    (click)="buyNow()">
              <mat-icon>flash_on</mat-icon>
              Mua ngay
            </button>
          </div>

          <div class="product-tags" *ngIf="product.tags && product.tags.length > 0">
            <h4>Tags:</h4>
            <mat-chip *ngFor="let tag of product.tags">{{ tag }}</mat-chip>
          </div>
        </div>
      </div>

      <!-- Product Details Tabs -->
      <mat-tab-group class="product-tabs">
        <mat-tab label="Mô tả sản phẩm">
          <div class="tab-content">
            <div class="description">
              <p *ngIf="product.shortDescription">{{ product.shortDescription }}</p>
              <div [innerHTML]="formatDescription(product.description)"></div>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Thông số kỹ thuật" *ngIf="product.specifications && product.specifications.length > 0">
          <div class="tab-content">
            <div class="specifications">
              <table class="spec-table">
                <tr *ngFor="let spec of product.specifications">
                  <td class="spec-name">{{ spec.name }}</td>
                  <td class="spec-value">
                    {{ spec.value }}
                    <span *ngIf="spec.unit"> {{ spec.unit }}</span>
                  </td>
                </tr>
              </table>
            </div>
          </div>
        </mat-tab>

        <mat-tab label="Thông tin thêm">
          <div class="tab-content">
            <div class="additional-info">
              <div class="info-item" *ngIf="product.brand">
                <strong>Thương hiệu:</strong> {{ product.brand }}
              </div>
              <div class="info-item" *ngIf="product.model">
                <strong>Model:</strong> {{ product.model }}
              </div>
              <div class="info-item" *ngIf="product.weight">
                <strong>Trọng lượng:</strong> {{ product.weight }} kg
              </div>
              <div class="info-item" *ngIf="product.dimensions">
                <strong>Kích thước:</strong> 
                {{ product.dimensions.length }} x {{ product.dimensions.width }} x {{ product.dimensions.height }} 
                {{ product.dimensions.unit }}
              </div>
            </div>
          </div>
        </mat-tab>
      </mat-tab-group>

      <!-- Related Products -->
      <div class="related-products" *ngIf="relatedProducts && relatedProducts.length > 0">
        <h3>Sản phẩm liên quan</h3>
        <div class="products-grid">
          <mat-card *ngFor="let relatedProduct of relatedProducts" 
                   class="product-card"
                   (click)="navigateToProduct(relatedProduct.id)">
            <img [src]="relatedProduct.images[0] || '/assets/images/no-image.png'" 
                 [alt]="relatedProduct.name" 
                 class="related-product-image">
            <mat-card-content>
              <h4>{{ relatedProduct.name }}</h4>
              <p class="price">{{ relatedProduct.price | currency:'VND':'symbol':'1.0-0' }}</p>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div class="loading-container" *ngIf="loading">
      <mat-spinner></mat-spinner>
      <p>Đang tải thông tin sản phẩm...</p>
    </div>

    <!-- Not Found State -->
    <div class="not-found" *ngIf="!loading && !product">
      <mat-icon>error_outline</mat-icon>
      <h2>Không tìm thấy sản phẩm</h2>
      <p>Sản phẩm bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
      <button mat-raised-button color="primary" routerLink="/products">
        <mat-icon>arrow_back</mat-icon>
        Quay lại danh sách sản phẩm
      </button>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      margin-bottom: 30px;
      color: #666;
    }

    .breadcrumb a {
      color: #666;
      text-decoration: none;
    }

    .breadcrumb .current {
      color: #333;
      font-weight: 500;
    }

    .product-detail {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
      margin-bottom: 40px;
    }

    .product-images {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .main-image {
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
      background: #f9f9f9;
    }

    .product-image {
      width: 100%;
      height: 400px;
      object-fit: cover;
    }

    .image-thumbnails {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .thumbnail {
      width: 80px;
      height: 80px;
      object-fit: cover;
      border: 2px solid transparent;
      border-radius: 4px;
      cursor: pointer;
      transition: border-color 0.3s;
    }

    .thumbnail:hover {
      border-color: #666;
    }

    .thumbnail.active {
      border-color: #1976d2;
    }

    .product-info {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .product-header h1 {
      font-size: 28px;
      margin: 0 0 10px 0;
      color: #333;
    }

    .product-meta {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .sku {
      color: #666;
      font-size: 14px;
    }

    .rating {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .stars {
      display: flex;
      gap: 2px;
    }

    .star-filled {
      color: #ffc107;
    }

    .star-empty {
      color: #ddd;
    }

    .rating-text {
      font-weight: 500;
    }

    .review-count {
      color: #666;
      font-size: 14px;
    }

    .price-section {
      padding: 20px 0;
      border-top: 1px solid #eee;
      border-bottom: 1px solid #eee;
    }

    .price {
      display: flex;
      align-items: center;
      gap: 15px;
    }

    .current-price {
      font-size: 32px;
      font-weight: bold;
      color: #e91e63;
    }

    .original-price {
      font-size: 20px;
      text-decoration: line-through;
      color: #999;
    }

    .discount {
      background: #ff4444;
      color: white;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }

    .stock-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .stock-info {
      display: flex;
      align-items: center;
      gap: 8px;
      font-weight: 500;
    }

    .stock-info.in-stock {
      color: #4caf50;
    }

    .stock-info.low-stock {
      color: #ff9800;
    }

    .stock-info.out-of-stock {
      color: #f44336;
    }

    .unit {
      color: #666;
      font-size: 14px;
    }

    .category-section {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .quantity-section {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .quantity-section label {
      font-weight: 500;
    }

    .quantity-controls {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .quantity-input {
      width: 80px;
      text-align: center;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 8px;
      font-size: 16px;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
    }

    .add-to-cart, .buy-now {
      flex: 1;
      height: 50px;
      font-size: 16px;
      font-weight: 500;
    }

    .product-tags h4 {
      margin: 0 0 10px 0;
      font-size: 16px;
    }

    .product-tabs {
      margin-bottom: 40px;
    }

    .tab-content {
      padding: 20px;
    }

    .description {
      line-height: 1.6;
      color: #555;
    }

    .spec-table {
      width: 100%;
      border-collapse: collapse;
    }

    .spec-table td {
      padding: 12px 0;
      border-bottom: 1px solid #eee;
    }

    .spec-name {
      font-weight: 500;
      width: 30%;
      color: #333;
    }

    .spec-value {
      color: #666;
    }

    .additional-info {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }

    .info-item {
      color: #555;
    }

    .info-item strong {
      color: #333;
      margin-right: 10px;
    }

    .related-products {
      margin-top: 60px;
    }

    .related-products h3 {
      margin-bottom: 20px;
      font-size: 24px;
      color: #333;
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }

    .product-card {
      cursor: pointer;
      transition: transform 0.3s, box-shadow 0.3s;
    }

    .product-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    }

    .related-product-image {
      width: 100%;
      height: 200px;
      object-fit: cover;
    }

    .product-card h4 {
      margin: 10px 0 5px 0;
      font-size: 16px;
      color: #333;
    }

    .product-card .price {
      color: #e91e63;
      font-weight: bold;
      font-size: 18px;
      margin: 0;
    }

    .loading-container, .not-found {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 60px 20px;
      text-align: center;
    }

    .loading-container mat-spinner {
      margin-bottom: 20px;
    }

    .not-found mat-icon {
      font-size: 64px;
      color: #ccc;
      margin-bottom: 20px;
    }

    .not-found h2 {
      color: #333;
      margin-bottom: 10px;
    }

    .not-found p {
      color: #666;
      margin-bottom: 30px;
    }

    @media (max-width: 768px) {
      .container {
        padding: 10px;
      }

      .product-detail {
        grid-template-columns: 1fr;
        gap: 20px;
      }

      .breadcrumb {
        font-size: 14px;
        flex-wrap: wrap;
      }

      .current-price {
        font-size: 24px;
      }

      .action-buttons {
        flex-direction: column;
      }

      .products-grid {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 15px;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private productService = inject(DirectFirebaseProductService);
  private cartService = inject(CartService);
  private snackBar = inject(MatSnackBar);

  product: Product | null = null;
  relatedProducts: Product[] = [];
  loading = true;
  quantity = 1;
  currentImage = '';

  async ngOnInit() {
    this.route.params.subscribe(async params => {
      const productId = params['id'];
      if (productId) {
        await this.loadProduct(productId);
      }
    });
  }

  async loadProduct(id: string) {
    this.loading = true;
    try {
      this.productService.getProduct(id).subscribe(async product => {
        if (product) {
          this.product = product;
          this.currentImage = product.images?.[0] || '';
          await this.loadRelatedProducts(product.category);
        }
        this.loading = false;
      });
    } catch (error) {
      console.error('Error loading product:', error);
      this.loading = false;
    }
  }

  async loadRelatedProducts(category: string) {
    if (!this.product) return;
    
    try {
      const products = await this.productService.fetchProducts({ limit: 8 });
      this.relatedProducts = products
        .filter(p => p.category === category && p.id !== this.product!.id)
        .slice(0, 4);
    } catch (error) {
      console.error('Error loading related products:', error);
    }
  }

  getStars(rating: number): number[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= rating ? 1 : 0);
    }
    return stars;
  }

  getStockClass(): string {
    if (!this.product) return '';
    if (this.product.stock === 0) return 'out-of-stock';
    if (this.product.stock < 10) return 'low-stock';
    return 'in-stock';
  }

  getStockIcon(): string {
    if (!this.product) return 'help';
    if (this.product.stock === 0) return 'cancel';
    if (this.product.stock < 10) return 'warning';
    return 'check_circle';
  }

  getStockText(): string {
    if (!this.product) return '';
    if (this.product.stock === 0) return 'Hết hàng';
    if (this.product.stock < 10) return `Chỉ còn ${this.product.stock} sản phẩm`;
    return 'Còn hàng';
  }

  increaseQuantity() {
    if (this.product && this.quantity < this.product.stock) {
      this.quantity++;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  addToCart() {
    if (!this.product) return;
    
    this.cartService.addToCart(this.product, this.quantity);
    this.snackBar.open(
      `Đã thêm ${this.quantity} ${this.product.name} vào giỏ hàng`, 
      'Đóng', 
      { duration: 3000 }
    );
  }

  buyNow() {
    if (!this.product) return;
    
    this.addToCart();
    this.router.navigate(['/cart']);
  }

  navigateToProduct(productId: string) {
    this.router.navigate(['/product', productId]);
  }

  formatDescription(description: string): string {
    if (!description) return '';
    return description.replace(/\n/g, '<br>');
  }
}

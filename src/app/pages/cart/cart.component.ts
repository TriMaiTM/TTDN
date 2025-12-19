import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Observable, firstValueFrom } from 'rxjs';

import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ReplicatedProductService } from '../../services/replicated-product.service';
import { Cart, CartItem } from '../../models/order.model';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent implements OnInit {
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private productService = inject(ReplicatedProductService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  cart$: Observable<Cart> = this.cartService.cart$;
  
  // Store stock data
  stockData: { [productId: string]: number } = {};
  
  // Computed signal for authentication
  get isAuthenticated() { 
    return this.authService.isAuthenticated(); 
  }

  async ngOnInit() {
    // Load cart when component initializes
    // Load stock data for all cart items
    this.cart$.subscribe(async (cart) => {
      if (cart?.items) {
        for (const item of cart.items) {
          if (!this.stockData[item.productId]) {
            this.stockData[item.productId] = await this.getStock(item.productId);
          }
        }
      }
    });
  }

  async updateQuantity(productId: string, quantity: number) {
    try {
      // Check stock before updating
      const stock = await this.getStock(productId);
      if (quantity > stock) {
        this.snackBar.open(`Chỉ còn ${stock} sản phẩm trong kho`, 'Đóng', { duration: 3000 });
        return;
      }
      
      await this.cartService.updateQuantity(productId, quantity);
      this.snackBar.open('Đã cập nhật số lượng', 'Đóng', { duration: 2000 });
    } catch (error: any) {
      this.snackBar.open(error.message || 'Không thể cập nhật', 'Đóng', { duration: 3000 });
    }
  }

  async removeItem(productId: string) {
    try {
      await this.cartService.removeFromCart(productId);
      this.snackBar.open('Đã xóa sản phẩm khỏi giỏ hàng', 'Đóng', { duration: 2000 });
    } catch (error: any) {
      this.snackBar.open('Không thể xóa sản phẩm', 'Đóng', { duration: 3000 });
    }
  }

  async clearCart() {
    try {
      await this.cartService.clearCart();
      this.snackBar.open('Đã xóa tất cả sản phẩm', 'Đóng', { duration: 2000 });
    } catch (error: any) {
      this.snackBar.open('Không thể xóa giỏ hàng', 'Đóng', { duration: 3000 });
    }
  }

  goToCheckout() {
    this.router.navigate(['/checkout']);
  }

  continueShopping() {
    this.router.navigate(['/products']);
  }

  login() {
    this.router.navigate(['/auth/login']);
  }

  goToProductDetail(productId: string) {
    this.router.navigate(['/products', productId]);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  // Stock-related methods
  async getStock(productId: string): Promise<number> {
    try {
      const product = await firstValueFrom(this.productService.getProduct(productId));
      return product?.stock || 0;
    } catch (error) {
      console.error('Error getting stock:', error);
      return 0;
    }
  }

  async canIncreaseQuantity(item: CartItem): Promise<boolean> {
    const stock = await this.getStock(item.productId);
    return item.quantity < stock;
  }

  getStockClass(item: CartItem): string {
    // This will be used with async pipe in template
    return '';
  }

  getStockText(item: CartItem, stock: number): string {
    if (stock === 0) return 'Hết hàng';
    if (stock < 5) return `Chỉ còn ${stock} sản phẩm`;
    return `Còn ${stock} sản phẩm`;
  }

  getStockForItem(productId: string): number {
    return this.stockData[productId] || 0;
  }

  canIncrease(item: CartItem): boolean {
    const stock = this.getStockForItem(item.productId);
    return item.quantity < stock;
  }
}
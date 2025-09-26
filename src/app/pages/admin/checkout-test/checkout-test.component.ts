import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { CartService } from '../../../services/cart.service';
import { OrderService } from '../../../services/order.service';
import { ProductService } from '../../../services/product.service';
import { AuthService } from '../../../services/auth.service';
import { Product } from '../../../models';

@Component({
  selector: 'app-checkout-test',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <div class="checkout-test">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Checkout Flow Test</mat-card-title>
          <mat-card-subtitle>Test the checkout process with hardcoded products</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <h3>Test Results:</h3>
          <div class="test-results">
            <pre>{{ testResults }}</pre>
          </div>
          
          <div class="test-actions">
            <button mat-raised-button color="primary" (click)="testAddToCart()">
              Test Add to Cart
            </button>
            
            <button mat-raised-button color="accent" (click)="testCheckout()" [disabled]="!isLoggedIn">
              Test Checkout Process
            </button>
            
            <button mat-raised-button (click)="clearCart()">
              Clear Cart
            </button>
            
            <button mat-raised-button color="warn" (click)="clearResults()">
              Clear Results
            </button>
          </div>
          
          <div class="auth-info">
            <p><strong>Authentication Status:</strong> {{ isLoggedIn ? 'Logged In' : 'Not Logged In' }}</p>
            <button *ngIf="!isLoggedIn" mat-button color="primary" (click)="mockLogin()">
              Mock Login for Test
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .checkout-test {
      padding: 20px;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .test-results {
      background: #f5f5f5;
      padding: 15px;
      margin: 10px 0;
      border-radius: 4px;
      max-height: 400px;
      overflow-y: auto;
    }
    
    .test-results pre {
      white-space: pre-wrap;
      word-wrap: break-word;
      margin: 0;
      font-size: 12px;
    }
    
    .test-actions {
      display: flex;
      gap: 10px;
      margin: 20px 0;
      flex-wrap: wrap;
    }
    
    .auth-info {
      margin-top: 20px;
      padding: 15px;
      background: #e3f2fd;
      border-radius: 4px;
    }
  `]
})
export class CheckoutTestComponent {
  testResults = '';
  isLoggedIn = false;
  
  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private productService: ProductService,
    private authService: AuthService
  ) {
    // Check auth status
    this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user;
    });
  }
  
  async testAddToCart(): Promise<void> {
    try {
      this.log('🛒 Testing Add to Cart...');
      
      // Get the first hardcoded product
      const products = await this.productService.getProducts({ limit: 1 }).toPromise();
      if (!products || products.items.length === 0) {
        throw new Error('No products available');
      }
      
      const testProduct = products.items[0];
      this.log(`📦 Selected product: ${testProduct.name} (ID: ${testProduct.id})`);
      this.log(`🔢 Stock available: ${testProduct.stock}`);
      
      // Add to cart
      const success = await this.cartService.addToCart(testProduct, 1);
      
      if (success) {
        this.log('✅ Product added to cart successfully');
        
        // Check cart contents
        this.cartService.cart$.subscribe(cart => {
          this.log(`🛍️ Cart now contains ${cart.totalItems} items`);
          this.log(`💰 Total amount: ${cart.totalAmount.toLocaleString('vi-VN')} VND`);
          cart.items.forEach(item => {
            this.log(`   - ${item.productName} (ID: ${item.productId}) x${item.quantity}`);
          });
        });
      } else {
        this.log('❌ Failed to add product to cart');
      }
      
    } catch (error) {
      this.log(`❌ Error in addToCart: ${error}`);
    }
  }
  
  async testCheckout(): Promise<void> {
    if (!this.isLoggedIn) {
      this.log('❌ Must be logged in to test checkout');
      return;
    }
    
    try {
      this.log('💳 Testing Checkout Process...');
      
      // Check current cart
      const cart = await this.cartService.cart$.toPromise();
      if (!cart || cart.items.length === 0) {
        this.log('❌ Cart is empty. Add products first.');
        return;
      }
      
      this.log(`🛍️ Cart contains ${cart.totalItems} items, total: ${cart.totalAmount.toLocaleString('vi-VN')} VND`);
      
      // Test order creation
      const orderData = {
        selectedItems: cart.items,
        shippingAddress: {
          fullName: 'Test Customer',
          phone: '0123456789',
          address: '123 Test Street',
          city: 'Test City',
          district: 'Test District', 
          ward: 'Test Ward'
        },
        paymentMethod: 'cod' as any,
        notes: 'Test order from checkout test'
      };
      
      this.log('📝 Creating order with data:');
      this.log(JSON.stringify(orderData, null, 2));
      
      const orderId = await this.orderService.createOrder(orderData);
      
      this.log(`✅ Order created successfully! Order ID: ${orderId}`);
      this.log('🎉 Checkout process completed without product ID mismatch errors');
      
      // Check if cart was cleared
      setTimeout(() => {
        this.cartService.cart$.subscribe(updatedCart => {
          this.log(`🛒 Cart after checkout: ${updatedCart.totalItems} items`);
        });
      }, 500);
      
    } catch (error) {
      this.log(`❌ Error in checkout: ${error}`);
      console.error('Checkout error details:', error);
    }
  }
  
  clearCart(): void {
    this.cartService.clearCart();
    this.log('🗑️ Cart cleared');
  }
  
  clearResults(): void {
    this.testResults = '';
  }
  
  mockLogin(): void {
    // This is just for testing - in real app, use proper auth
    this.log('🔑 Performing mock login for testing...');
    // You could trigger a test login here if needed
    this.log('ℹ️ Please login through the normal auth system to test checkout');
  }
  
  private log(message: string): void {
    const timestamp = new Date().toLocaleTimeString();
    this.testResults += `[${timestamp}] ${message}\n`;
    console.log(message);
  }
}
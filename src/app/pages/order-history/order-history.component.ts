import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { OrderService } from '../../services/order.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';
import { Order, OrderItem, OrderStatus } from '../../models/order.model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatDividerModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTabsModule
  ],
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.scss']
})
export class OrderHistoryComponent implements OnInit {
  private orderService = inject(OrderService);
  private authService = inject(AuthService);
  private router = inject(Router);

  // Expose OrderStatus enum to template
  OrderStatus = OrderStatus;

  // Signals
  orders = signal<Order[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  selectedTabIndex = signal<number>(0);

  // Computed values for filtered orders
  allOrders = computed(() => this.orders());
  
  pendingOrders = computed(() => 
    this.orders().filter(order => 
      order.status === OrderStatus.PENDING || 
      order.status === OrderStatus.CONFIRMED ||
      order.status === OrderStatus.PROCESSING ||
      order.status === OrderStatus.SHIPPING
    )
  );
  
  completedOrders = computed(() => 
    this.orders().filter(order => order.status === OrderStatus.DELIVERED)
  );
  
  cancelledOrders = computed(() => 
    this.orders().filter(order => 
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.RETURNED
    )
  );

  // Tab stats (exclude cancelled orders)
  activeOrders = computed(() => 
    this.orders().filter(order => 
      order.status !== OrderStatus.CANCELLED &&
      order.status !== OrderStatus.RETURNED
    )
  );

  totalOrders = computed(() => this.activeOrders().length);
  totalSpent = computed(() => 
    this.activeOrders().reduce((total, order) => total + order.totalAmount, 0)
  );

  // Current displayed orders based on selected tab
  displayedOrders = computed(() => {
    switch (this.selectedTabIndex()) {
      case 0: return this.allOrders();
      case 1: return this.pendingOrders();
      case 2: return this.completedOrders();
      case 3: return this.cancelledOrders();
      default: return this.allOrders();
    }
  });

  ngOnInit() {
    this.loadOrderHistory();
  }

  private async loadOrderHistory() {
    try {
      this.loading.set(true);
      this.error.set(null);

      // Check if user is authenticated
      if (!this.authService.isAuthenticated()) {
        this.error.set('User not authenticated');
        this.loading.set(false);
        return;
      }

      // Load user orders using OrderService
      await this.orderService.loadUserOrders();
      
      // Subscribe to orders observable
      this.orderService.orders$.subscribe(orders => {
        this.orders.set(orders);
        this.loading.set(false);
      });

    } catch (error) {
      console.error('Error loading order history:', error);
      this.error.set('Failed to load order history');
      this.loading.set(false);
    }
  }

  getOrderStatusColor(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return '#ff9800';
      case OrderStatus.CONFIRMED:
        return '#2196f3';
      case OrderStatus.PROCESSING:
        return '#2196f3';
      case OrderStatus.SHIPPING:
        return '#9c27b0';
      case OrderStatus.DELIVERED:
        return '#4caf50';
      case OrderStatus.CANCELLED:
        return '#f44336';
      case OrderStatus.RETURNED:
        return '#795548';
      default:
        return '#757575';
    }
  }

  formatDate(date: Date | string): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  getStatusText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Chờ xử lý';
      case OrderStatus.CONFIRMED:
        return 'Đã xác nhận';
      case OrderStatus.PROCESSING:
        return 'Đang xử lý';
      case OrderStatus.SHIPPING:
        return 'Đang giao';
      case OrderStatus.DELIVERED:
        return 'Đã giao';
      case OrderStatus.CANCELLED:
        return 'Đã hủy';
      case OrderStatus.RETURNED:
        return 'Đã trả';
      default:
        return status;
    }
  }

  getPaymentMethodText(method: string): string {
    switch (method) {
      case 'cod':
        return 'Thanh toán khi nhận hàng';
      case 'bank_transfer':
        return 'Chuyển khoản ngân hàng';
      case 'credit_card':
        return 'Thẻ tín dụng';
      case 'e_wallet':
        return 'Ví điện tử';
      default:
        return method;
    }
  }

  trackByOrderId(index: number, order: Order): string {
    return order.id || index.toString();
  }

  onTabChange(index: number) {
    this.selectedTabIndex.set(index);
  }

  canCancelOrder(status: OrderStatus): boolean {
    return status === OrderStatus.PENDING || status === OrderStatus.PROCESSING;
  }

  canReorder(status: OrderStatus): boolean {
    return status === OrderStatus.DELIVERED;
  }

  async cancelOrder(orderId: string) {
    try {
      await this.orderService.cancelOrder(orderId);
      // Refresh orders after cancellation
      this.loadOrderHistory();
    } catch (error) {
      console.error('Error cancelling order:', error);
      // Could show a toast/snackbar here
    }
  }

  viewOrderDetails(orderId: string) {
    // Navigate to order details page or open modal
    // For now, we'll just console log
    console.log('View order details for:', orderId);
  }

  reorderItems(order: Order) {
    // Add order items back to cart
    console.log('Reorder items from:', order.id);
    // Implementation would involve adding items back to cart service
  }

  goToProducts() {
    this.router.navigate(['/products']);
  }

  retry() {
    this.loadOrderHistory();
  }
}
import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../../services/order.service';
import { Order, OrderStatus } from '../../../models/order.model';

// Material Design imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatChipsModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTabsModule
  ],
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss']
})
export class OrderManagementComponent implements OnInit {
  private orderService = inject(OrderService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  // Expose OrderStatus enum to template
  OrderStatus = OrderStatus;

  // Signals
  allOrders = signal<Order[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  
  // Filter signals
  selectedStatus = signal<string>('all');
  selectedDateFrom = signal<Date | null>(null);
  selectedDateTo = signal<Date | null>(null);
  searchQuery = signal<string>('');

  // Display columns for table
  displayedColumns: string[] = [
    'orderNumber', 
    'customerInfo', 
    'orderDate', 
    'totalAmount', 
    'status', 
    'actions'
  ];

  // Status options for filter
  statusOptions = [
    { value: 'all', label: 'Tất cả đơn hàng' },
    { value: OrderStatus.PENDING, label: 'Chờ xác nhận' },
    { value: OrderStatus.CONFIRMED, label: 'Đã xác nhận' },
    { value: OrderStatus.PROCESSING, label: 'Đang chuẩn bị' },
    { value: OrderStatus.SHIPPING, label: 'Đang giao hàng' },
    { value: OrderStatus.DELIVERED, label: 'Đã giao' },
    { value: OrderStatus.CANCELLED, label: 'Đã hủy' },
    { value: OrderStatus.RETURNED, label: 'Đã trả hàng' }
  ];

  // Filtered orders computed
  filteredOrders = computed(() => {
    let orders = this.allOrders();

    // Filter by status
    if (this.selectedStatus() !== 'all') {
      orders = orders.filter(order => order.status === this.selectedStatus());
    }

    // Filter by date range
    if (this.selectedDateFrom()) {
      const fromDate = new Date(this.selectedDateFrom()!);
      fromDate.setHours(0, 0, 0, 0);
      orders = orders.filter(order => order.orderDate >= fromDate);
    }

    if (this.selectedDateTo()) {
      const toDate = new Date(this.selectedDateTo()!);
      toDate.setHours(23, 59, 59, 999);
      orders = orders.filter(order => order.orderDate <= toDate);
    }

    // Filter by search query (order number, customer name, phone)
    if (this.searchQuery().trim()) {
      const query = this.searchQuery().toLowerCase();
      orders = orders.filter(order => 
        order.orderNumber.toLowerCase().includes(query) ||
        order.shippingAddress.fullName.toLowerCase().includes(query) ||
        order.shippingAddress.phone.includes(query)
      );
    }

    return orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
  });

  // Statistics computed
  todayOrders = computed(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return this.allOrders().filter(order => 
      order.orderDate >= today && order.orderDate < tomorrow
    );
  });

  pendingOrders = computed(() => 
    this.allOrders().filter(order => order.status === OrderStatus.PENDING)
  );

  todayRevenue = computed(() => 
    this.todayOrders().reduce((total, order) => {
      if (order.status !== OrderStatus.CANCELLED && order.status !== OrderStatus.RETURNED) {
        return total + order.totalAmount;
      }
      return total;
    }, 0)
  );

  ngOnInit() {
    this.loadAllOrders();
  }

  async loadAllOrders() {
    try {
      this.loading.set(true);
      this.error.set(null);
      
      // Load all orders from Firebase (admin can see all orders)
      await this.orderService.loadAllOrdersForAdmin();
      
      this.orderService.orders$.subscribe(orders => {
        this.allOrders.set(orders);
        this.loading.set(false);
      });

    } catch (error) {
      console.error('Error loading orders:', error);
      this.error.set('Không thể tải danh sách đơn hàng');
      this.loading.set(false);
    }
  }

  async updateOrderStatus(orderId: string, newStatus: OrderStatus) {
    try {
      await this.orderService.updateOrderStatus(orderId, newStatus);
      this.snackBar.open(
        `Đã cập nhật trạng thái đơn hàng thành "${this.getStatusText(newStatus)}"`,
        'Đóng',
        { duration: 3000 }
      );
    } catch (error) {
      console.error('Error updating order status:', error);
      this.snackBar.open('Có lỗi khi cập nhật trạng thái đơn hàng', 'Đóng', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  }

  exportToCSV() {
    const orders = this.filteredOrders();
    if (orders.length === 0) {
      this.snackBar.open('Không có dữ liệu để xuất', 'Đóng', { duration: 2000 });
      return;
    }

    // Prepare CSV data
    const csvData = this.generateCSVData(orders);
    
    // Add BOM for proper UTF-8 encoding in Excel
    const BOM = '\uFEFF';
    const csvWithBOM = BOM + csvData;
    
    // Create and download CSV file
    const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_report_${this.formatDateForFilename(new Date())}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.snackBar.open('Báo cáo đã được xuất thành công', 'Đóng', { duration: 3000 });
  }

  private generateCSVData(orders: Order[]): string {
    // CSV Headers
    const headers = [
      'Mã đơn hàng',
      'Ngày đặt',
      'Khách hàng',
      'Số điện thoại',
      'Địa chỉ',
      'Trạng thái',
      'Tổng tiền',
      'Phí vận chuyển',
      'Thành tiền',
      'Phương thức thanh toán',
      'Sản phẩm'
    ];

    let csvContent = headers.join(',') + '\n';

    // Add order data
    orders.forEach(order => {
      const productList = order.items.map(item => 
        `${item.productName} (${item.quantity})`
      ).join('; ');

      const row = [
        this.escapeCSVField(order.orderNumber),
        this.escapeCSVField(this.formatDateForCSV(order.orderDate)),
        this.escapeCSVField(order.shippingAddress.fullName),
        this.escapeCSVField(order.shippingAddress.phone),
        this.escapeCSVField(`${order.shippingAddress.address}, ${order.shippingAddress.city}`),
        this.escapeCSVField(this.getStatusText(order.status)),
        order.totalAmount,
        order.shippingFee,
        order.finalAmount || order.totalAmount,
        this.escapeCSVField(this.getPaymentMethodText(order.paymentMethod)),
        this.escapeCSVField(productList)
      ];

      csvContent += row.join(',') + '\n';
    });

    return csvContent;
  }

  private escapeCSVField(field: string): string {
    if (field == null) return '';
    const fieldStr = String(field);
    // If field contains comma, newline, or quote, wrap in quotes and escape internal quotes
    if (fieldStr.includes(',') || fieldStr.includes('\n') || fieldStr.includes('"')) {
      return '"' + fieldStr.replace(/"/g, '""') + '"';
    }
    return fieldStr;
  }

  private formatDateForCSV(date: Date): string {
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN');
  }

  private formatDateForFilename(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  // Helper methods
  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getStatusText(status: OrderStatus): string {
    const statusMap = {
      [OrderStatus.PENDING]: 'Chờ xác nhận',
      [OrderStatus.CONFIRMED]: 'Đã xác nhận', 
      [OrderStatus.PROCESSING]: 'Đang chuẩn bị',
      [OrderStatus.SHIPPING]: 'Đang giao hàng',
      [OrderStatus.DELIVERED]: 'Đã giao',
      [OrderStatus.CANCELLED]: 'Đã hủy',
      [OrderStatus.RETURNED]: 'Đã trả hàng'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: OrderStatus): string {
    const colorMap = {
      [OrderStatus.PENDING]: '#ff9800',
      [OrderStatus.CONFIRMED]: '#2196f3',
      [OrderStatus.PROCESSING]: '#9c27b0',
      [OrderStatus.SHIPPING]: '#ff5722',
      [OrderStatus.DELIVERED]: '#4caf50',
      [OrderStatus.CANCELLED]: '#f44336',
      [OrderStatus.RETURNED]: '#607d8b'
    };
    return colorMap[status] || '#666';
  }

  getPaymentMethodText(method: string): string {
    const methodMap = {
      'cod': 'Thu hộ (COD)',
      'bank_transfer': 'Chuyển khoản',
      'credit_card': 'Thẻ tín dụng',
      'e_wallet': 'Ví điện tử'
    };
    return methodMap[method as keyof typeof methodMap] || method;
  }

  canUpdateStatus(currentStatus: OrderStatus, newStatus: OrderStatus): boolean {
    // Define allowed status transitions
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPING, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPING]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.RETURNED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.RETURNED]: []
    };

    return allowedTransitions[currentStatus]?.includes(newStatus) || false;
  }

  onFilterChange() {
    // Trigger recomputation of filtered orders
    // The computed signal will automatically update
  }

  clearFilters() {
    this.selectedStatus.set('all');
    this.selectedDateFrom.set(null);
    this.selectedDateTo.set(null);
    this.searchQuery.set('');
  }
}
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, map, throwError, of } from 'rxjs';
import { collection, doc, addDoc, updateDoc, getDocs, query, where, orderBy, Timestamp } from '@angular/fire/firestore';
import { Firestore } from '@angular/fire/firestore';
import { AuthService } from './auth.service';
import { ProductService } from './product.service';
import { 
  Order, 
  OrderItem, 
  OrderStatus, 
  PaymentStatus, 
  PaymentMethod,
  ShippingAddress,
  CheckoutData 
} from '../models/order.model';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private firestore = inject(Firestore);
  private authService = inject(AuthService);
  private productService = inject(ProductService);
  
  // State management
  private ordersSubject = new BehaviorSubject<Order[]>([]);
  public orders$ = this.ordersSubject.asObservable();
  
  private currentOrderSubject = new BehaviorSubject<Order | null>(null);
  public currentOrder$ = this.currentOrderSubject.asObservable();

  constructor() {}

  /**
   * Tạo đơn hàng mới
   */
  async createOrder(checkoutData: CheckoutData): Promise<string> {
    const user = this.authService.user();
    if (!user) {
      throw new Error('Vui lòng đăng nhập để đặt hàng');
    }

    try {
      // Tạo order number duy nhất
      const orderNumber = this.generateOrderNumber();
      
      console.log('Creating order with items:', checkoutData.selectedItems.map(item => ({ 
        productId: item.productId, 
        productName: item.productName,
        quantity: item.quantity 
      })));
      
      // Chuyển đổi CartItem sang OrderItem
      const orderItems: OrderItem[] = checkoutData.selectedItems.map(item => ({
        id: this.generateId(),
        productId: item.productId,
        productName: item.productName,
        productImage: item.productImage,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.price * item.quantity
      }));

      // Tính tổng tiền
      const totalAmount = orderItems.reduce((sum, item) => sum + item.subtotal, 0);
      const shippingFee = this.calculateShippingFee(totalAmount, checkoutData.shippingAddress);
      const finalAmount = totalAmount + shippingFee;

      const newOrder: Omit<Order, 'id'> = {
        userId: user.id,
        orderNumber,
        items: orderItems,
        totalAmount,
        shippingFee,
        finalAmount,
        status: OrderStatus.PENDING,
        shippingAddress: checkoutData.shippingAddress,
        paymentMethod: checkoutData.paymentMethod,
        paymentStatus: PaymentStatus.PENDING,
        orderDate: new Date(),
        notes: checkoutData.notes
      };

      // Lưu vào Firebase
      const docRef = await addDoc(collection(this.firestore, 'orders'), {
        ...newOrder,
        orderDate: Timestamp.fromDate(newOrder.orderDate)
      });

      // Cập nhật inventory cho từng sản phẩm
      await this.updateInventoryAfterOrder(orderItems);

      // Refresh orders list
      this.loadUserOrders();

      return docRef.id;

    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error('Không thể tạo đơn hàng. Vui lòng thử lại.');
    }
  }

  /**
   * Lấy danh sách đơn hàng của user hiện tại
   */
  async loadUserOrders(): Promise<void> {
    const user = this.authService.user();
    if (!user) return;

    try {
      const ordersRef = collection(this.firestore, 'orders');
      // Use simple query without orderBy to avoid index requirement
      const q = query(
        ordersRef, 
        where('userId', '==', user.id)
      );
      
      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const order: Order = {
          id: doc.id,
          ...data,
          orderDate: data['orderDate'].toDate(),
          estimatedDeliveryDate: data['estimatedDeliveryDate']?.toDate(),
          actualDeliveryDate: data['actualDeliveryDate']?.toDate()
        } as Order;
        orders.push(order);
      });

      // Sort client-side by orderDate descending
      orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
      
      // Limit to 50 most recent orders client-side
      const limitedOrders = orders.slice(0, 50);

      this.ordersSubject.next(limitedOrders);
    } catch (error) {
      console.error('Error loading orders:', error);
      throw new Error('Không thể tải danh sách đơn hàng');
    }
  }

  /**
   * Load all orders for admin (không filter theo userId)
   */
  async loadAllOrdersForAdmin(): Promise<void> {
    try {
      const ordersRef = collection(this.firestore, 'orders');
      const q = query(ordersRef);
      
      const querySnapshot = await getDocs(q);
      const orders: Order[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const order: Order = {
          id: doc.id,
          ...data,
          orderDate: data['orderDate'].toDate(),
          estimatedDeliveryDate: data['estimatedDeliveryDate']?.toDate(),
          actualDeliveryDate: data['actualDeliveryDate']?.toDate()
        } as Order;
        orders.push(order);
      });

      // Sort by orderDate descending and limit to 100 most recent
      orders.sort((a, b) => b.orderDate.getTime() - a.orderDate.getTime());
      const limitedOrders = orders.slice(0, 100);

      this.ordersSubject.next(limitedOrders);
    } catch (error) {
      console.error('Error loading all orders for admin:', error);
      throw new Error('Không thể tải danh sách đơn hàng');
    }
  }

  /**
   * Update order status (admin function)
   */
  async updateOrderStatus(orderId: string, newStatus: OrderStatus): Promise<void> {
    try {
      const orderRef = doc(this.firestore, 'orders', orderId);
      
      const updateData: any = {
        status: newStatus,
        updatedAt: Timestamp.now()
      };

      // Add specific timestamps for status changes
      if (newStatus === OrderStatus.CONFIRMED) {
        updateData.confirmedAt = Timestamp.now();
      } else if (newStatus === OrderStatus.PROCESSING) {
        updateData.processingAt = Timestamp.now();
      } else if (newStatus === OrderStatus.SHIPPING) {
        updateData.shippedAt = Timestamp.now();
      } else if (newStatus === OrderStatus.DELIVERED) {
        updateData.deliveredAt = Timestamp.now();
        updateData.actualDeliveryDate = Timestamp.now();
      } else if (newStatus === OrderStatus.CANCELLED) {
        updateData.cancelledAt = Timestamp.now();
      }

      await updateDoc(orderRef, updateData);
      
      console.log(`Order ${orderId} status updated to: ${newStatus}`);
      
      // Reload orders to reflect changes
      await this.loadAllOrdersForAdmin();
      
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  }
  async getOrderById(orderId: string): Promise<Order | null> {
    try {
      const orderDoc = doc(this.firestore, 'orders', orderId);
      // Implement get order logic here
      // For now, find from current orders
      const orders = this.ordersSubject.value;
      return orders.find(order => order.id === orderId) || null;
    } catch (error) {
      console.error('Error getting order:', error);
      return null;
    }
  }

  /**
   * Hủy đơn hàng
   */
  async cancelOrder(orderId: string): Promise<void> {
    const order = await this.getOrderById(orderId);
    if (!order) {
      throw new Error('Không tìm thấy đơn hàng');
    }

    // Chỉ cho phép hủy khi đơn hàng ở trạng thái pending hoặc confirmed
    if (![OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(order.status)) {
      throw new Error('Không thể hủy đơn hàng ở trạng thái này');
    }

    try {
      // Cập nhật trạng thái
      await this.updateOrderStatus(orderId, OrderStatus.CANCELLED);
      
      // Hoàn trả inventory
      await this.restoreInventoryAfterCancel(order.items);

    } catch (error) {
      console.error('Error cancelling order:', error);
      throw new Error('Không thể hủy đơn hàng');
    }
  }

  /**
   * Tính phí ship dựa trên tổng tiền và địa chỉ
   */
  private calculateShippingFee(totalAmount: number, address: ShippingAddress): number {
    // Miễn phí ship cho đơn hàng trên 500k
    if (totalAmount >= 500000) {
      return 0;
    }

    // Phí ship theo khu vực
    const cityShippingRates: { [key: string]: number } = {
      'Hồ Chí Minh': 25000,
      'Hà Nội': 30000,
      'Đà Nẵng': 35000,
      'Cần Thơ': 40000
    };

    return cityShippingRates[address.city] || 50000; // Default 50k cho tỉnh khác
  }

  /**
   * Cập nhật inventory sau khi đặt hàng
   */
  private async updateInventoryAfterOrder(orderItems: OrderItem[]): Promise<void> {
    try {
      console.log('Updating inventory for order items:', orderItems.map(item => ({ 
        productId: item.productId, 
        productName: item.productName,
        quantity: item.quantity 
      })));
      
      for (const item of orderItems) {
        await this.productService.decreaseInventory(item.productId, item.quantity);
      }
      console.log('Inventory updated successfully after order');
    } catch (error) {
      console.error('Error updating inventory after order:', error);
      throw error;
    }
  }

  /**
   * Hoàn trả inventory sau khi hủy đơn
   */
  private async restoreInventoryAfterCancel(orderItems: OrderItem[]): Promise<void> {
    try {
      for (const item of orderItems) {
        await this.productService.increaseInventory(item.productId, item.quantity);
      }
      console.log('Inventory restored successfully after cancellation');
    } catch (error) {
      console.error('Error restoring inventory after cancellation:', error);
      throw error;
    }
  }

  /**
   * Tạo order number duy nhất
   */
  private generateOrderNumber(): string {
    const now = new Date();
    const year = now.getFullYear().toString().substr(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
    
    return `PTS${year}${month}${day}${random}`;
  }

  /**
   * Tạo ID duy nhất
   */
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  /**
   * Lấy tổng số đơn hàng của user
   */
  getTotalOrders(): Observable<number> {
    return this.orders$.pipe(
      map(orders => orders.length)
    );
  }

  /**
   * Lấy tổng giá trị đã mua
   */
  getTotalSpent(): Observable<number> {
    return this.orders$.pipe(
      map(orders => 
        orders
          .filter(order => [OrderStatus.DELIVERED, OrderStatus.CONFIRMED, OrderStatus.PROCESSING, OrderStatus.SHIPPING].includes(order.status))
          .reduce((total, order) => total + order.finalAmount, 0)
      )
    );
  }

  /**
   * Lấy đơn hàng theo trạng thái
   */
  getOrdersByStatus(status: OrderStatus): Observable<Order[]> {
    return this.orders$.pipe(
      map(orders => orders.filter(order => order.status === status))
    );
  }
}
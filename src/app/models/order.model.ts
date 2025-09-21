export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface ShippingAddress {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  district: string;
  ward: string;
  postalCode?: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  shippingFee: number;
  finalAmount: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderDate: Date;
  estimatedDeliveryDate?: Date;
  actualDeliveryDate?: Date;
  notes?: string;
  trackingNumber?: string;
}

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPING = 'shipping',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned'
}

export enum PaymentMethod {
  COD = 'cod', // Cash on Delivery
  BANK_TRANSFER = 'bank_transfer',
  CREDIT_CARD = 'credit_card',
  E_WALLET = 'e_wallet'
}

export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded'
}

export interface CartItem {
  productId: string;
  productName: string;
  productImage: string;
  image: string; // Alias for productImage
  brand?: string;
  sku?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  maxQuantity: number; // Available inventory
  unit?: string;
  totalPrice: number; // price * quantity
  isSelected: boolean;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
}

export interface CheckoutData {
  selectedItems: CartItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod;
  notes?: string;
}
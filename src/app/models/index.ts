// Product Models
export interface Product {
  id: string;
  name: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  categoryId?: string; // Add categoryId for admin panel compatibility
  subcategory?: string;
  brand: string;
  model?: string;
  sku: string;
  specifications: ProductSpecification[];
  images: string[];
  stock: number;
  unit: string; // m, kg, cái, bộ, m2, m3
  status: 'active' | 'inactive' | 'out-of-stock';
  tags: string[];
  featured: boolean;
  rating: number;
  reviewCount: number;
  weight?: number;
  dimensions?: ProductDimensions;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductSpecification {
  name: string;
  value: string;
  unit?: string;
}

export interface ProductDimensions {
  length: number;
  width: number;
  height: number;
  unit: 'cm' | 'm' | 'mm';
}

// Category Models
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  icon?: string;
  parentId?: string;
  children?: Category[];
  isActive: boolean;
  sortOrder: number;
  productCount: number;
}

// Cart Models
export interface CartItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  totalPrice: number;
}

export interface Cart {
  id: string;
  userId?: string;
  items: CartItem[];
  totalItems: number;
  totalAmount: number;
  updatedAt: Date;
}

// Order Models
export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  user: User;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  discount: number;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  shippingAddress: Address;
  billingAddress: Address;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export type PaymentStatus =
  | 'pending'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

// User Models
export interface User {
  id: string;
  uid: string; // Firebase Auth UID
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  company?: string;
  taxCode?: string;
  role: UserRole;
  addresses?: Address[];
  isEmailVerified: boolean;
  isPhoneVerified?: boolean;
  createdAt: Date;
  lastLogin?: Date;
}

export type UserRole = 'user' | 'admin' | 'branch_admin';

// Auth Models
export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface Address {
  id: string;
  type: 'shipping' | 'billing';
  isDefault: boolean;
  recipientName: string;
  phone: string;
  company?: string;
  address: string;
  ward: string;
  district: string;
  province: string;
  postalCode?: string;
  country: string;
}

// Review Models
export interface ProductReview {
  id: string;
  productId: string;
  userId: string;
  user: Pick<User, 'id' | 'name' | 'avatar'>;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpful: number;
  unhelpful: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

// Inventory Models
export interface InventoryItem {
  id: string;
  productId: string;
  product: Product;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  location: string;
  lastUpdated: Date;
}

// Supplier Models
export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: Address;
  taxCode?: string;
  website?: string;
  rating: number;
  isActive: boolean;
  products: string[]; // Product IDs
  createdAt: Date;
}

// Filter & Search Models
export interface ProductFilter {
  category?: string;
  subcategory?: string;
  brand?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  inStock?: boolean;
  featured?: boolean;
  tags?: string[];
}

export interface SearchParams {
  query?: string;
  filter?: ProductFilter;
  sortBy?: ProductSortBy;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export type ProductSortBy =
  | 'name'
  | 'price'
  | 'rating'
  | 'createdAt'
  | 'popularity'
  | 'discount';

export interface SearchResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Dashboard Models
export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  lowStockProducts: number;
  revenueGrowth: number;
  orderGrowth: number;
}

export interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  customers: number;
}

// Order Models - Updated
export * from './order.model';

// News Models
export interface NewsOriginal {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  images?: string[];
  category: NewsCategoryOriginal;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  viewCount: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string[];
}

export interface NewsCategoryOriginal {
  id: string;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  newsCount: number;
}

export interface NewsFilter {
  category?: string;
  tags?: string[];
  status?: 'draft' | 'published' | 'archived';
  featured?: boolean;
  author?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export type NewsSortBy =
  | 'title'
  | 'publishedAt'
  | 'createdAt'
  | 'viewCount'
  | 'author';

export interface NewsSearchParams {
  query?: string;
  filter?: NewsFilter;
  sortBy?: NewsSortBy;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

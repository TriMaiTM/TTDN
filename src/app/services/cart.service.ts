import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../models';
import { CartItem, Cart } from '../models/order.model';
import { ProductService } from './product.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private productService = inject(ProductService);
  private authService = inject(AuthService);

  // Cart state using new Cart model
  private cartSubject = new BehaviorSubject<Cart>({
    items: [],
    totalItems: 0,
    totalAmount: 0
  });
  public cart$ = this.cartSubject.asObservable();

  // Storage key for localStorage
  private readonly CART_STORAGE_KEY = 'shopping_cart';

  constructor() {
    this.loadCartFromStorage();
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   */
  async addToCart(product: Product, quantity: number = 1): Promise<boolean> {
    try {
      console.log('CartService addToCart - Received product:', product);
      console.log('CartService addToCart - Product ID:', product.id);
      console.log('CartService addToCart - Quantity:', quantity);
      
      // Kiểm tra tồn kho trực tiếp từ product object thay vì gọi canOrder
      if (!product.stock || product.stock < quantity) {
        throw new Error(`Sản phẩm chỉ còn ${product.stock || 0} trong kho`);
      }
      
      if (product.status !== 'active' && product.status !== undefined) {
        throw new Error('Sản phẩm hiện không khả dụng');
      }

      const currentCart = this.cartSubject.value;
      const existingItemIndex = currentCart.items.findIndex(item => item.productId === product.id);
      
      let updatedItems: CartItem[];
      
      if (existingItemIndex >= 0) {
        // Sản phẩm đã có trong giỏ hàng, cập nhật số lượng
        updatedItems = [...currentCart.items];
        const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
        
        // Kiểm tra lại tồn kho với số lượng mới
        if (!product.stock || product.stock < newQuantity) {
          throw new Error(`Chỉ còn ${product.stock || 0} sản phẩm trong kho`);
        }
        
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
          maxQuantity: product.stock,
          totalPrice: product.price * newQuantity
        };
      } else {
        // Thêm sản phẩm mới vào giỏ hàng
        const newCartItem: CartItem = {
          productId: product.id,
          productName: product.name,
          productImage: product.images[0] || '',
          image: product.images[0] || '',
          brand: product.brand,
          sku: product.sku,
          price: product.price,
          originalPrice: product.originalPrice,
          quantity: quantity,
          maxQuantity: product.stock,
          unit: product.unit,
          totalPrice: product.price * quantity,
          isSelected: true
        };
        
        updatedItems = [...currentCart.items, newCartItem];
      }
      
      // Cập nhật giỏ hàng
      const updatedCart = this.calculateCartTotals({
        ...currentCart,
        items: updatedItems
      });
      
      this.cartSubject.next(updatedCart);
      this.saveCartToStorage(updatedCart);
      
      return true;
      
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   */
  removeFromCart(productId: string): boolean {
    try {
      const currentCart = this.cartSubject.value;
      const updatedItems = currentCart.items.filter(item => item.productId !== productId);
      
      const updatedCart = this.calculateCartTotals({
        ...currentCart,
        items: updatedItems
      });
      
      this.cartSubject.next(updatedCart);
      this.saveCartToStorage(updatedCart);
      
      return true;
      
    } catch (error) {
      console.error('Error removing from cart:', error);
      return false;
    }
  }

  /**
   * Cập nhật số lượng sản phẩm trong giỏ hàng
   */
  async updateQuantity(productId: string, quantity: number): Promise<boolean> {
    try {
      if (quantity <= 0) {
        return this.removeFromCart(productId);
      }

      // Kiểm tra tồn kho - tạm thời skip vì cần full product object
      // TODO: Lấy product từ service để check stock
      // const canOrder = await firstValueFrom(this.productService.canOrder(productId, quantity));
      // if (!canOrder) {
      //   throw new Error('Số lượng yêu cầu vượt quá tồn kho');
      // }

      const currentCart = this.cartSubject.value;
      const updatedItems = currentCart.items.map(item => 
        item.productId === productId 
          ? { ...item, quantity: quantity }
          : item
      );
      
      const updatedCart = this.calculateCartTotals({
        ...currentCart,
        items: updatedItems
      });
      
      this.cartSubject.next(updatedCart);
      this.saveCartToStorage(updatedCart);
      
      return true;
      
    } catch (error) {
      console.error('Error updating quantity:', error);
      throw error;
    }
  }

  /**
   * Xóa toàn bộ giỏ hàng
   */
  clearCart(): boolean {
    try {
      const emptyCart: Cart = {
        items: [],
        totalItems: 0,
        totalAmount: 0
      };
      
      this.cartSubject.next(emptyCart);
      this.saveCartToStorage(emptyCart);
      
      return true;
      
    } catch (error) {
      console.error('Error clearing cart:', error);
      return false;
    }
  }

  /**
   * Chọn/bỏ chọn sản phẩm
   */
  toggleItemSelection(productId: string, isSelected: boolean): boolean {
    try {
      const currentCart = this.cartSubject.value;
      const updatedItems = currentCart.items.map(item => 
        item.productId === productId 
          ? { ...item, isSelected: isSelected }
          : item
      );
      
      const updatedCart = this.calculateCartTotals({
        ...currentCart,
        items: updatedItems
      });
      
      this.cartSubject.next(updatedCart);
      this.saveCartToStorage(updatedCart);
      
      return true;
      
    } catch (error) {
      console.error('Error toggling selection:', error);
      return false;
    }
  }

  /**
   * Lấy các sản phẩm đã chọn để checkout
   */
  getSelectedItems(): Observable<CartItem[]> {
    return this.cart$.pipe(
      map(cart => cart.items.filter(item => item.isSelected))
    );
  }

  /**
   * Lấy số lượng item trong giỏ hàng
   */
  getCartItemCount(): Observable<number> {
    return this.cart$.pipe(
      map(cart => cart.totalItems)
    );
  }

  /**
   * Lấy tổng tiền giỏ hàng
   */
  getCartTotal(): Observable<number> {
    return this.cart$.pipe(
      map(cart => cart.totalAmount)
    );
  }

  /**
   * Kiểm tra sản phẩm có trong giỏ hàng không
   */
  isInCart(productId: string): Observable<boolean> {
    return this.cart$.pipe(
      map(cart => cart.items.some(item => item.productId === productId))
    );
  }

  /**
   * Lấy số lượng sản phẩm trong giỏ hàng
   */
  getItemQuantity(productId: string): Observable<number> {
    return this.cart$.pipe(
      map(cart => {
        const item = cart.items.find(item => item.productId === productId);
        return item ? item.quantity : 0;
      })
    );
  }

  /**
   * Tính toán tổng số lượng và tổng tiền
   */
  private calculateCartTotals(cart: Cart): Cart {
    const selectedItems = cart.items.filter(item => item.isSelected);
    
    return {
      ...cart,
      totalItems: selectedItems.reduce((total, item) => total + item.quantity, 0),
      totalAmount: selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0)
    };
  }

  /**
   * Lưu giỏ hàng vào localStorage
   */
  private saveCartToStorage(cart: Cart): void {
    try {
      const user = this.authService.user();
      if (user) {
        const storageKey = `${this.CART_STORAGE_KEY}_${user.id}`;
        localStorage.setItem(storageKey, JSON.stringify(cart));
      } else {
        // Guest cart
        localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cart));
      }
    } catch (error) {
      console.error('Error saving cart to storage:', error);
    }
  }

  /**
   * Tải giỏ hàng từ localStorage
   */
  private loadCartFromStorage(): void {
    try {
      const user = this.authService.user();
      let storageKey = this.CART_STORAGE_KEY;
      
      if (user) {
        storageKey = `${this.CART_STORAGE_KEY}_${user.id}`;
      }
      
      const savedCart = localStorage.getItem(storageKey);
      
      if (savedCart) {
        const cart: Cart = JSON.parse(savedCart);
        this.cartSubject.next(cart);
      }
    } catch (error) {
      console.error('Error loading cart from storage:', error);
      this.clearCart();
    }
  }
}

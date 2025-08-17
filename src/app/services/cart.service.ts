import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cart, CartItem, Product } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private cartSubject = new BehaviorSubject<Cart>(this.getInitialCart());
  public cart$ = this.cartSubject.asObservable();

  constructor() {
    // Load cart from localStorage if available
    this.loadCart();
  }

  private getInitialCart(): Cart {
    return {
      id: this.generateCartId(),
      items: [],
      totalItems: 0,
      totalAmount: 0,
      updatedAt: new Date()
    };
  }

  private generateCartId(): string {
    return 'cart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  // Add item to cart
  addToCart(product: Product, quantity: number = 1): void {
    const currentCart = this.cartSubject.value;
    const existingItem = currentCart.items.find(item => item.productId === product.id);

    if (existingItem) {
      // Update quantity if item already exists
      existingItem.quantity += quantity;
      existingItem.totalPrice = existingItem.quantity * existingItem.price;
    } else {
      // Add new item
      const newItem: CartItem = {
        id: this.generateItemId(),
        productId: product.id,
        product: product,
        quantity: quantity,
        price: product.price,
        totalPrice: product.price * quantity
      };
      currentCart.items.push(newItem);
    }

    this.updateCartTotals(currentCart);
    this.cartSubject.next(currentCart);
    this.saveCart();
  }

  // Remove item from cart
  removeFromCart(productId: string): void {
    const currentCart = this.cartSubject.value;
    currentCart.items = currentCart.items.filter(item => item.productId !== productId);
    
    this.updateCartTotals(currentCart);
    this.cartSubject.next(currentCart);
    this.saveCart();
  }

  // Update item quantity
  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentCart = this.cartSubject.value;
    const item = currentCart.items.find(item => item.productId === productId);
    
    if (item) {
      item.quantity = quantity;
      item.totalPrice = item.quantity * item.price;
      
      this.updateCartTotals(currentCart);
      this.cartSubject.next(currentCart);
      this.saveCart();
    }
  }

  // Clear cart
  clearCart(): void {
    const clearedCart = this.getInitialCart();
    this.cartSubject.next(clearedCart);
    this.saveCart();
  }

  // Get cart item count
  getCartItemCount(): Observable<number> {
    return this.cart$.pipe(
      map(cart => cart.totalItems)
    );
  }

  // Get cart total
  getCartTotal(): Observable<number> {
    return this.cart$.pipe(
      map(cart => cart.totalAmount)
    );
  }

  // Check if product is in cart
  isInCart(productId: string): Observable<boolean> {
    return this.cart$.pipe(
      map(cart => cart.items.some(item => item.productId === productId))
    );
  }

  // Get item quantity in cart
  getItemQuantity(productId: string): Observable<number> {
    return this.cart$.pipe(
      map(cart => {
        const item = cart.items.find(item => item.productId === productId);
        return item ? item.quantity : 0;
      })
    );
  }

  private updateCartTotals(cart: Cart): void {
    cart.totalItems = cart.items.reduce((total, item) => total + item.quantity, 0);
    cart.totalAmount = cart.items.reduce((total, item) => total + item.totalPrice, 0);
    cart.updatedAt = new Date();
  }

  private generateItemId(): string {
    return 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  private saveCart(): void {
    try {
      localStorage.setItem('cart', JSON.stringify(this.cartSubject.value));
    } catch (error) {
      console.error('Error saving cart to localStorage:', error);
    }
  }

  private loadCart(): void {
    try {
      const savedCart = localStorage.getItem('cart');
      if (savedCart) {
        const cart: Cart = JSON.parse(savedCart);
        // Ensure dates are properly parsed
        cart.updatedAt = new Date(cart.updatedAt);
        this.cartSubject.next(cart);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      // Use initial cart if loading fails
      this.cartSubject.next(this.getInitialCart());
    }
  }
}

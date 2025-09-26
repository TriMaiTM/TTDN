import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { Cart } from '../../models/order.model';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
  private router = inject(Router);
  private cartService = inject(CartService);
  
  showSidenav = false;
  showAboutDropdown = false;
  showCartDropdown = false;
  private closeTimer: any;
  private cartCloseTimer: any;

  // Cart observables
  cartItemCount$ = this.cartService.getCartItemCount();
  cart$ = this.cartService.cart$;
  cartTotal$ = this.cartService.getCartTotal();

  constructor(
    public authService: AuthService
  ) {}

  // Computed properties for template
  get user() { return this.authService.user(); }
  get isAuthenticated() { return this.authService.isAuthenticated(); }
  get isAdmin() { return this.authService.isAdmin(); }

  openAbout() {
    clearTimeout(this.closeTimer);
    this.showAboutDropdown = true;
  }

  closeAboutSoon(delay = 120) {
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => this.showAboutDropdown = false, delay);
  }

  cancelClose() {
    clearTimeout(this.closeTimer);
  }

  // Cart dropdown methods
  openCartDropdown() {
    clearTimeout(this.cartCloseTimer);
    this.showCartDropdown = true;
  }

  closeCartDropdown() {
    this.cartCloseTimer = setTimeout(() => {
      this.showCartDropdown = false;
    }, 200);
  }

  // Utility methods
  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  // Helper methods for template
  getCartItems(cart: any): any[] {
    if (!cart || !cart.items) return [];
    return cart.items.slice(0, 3);
  }

  shouldShowMoreItems(cart: any): boolean {
    if (!cart || !cart.items) return false;
    return cart.items.length > 3;
  }

  getMoreItemsCount(cart: any): number {
    if (!cart || !cart.items) return 0;
    return cart.items.length - 3;
  }

  // Auth methods
  async logout() {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/auth/register']);
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  navigateToOrderHistory() {
    this.router.navigate(['/order-history']);
  }

  navigateToAdmin() {
    if (this.isAdmin) {
      this.router.navigate(['/admin']);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event) {
    const target = e.target as HTMLElement;
    if (!target.closest('.nav-links')) {
      this.showAboutDropdown = false;
    }
  }
}

import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
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
    MatSlideToggleModule,
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

  // state dropdown about
  showAboutDropdown = false;
  showCartDropdown = false;

  // optional small delay to avoid flicker (ms)
  private closeTimer: any;
  private cartCloseTimer: any;

  // Cart observables
  cartItemCount$ = this.cartService.getCartItemCount();
  cart$ = this.cartService.cart$;
  cartTotal$ = this.cartService.getCartTotal();

  constructor(
    public authService: AuthService
  ) {}

  // Auth-related computed properties for template
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

  async logout() {
    try {
      await this.authService.logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  navigateToProfile() {
    this.router.navigate(['/profile']);
  }

  navigateToAdmin() {
    if (this.isAdmin) {
      this.router.navigate(['/admin']);
    }
  }

  navigateToLogin() {
    this.router.navigate(['/auth/login']);
  }

  navigateToRegister() {
    this.router.navigate(['/auth/register']);
  }

  // close dropdown when clicking anywhere outside (optional)
  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event) {
    // if click outside nav area, close
    const target = e.target as HTMLElement;
    if (!target.closest('.nav-links')) {
      this.showAboutDropdown = false;
    }
  }
}

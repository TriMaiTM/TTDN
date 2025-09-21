import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard bảo vệ các routes chỉ dành cho user đã đăng nhập
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  } else {
    // Redirect to login page
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
};

/**
 * Guard bảo vệ các routes chỉ dành cho admin
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Kiểm tra xem user có đăng nhập không
  if (!authService.isAuthenticated()) {
    router.navigate(['/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }

  // Kiểm tra xem user có phải admin không
  if (authService.isAdmin()) {
    return true;
  } else {
    // User đã đăng nhập nhưng không phải admin
    router.navigate(['/'], {
      queryParams: { error: 'access-denied' }
    });
    return false;
  }
};

/**
 * Guard cho các trang chỉ dành cho user chưa đăng nhập (login, register)
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  } else {
    // User đã đăng nhập, redirect về trang phù hợp
    if (authService.isAdmin()) {
      router.navigate(['/admin']);
    } else {
      router.navigate(['/']);
    }
    return false;
  }
};

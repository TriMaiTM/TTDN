import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Guard bảo vệ các routes chỉ dành cho user đã đăng nhập
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If still loading auth state, allow navigation (auth will handle it)
  if (authService.isLoading()) {
    return true;
  }

  if (authService.isAuthenticated()) {
    return true;
  } else {
    // Redirect to login page
    router.navigate(['/auth/login'], {
      queryParams: { returnUrl: state.url }
    });
    return false;
  }
};

/**
 * Guard bảo vệ các routes chỉ dành cho admin
 */
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Return an Observable that waits for loading to complete
  return toObservable(authService.isLoading).pipe(
    filter(isLoading => !isLoading), // Wait until isLoading becomes false
    take(1), // Complete after first false emission
    map(() => {
      // Now Auth is ready
      if (!authService.isAuthenticated()) {
        router.navigate(['/auth/login'], {
          queryParams: { returnUrl: state.url }
        });
        return false;
      }

      console.log('AdminGuard checking user...', authService.user());
      if (authService.isAdmin()) {
        console.log('AdminGuard passed.');
        return true;
      } else {
        console.warn('AdminGuard rejected. Role is not admin/branch_admin.');
        router.navigate(['/'], {
          queryParams: { error: 'access-denied' }
        });
        return false;
      }
    })
  );
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

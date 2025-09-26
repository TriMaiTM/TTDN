import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatStepperModule } from '@angular/material/stepper';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable, map, firstValueFrom } from 'rxjs';

import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { OrderService } from '../../services/order.service';
import { Cart, CartItem, Order, ShippingAddress, PaymentMethod, CheckoutData } from '../../models/order.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatRadioModule,
    MatCheckboxModule,
    MatDividerModule,
    MatSnackBarModule,
    MatStepperModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cartService = inject(CartService);
  private authService = inject(AuthService);
  private orderService = inject(OrderService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  cart$: Observable<Cart> = this.cartService.cart$;
  cartTotal$ = this.cartService.getCartTotal();
  
  shippingForm!: FormGroup;
  paymentForm!: FormGroup;
  
  isSubmitting = false;
  isLinear = false;

  // Shipping options
  shippingOptions = [
    { value: 'standard', label: 'Giao hàng tiêu chuẩn (2-3 ngày)', price: 30000 },
    { value: 'express', label: 'Giao hàng nhanh (1-2 ngày)', price: 60000 },
    { value: 'same_day', label: 'Giao hàng trong ngày', price: 100000 }
  ];

  // Payment methods
  paymentMethods = [
    { value: 'cod', label: 'Thanh toán khi nhận hàng (COD)' },
    { value: 'bank_transfer', label: 'Chuyển khoản ngân hàng' },
    { value: 'credit_card', label: 'Thẻ tín dụng/Ghi nợ' },
    { value: 'e_wallet', label: 'Ví điện tử (MoMo, ZaloPay)' }
  ];

  // Vietnam provinces for shipping
  provinces = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bạc Liêu', 'Bắc Giang', 'Bắc Kạn',
    'Bắc Ninh', 'Bến Tre', 'Bình Dương', 'Bình Định', 'Bình Phước',
    'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông',
    'Điện Biên', 'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang',
    'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang', 'Hòa Bình',
    'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
    'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định',
    'Nghệ An', 'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Phú Yên',
    'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh', 'Quảng Trị',
    'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên',
    'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang',
    'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
  ];

  selectedShipping = 'standard';
  selectedPayment = 'cod';
  shippingCost = 30000;

  get user() { 
    return this.authService.user(); 
  }

  get isAuthenticated() { 
    return this.authService.isAuthenticated(); 
  }

  get finalTotal$() {
    return this.cartTotal$.pipe(
      map(cartTotal => cartTotal + this.shippingCost)
    );
  }

  ngOnInit() {
    // Redirect if not authenticated
    if (!this.isAuthenticated) {
      this.router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: '/checkout' } 
      });
      return;
    }

    this.initializeForms();
    this.loadUserInfo();
  }

  initializeForms() {
    // Shipping form
    this.shippingForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern('^[0-9]{10,11}$')]],
      email: ['', [Validators.required, Validators.email]],
      address: ['', [Validators.required, Validators.minLength(5)]],
      ward: ['', Validators.required],
      district: ['', Validators.required],
      province: ['', Validators.required],
      shippingMethod: ['standard', Validators.required],
      notes: ['']
    });

    // Payment form
    this.paymentForm = this.fb.group({
      paymentMethod: ['cod', Validators.required],
      acceptTerms: [false, Validators.requiredTrue]
    });

    // Watch shipping method changes
    this.shippingForm.get('shippingMethod')?.valueChanges.subscribe(method => {
      this.selectedShipping = method;
      const option = this.shippingOptions.find(opt => opt.value === method);
      this.shippingCost = option?.price || 30000;
    });

    // Watch payment method changes
    this.paymentForm.get('paymentMethod')?.valueChanges.subscribe(method => {
      this.selectedPayment = method;
    });
  }

  loadUserInfo() {
    const user = this.user;
    if (user) {
      this.shippingForm.patchValue({
        fullName: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      });
    }
  }

  async onSubmitOrder() {
    if (!this.shippingForm.valid || !this.paymentForm.valid) {
      this.snackBar.open('Vui lòng điền đầy đủ thông tin', 'Đóng', { duration: 3000 });
      return;
    }

    this.isSubmitting = true;

    try {
      const cart = await firstValueFrom(this.cartService.cart$);

      if (!cart || cart.items.length === 0) {
        this.snackBar.open('Giỏ hàng trống', 'Đóng', { duration: 3000 });
        this.router.navigate(['/cart']);
        return;
      }

      // Prepare shipping address
      const shippingAddress: ShippingAddress = {
        fullName: this.shippingForm.value.fullName,
        phone: this.shippingForm.value.phone,
        address: this.shippingForm.value.address,
        city: this.shippingForm.value.province, // Use province as city
        district: this.shippingForm.value.district,
        ward: this.shippingForm.value.ward
      };

      // Prepare checkout data
      const checkoutData: CheckoutData = {
        selectedItems: cart.items,
        shippingAddress,
        paymentMethod: this.paymentForm.value.paymentMethod as PaymentMethod,
        notes: this.shippingForm.value.notes || ''
      };

      // Create order
      const orderId = await this.orderService.createOrder(checkoutData);
      
      // Clear cart
      await this.cartService.clearCart();

      // Show success message
      this.snackBar.open('Đặt hàng thành công!', 'Đóng', { duration: 3000 });

      // Redirect to order success page
      this.router.navigate(['/order-success'], { 
        queryParams: { orderId } 
      });

    } catch (error: any) {
      console.error('Order creation failed:', error);
      this.snackBar.open(
        error.message || 'Đặt hàng thất bại. Vui lòng thử lại.', 
        'Đóng', 
        { duration: 5000 }
      );
    } finally {
      this.isSubmitting = false;
    }
  }

  goBackToCart() {
    this.router.navigate(['/cart']);
  }

  continueShopping() {
    this.router.navigate(['/products']);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  // Form validation helpers
  hasError(form: FormGroup, field: string, errorType: string): boolean {
    const control = form.get(field);
    return !!(control?.hasError(errorType) && (control?.dirty || control?.touched));
  }

  getErrorMessage(form: FormGroup, field: string): string {
    const control = form.get(field);
    if (!control?.errors) return '';

    if (control.hasError('required')) return 'Trường này là bắt buộc';
    if (control.hasError('email')) return 'Email không hợp lệ';
    if (control.hasError('pattern')) return 'Định dạng không hợp lệ';
    if (control.hasError('minlength')) {
      const minLength = control.errors['minlength'].requiredLength;
      return `Tối thiểu ${minLength} ký tự`;
    }
    
    return 'Dữ liệu không hợp lệ';
  }
}
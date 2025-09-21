import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../../services/auth.service';
import { RegisterCredentials } from '../../../models';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatCheckboxModule
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss']
})
export class RegisterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  registerForm: FormGroup;
  hidePassword = true;
  hideConfirmPassword = true;

  // Reactive signals from auth service
  isLoading = this.authService.isLoading;
  error = this.authService.error;

  constructor() {
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      agreeToTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngOnInit() {
    // Clear any previous errors
    this.authService.clearError();
  }

  // Custom validator for password confirmation
  private passwordMatchValidator = (control: AbstractControl): { [key: string]: any } | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  };

  async onSubmit() {
    if (this.registerForm.valid) {
      const credentials: RegisterCredentials = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password,
        confirmPassword: this.registerForm.value.confirmPassword
      };

      try {
        // Check if email already exists
        const emailExists = await this.authService.isEmailExists(credentials.email);
        if (emailExists) {
          this.snackBar.open('Email này đã được sử dụng', 'Đóng', {
            duration: 5000,
            horizontalPosition: 'end',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
          return;
        }

        await this.authService.register(credentials);
        this.snackBar.open('Đăng ký thành công! Chào mừng bạn đến với TTDN!', 'Đóng', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      } catch (error: any) {
        this.snackBar.open(this.authService.error() || 'Đăng ký thất bại', 'Đóng', {
          duration: 5000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.registerForm.controls).forEach(key => {
      const control = this.registerForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.registerForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} là bắt buộc`;
    }
    
    if (control?.hasError('email')) {
      return 'Email không hợp lệ';
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength']?.requiredLength;
      return `${this.getFieldLabel(fieldName)} phải có ít nhất ${minLength} ký tự`;
    }

    if (fieldName === 'confirmPassword' && this.registerForm.hasError('passwordMismatch')) {
      return 'Mật khẩu xác nhận không khớp';
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: 'Họ tên',
      email: 'Email',
      password: 'Mật khẩu',
      confirmPassword: 'Xác nhận mật khẩu'
    };
    return labels[fieldName] || fieldName;
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility() {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  // Test helper method
  fillTestUser() {
    this.registerForm.patchValue({
      name: 'Test User',
      email: `test${Math.floor(Math.random() * 1000)}@ttdn.com`,
      password: 'test123',
      confirmPassword: 'test123',
      agreeToTerms: true
    });
  }
}

import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { LoginCredentials } from '../../../models';

@Component({
  selector: 'app-login',
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
    MatSnackBarModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class LoginComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);

  loginForm: FormGroup;
  hidePassword = true;

  // Reactive signals from auth service
  isLoading = this.authService.isLoading;
  error = this.authService.error;

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit() {
    // Clear any previous errors
    this.authService.clearError();
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const credentials: LoginCredentials = this.loginForm.value;
      
      try {
        await this.authService.login(credentials);
        this.snackBar.open('Đăng nhập thành công!', 'Đóng', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
        });
      } catch (error: any) {
        this.snackBar.open(this.authService.error() || 'Đăng nhập thất bại', 'Đóng', {
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
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.loginForm.get(fieldName);
    
    if (control?.hasError('required')) {
      return `${this.getFieldLabel(fieldName)} là bắt buộc`;
    }
    
    if (control?.hasError('email')) {
      return 'Email không hợp lệ';
    }
    
    if (control?.hasError('minlength')) {
      const minLength = control.errors?.['minlength']?.requiredLength;
      return `Mật khẩu phải có ít nhất ${minLength} ký tự`;
    }
    
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      email: 'Email',
      password: 'Mật khẩu'
    };
    return labels[fieldName] || fieldName;
  }

  togglePasswordVisibility() {
    this.hidePassword = !this.hidePassword;
  }

  // Demo accounts for testing
  fillDemoAdmin() {
    this.loginForm.patchValue({
      email: 'admin@ttdn.com',
      password: 'admin123'
    });
  }

  fillDemoUser() {
    this.loginForm.patchValue({
      email: 'user@ttdn.com',
      password: 'user123'
    });
  }
}

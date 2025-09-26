import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  template: `
    <div class="container">
      <h1>Admin Panel</h1>
      
      <mat-card>
        <mat-card-header>
          <mat-icon mat-card-avatar>admin_panel_settings</mat-icon>
          <mat-card-title>Quản Trị Hệ Thống</mat-card-title>
          <mat-card-subtitle>Công cụ quản lý dữ liệu và hệ thống</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="admin-grid">
            <button 
              mat-raised-button 
              color="warn" 
              routerLink="/admin/simple-test"
              class="admin-btn">
              <mat-icon>bug_report</mat-icon>
              Test Firebase
            </button>
            
            <button 
              mat-raised-button 
              color="primary" 
              routerLink="/admin/data-init"
              class="admin-btn">
              <mat-icon>cloud_upload</mat-icon>
              Khởi Tạo Dữ Liệu
            </button>
            
            <button 
              mat-raised-button 
              color="primary" 
              routerLink="/admin/orders"
              class="admin-btn">
              <mat-icon>shopping_cart</mat-icon>
              Quản Lý Đơn Hàng
            </button>
            
            <button 
              mat-raised-button 
              color="accent" 
              routerLink="/admin/products"
              class="admin-btn">
              <mat-icon>inventory</mat-icon>
              Quản Lý Sản Phẩm
            </button>
            
            <button 
              mat-raised-button 
              color="primary" 
              routerLink="/admin/categories"
              class="admin-btn">
              <mat-icon>category</mat-icon>
              Quản Lý Danh Mục
            </button>
            
            <button 
              mat-raised-button 
              color="warn" 
              routerLink="/admin/checkout-test"
              class="admin-btn">
              <mat-icon>payment</mat-icon>
              Test Checkout Flow
            </button>
            
            <button 
              mat-raised-button 
              color="accent" 
              routerLink="/admin/news"
              class="admin-btn">
              <mat-icon>article</mat-icon>
              Quản Lý Tin Tức
            </button>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
    }

    h1 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }

    .admin-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-top: 20px;
    }

    .admin-btn {
      height: 80px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      
      mat-icon {
        font-size: 24px;
      }
    }

    .coming-soon {
      font-size: 12px;
      opacity: 0.7;
    }
  `]
})
export class AdminComponent {
}

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { DataInitializationService } from '../../../services/data-initialization.service';

@Component({
  selector: 'app-data-initialization',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatIconModule
  ],
  template: `
    <div class="container">
      <mat-card class="initialization-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>cloud_upload</mat-icon>
          <mat-card-title>Khởi Tạo Dữ Liệu</mat-card-title>
          <mat-card-subtitle>Tải dữ liệu mẫu vào Firebase Firestore</mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          <div class="status-section">
            <div class="status-item" [class.completed]="dataExists">
              <mat-icon>{{ dataExists ? 'check_circle' : 'radio_button_unchecked' }}</mat-icon>
              <span>Dữ liệu đã tồn tại: {{ dataExists ? 'Có' : 'Không' }}</span>
            </div>
          </div>

          <div class="info-section">
            <h3>Dữ liệu sẽ được khởi tạo:</h3>
            <ul>
              <li><strong>Categories:</strong> 11 danh mục (4 danh mục chính + 7 danh mục con)</li>
              <li><strong>Products:</strong> 8 sản phẩm mẫu với đầy đủ thông tin</li>
              <li><strong>Bao gồm:</strong> Vật liệu xây dựng, thiết bị máy móc, thiết bị điện, dụng cụ</li>
            </ul>
          </div>

          <mat-progress-bar 
            *ngIf="isLoading" 
            mode="indeterminate"
            class="progress-bar">
          </mat-progress-bar>
        </mat-card-content>

        <mat-card-actions align="end">
          <button 
            mat-raised-button 
            color="primary"
            (click)="checkData()"
            [disabled]="isLoading">
            <mat-icon>refresh</mat-icon>
            Kiểm Tra Dữ Liệu
          </button>
          
          <button 
            mat-raised-button 
            color="accent"
            (click)="initializeData()"
            [disabled]="isLoading || dataExists">
            <mat-icon>cloud_upload</mat-icon>
            {{ dataExists ? 'Đã Khởi Tạo' : 'Khởi Tạo Dữ Liệu' }}
          </button>
        </mat-card-actions>
      </mat-card>

      <mat-card class="warning-card" *ngIf="!dataExists">
        <mat-card-content>
          <div class="warning-content">
            <mat-icon color="warn">warning</mat-icon>
            <div>
              <h4>Lưu ý quan trọng:</h4>
              <p>Đảm bảo bạn đã cấu hình Firebase trong file <code>firebase.config.ts</code> với thông tin project thực tế trước khi khởi tạo dữ liệu.</p>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
    }

    .initialization-card {
      margin-bottom: 20px;
    }

    .status-section {
      margin: 20px 0;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: 8px;
      background-color: #f5f5f5;
      margin-bottom: 10px;
    }

    .status-item.completed {
      background-color: #e8f5e8;
      color: #2e7d32;
    }

    .status-item mat-icon {
      color: #757575;
    }

    .status-item.completed mat-icon {
      color: #4caf50;
    }

    .info-section {
      margin: 20px 0;
    }

    .info-section h3 {
      margin-bottom: 10px;
      color: #333;
    }

    .info-section ul {
      margin: 0;
      padding-left: 20px;
    }

    .info-section li {
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .progress-bar {
      margin: 20px 0;
    }

    .warning-card {
      border-left: 4px solid #ff9800;
    }

    .warning-content {
      display: flex;
      align-items: flex-start;
      gap: 15px;
    }

    .warning-content h4 {
      margin: 0 0 10px 0;
      color: #f57c00;
    }

    .warning-content p {
      margin: 0;
      line-height: 1.5;
    }

    code {
      background-color: #f5f5f5;
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
    }

    mat-card-actions {
      padding: 16px;
      gap: 10px;
    }

    button mat-icon {
      margin-right: 8px;
    }
  `]
})
export class DataInitializationComponent implements OnInit {
  dataExists = false;
  isLoading = false;

  constructor(
    private dataInitService: DataInitializationService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.checkData();
  }

  async checkData() {
    this.isLoading = true;
    try {
      this.dataExists = await this.dataInitService.checkDataExists();
      this.showMessage(this.dataExists ? 'Dữ liệu đã tồn tại' : 'Chưa có dữ liệu', 
                      this.dataExists ? 'success' : 'info');
    } catch (error) {
      this.showMessage('Lỗi kiểm tra dữ liệu', 'error');
      console.error('Error checking data:', error);
    }
    this.isLoading = false;
  }

  async initializeData() {
    if (this.dataExists) {
      this.showMessage('Dữ liệu đã tồn tại, không cần khởi tạo lại', 'info');
      return;
    }

    this.isLoading = true;
    try {
      console.log('🔄 Bắt đầu khởi tạo dữ liệu...');
      await this.dataInitService.initializeSampleData();
      console.log('✅ Khởi tạo dữ liệu thành công!');
      this.dataExists = true;
      this.showMessage('Khởi tạo dữ liệu thành công!', 'success');
    } catch (error: any) {
      console.error('❌ Lỗi khởi tạo dữ liệu:', error);
      this.showMessage('Lỗi khởi tạo dữ liệu: ' + (error?.message || error), 'error');
    }
    this.isLoading = false;
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info') {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      panelClass: [type === 'success' ? 'success-snackbar' : 
                  type === 'error' ? 'error-snackbar' : 'info-snackbar']
    });
  }
}

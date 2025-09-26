import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-order-success',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule
  ],
  template: `
    <div class="success-container">
      <div class="container">
        <mat-card class="success-card">
          <mat-card-content>
            <div class="success-content">
              <div class="success-icon">
                <mat-icon>check_circle</mat-icon>
              </div>
              
              <h1>Đặt hàng thành công!</h1>
              <p class="success-message">
                Cảm ơn bạn đã đặt hàng. Chúng tôi đã nhận được đơn hàng của bạn và sẽ xử lý trong thời gian sớm nhất.
              </p>

              <div class="order-info" *ngIf="orderId">
                <p><strong>Mã đơn hàng:</strong> {{ orderId }}</p>
                <p class="info-note">
                  Bạn sẽ nhận được email xác nhận và thông tin theo dõi đơn hàng trong vài phút tới.
                </p>
              </div>

              <mat-divider></mat-divider>

              <div class="next-steps">
                <h3>Các bước tiếp theo:</h3>
                <ol>
                  <li>Chúng tôi sẽ xác nhận đơn hàng qua email/điện thoại</li>
                  <li>Chuẩn bị và đóng gói sản phẩm</li>
                  <li>Giao hàng theo địa chỉ đã cung cấp</li>
                  <li>Bạn có thể theo dõi tình trạng đơn hàng trong tài khoản của mình</li>
                </ol>
              </div>

              <div class="action-buttons">
                <button mat-raised-button color="primary" (click)="continueShopping()">
                  <mat-icon>shopping_bag</mat-icon>
                  Tiếp tục mua sắm
                </button>
                <button mat-button (click)="goToOrders()">
                  <mat-icon>list_alt</mat-icon>
                  Xem đơn hàng của tôi
                </button>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>
  `,
  styles: [`
    .success-container {
      min-height: calc(100vh - 120px);
      background: #f5f5f5;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 32px 0;

      .container {
        max-width: 600px;
        padding: 0 16px;
        width: 100%;
      }
    }

    .success-card {
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
      border-radius: 12px;
    }

    .success-content {
      text-align: center;
      padding: 32px;

      .success-icon {
        margin-bottom: 24px;

        mat-icon {
          font-size: 80px;
          width: 80px;
          height: 80px;
          color: #4caf50;
        }
      }

      h1 {
        color: #333;
        font-size: 2.2rem;
        font-weight: 600;
        margin: 0 0 16px 0;
      }

      .success-message {
        color: #666;
        font-size: 1.1rem;
        line-height: 1.6;
        margin: 0 0 24px 0;
      }

      .order-info {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 20px;
        margin: 24px 0;
        text-align: left;

        p {
          margin: 0 0 12px 0;
          font-size: 14px;

          strong {
            color: #333;
            font-weight: 600;
          }
        }

        .info-note {
          color: #666;
          font-style: italic;
          margin: 12px 0 0 0 !important;
        }
      }

      mat-divider {
        margin: 32px 0;
      }

      .next-steps {
        text-align: left;
        margin: 24px 0;

        h3 {
          color: #333;
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 16px 0;
        }

        ol {
          color: #555;
          font-size: 14px;
          line-height: 1.6;
          padding-left: 20px;

          li {
            margin: 8px 0;
          }
        }
      }

      .action-buttons {
        display: flex;
        gap: 16px;
        justify-content: center;
        margin-top: 32px;
        flex-wrap: wrap;

        button {
          mat-icon {
            margin-right: 8px;
            font-size: 18px;
            width: 18px;
            height: 18px;
          }
        }
      }
    }

    @media (max-width: 768px) {
      .success-container {
        padding: 16px 0;
      }

      .success-content {
        padding: 24px 16px;

        .success-icon mat-icon {
          font-size: 64px;
          width: 64px;
          height: 64px;
        }

        h1 {
          font-size: 1.8rem;
        }

        .success-message {
          font-size: 1rem;
        }

        .action-buttons {
          flex-direction: column;

          button {
            width: 100%;
          }
        }
      }
    }
  `]
})
export class OrderSuccessComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  orderId: string | null = null;

  ngOnInit() {
    this.orderId = this.route.snapshot.queryParams['orderId'];
  }

  continueShopping() {
    this.router.navigate(['/products']);
  }

  goToOrders() {
    this.router.navigate(['/order-history']);
  }
}
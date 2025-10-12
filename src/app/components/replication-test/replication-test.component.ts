import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ReplicatedProductService } from '../../services/replicated-product.service';
import { FirebaseReplicationService } from '../../services/firebase-replication.service';
import { Product } from '../../models';

@Component({
  selector: 'app-replication-test',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  template: `
    <mat-card class="test-card">
      <mat-card-header>
        <mat-card-title>🧪 Database Replication Test</mat-card-title>
        <mat-card-subtitle>Test CRUD operations across all replicas</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <div class="test-section">
          <h3>Database Status</h3>
          <div class="database-status">
            <div *ngFor="let config of databaseConfigs" 
                 class="db-status" 
                 [class.healthy]="config.isHealthy"
                 [class.unhealthy]="!config.isHealthy">
              <mat-icon>{{ config.isHealthy ? 'check_circle' : 'error' }}</mat-icon>
              {{ config.name }} (Priority: {{ config.priority }})
              <small>Products: {{ productCounts[config.name] || 0 }}</small>
            </div>
          </div>
        </div>

        <div class="test-section">
          <h3>Test Operations</h3>
          <div class="test-buttons">
            <button mat-raised-button 
                    color="primary" 
                    (click)="testAddProduct()"
                    [disabled]="isLoading">
              <mat-icon>add</mat-icon>
              Test ADD Product
            </button>
            
            <button mat-raised-button 
                    color="accent" 
                    (click)="testUpdateProduct()"
                    [disabled]="isLoading || !lastProductId">
              <mat-icon>edit</mat-icon>
              Test UPDATE Product
            </button>
            
            <button mat-raised-button 
                    color="warn" 
                    (click)="testDeleteProduct()"
                    [disabled]="isLoading || !lastProductId">
              <mat-icon>delete</mat-icon>
              Test DELETE Product
            </button>
          </div>
        </div>

        <div class="test-section" *ngIf="lastProductId">
          <h3>Last Test Product</h3>
          <p><strong>ID:</strong> {{ lastProductId }}</p>
          <p><strong>Name:</strong> {{ lastProductName }}</p>
        </div>

        <div class="test-section" *ngIf="testResults.length > 0">
          <h3>Test Results</h3>
          <div class="test-results">
            <div *ngFor="let result of testResults" 
                 class="test-result"
                 [class.success]="result.success"
                 [class.error]="!result.success">
              <mat-icon>{{ result.success ? 'check' : 'error' }}</mat-icon>
              <span>{{ result.message }}</span>
              <small>{{ result.timestamp | date:'HH:mm:ss' }}</small>
            </div>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styles: [`
    .test-card {
      max-width: 800px;
      margin: 20px auto;
    }

    .test-section {
      margin: 20px 0;
      padding: 15px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
    }

    .database-status {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }

    .db-status {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      border-radius: 6px;
      background: #f5f5f5;
      flex-direction: column;
      text-align: center;
      min-width: 150px;
    }

    .db-status.healthy {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .db-status.unhealthy {
      background: #ffebee;
      color: #c62828;
    }

    .test-buttons {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .test-results {
      max-height: 300px;
      overflow-y: auto;
    }

    .test-result {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px;
      margin: 5px 0;
      border-radius: 4px;
    }

    .test-result.success {
      background: #e8f5e8;
      color: #2e7d32;
    }

    .test-result.error {
      background: #ffebee;
      color: #c62828;
    }

    .test-result small {
      margin-left: auto;
    }
  `]
})
export class ReplicationTestComponent implements OnInit {
  private productService = inject(ReplicatedProductService);
  private replicationService = inject(FirebaseReplicationService);
  private snackBar = inject(MatSnackBar);

  databaseConfigs: any[] = [];
  productCounts: { [key: string]: number } = {};
  isLoading = false;
  lastProductId = '';
  lastProductName = '';
  testResults: Array<{message: string, success: boolean, timestamp: Date}> = [];

  ngOnInit() {
    this.loadDatabaseStatus();
    this.refreshProductCounts();
  }

  async loadDatabaseStatus() {
    // Get database configs from replication service
    this.databaseConfigs = await this.replicationService.getDatabaseConfigs();
  }

  async refreshProductCounts() {
    try {
      for (const config of this.databaseConfigs) {
        const count = await this.replicationService.getCollectionCount(config.name, 'products');
        this.productCounts[config.name] = count;
      }
    } catch (error) {
      console.error('Error refreshing product counts:', error);
    }
  }

  async testAddProduct() {
    this.isLoading = true;
    try {
      const testProduct: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        name: `Test Product ${Date.now()}`,
        price: 99.99,
        description: 'Test product for replication',
        category: 'test',
        brand: 'Test Brand',
        sku: `TEST-${Date.now()}`,
        specifications: [],
        images: ['/assets/images/test.jpg'],
        tags: ['test', 'replication'],
        status: 'active',
        stock: 100,
        unit: 'cái',
        discount: 0,
        rating: 0,
        reviewCount: 0,
        featured: false
      };

      const result = await this.productService.addProduct(testProduct);
      this.lastProductId = result;
      this.lastProductName = testProduct.name;
      
      // Wait a moment for replication
      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.refreshProductCounts();
      
      this.addTestResult(`✅ ADD: Product "${testProduct.name}" added successfully`, true);
      this.snackBar.open('Product added and replicated!', 'Close', { duration: 3000 });
      
    } catch (error) {
      this.addTestResult(`❌ ADD: Failed - ${error}`, false);
      this.snackBar.open('Add failed!', 'Close', { duration: 3000 });
    }
    this.isLoading = false;
  }

  async testUpdateProduct() {
    if (!this.lastProductId) return;
    
    this.isLoading = true;
    try {
      const updateData = {
        name: `Updated Product ${Date.now()}`,
        price: 149.99,
        description: 'Updated test product'
      };

      await this.productService.updateProduct(this.lastProductId, updateData);
      this.lastProductName = updateData.name;
      
      // Wait a moment for replication
      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.refreshProductCounts();
      
      this.addTestResult(`✅ UPDATE: Product "${updateData.name}" updated successfully`, true);
      this.snackBar.open('Product updated and replicated!', 'Close', { duration: 3000 });
      
    } catch (error) {
      this.addTestResult(`❌ UPDATE: Failed - ${error}`, false);
      this.snackBar.open('Update failed!', 'Close', { duration: 3000 });
    }
    this.isLoading = false;
  }

  async testDeleteProduct() {
    if (!this.lastProductId) return;
    
    this.isLoading = true;
    try {
      await this.productService.deleteProduct(this.lastProductId);
      
      // Wait a moment for replication
      await new Promise(resolve => setTimeout(resolve, 2000));
      await this.refreshProductCounts();
      
      this.addTestResult(`✅ DELETE: Product "${this.lastProductName}" deleted successfully`, true);
      this.snackBar.open('Product deleted from all replicas!', 'Close', { duration: 3000 });
      
      this.lastProductId = '';
      this.lastProductName = '';
      
    } catch (error) {
      this.addTestResult(`❌ DELETE: Failed - ${error}`, false);
      this.snackBar.open('Delete failed!', 'Close', { duration: 3000 });
    }
    this.isLoading = false;
  }

  private addTestResult(message: string, success: boolean) {
    this.testResults.unshift({
      message,
      success,
      timestamp: new Date()
    });
    
    // Keep only last 10 results
    if (this.testResults.length > 10) {
      this.testResults = this.testResults.slice(0, 10);
    }
  }
}
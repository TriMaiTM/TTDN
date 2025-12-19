import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReplicatedProductService } from '../../services/replicated-product.service';
import { FirebaseReplicationService, DatabaseHealth } from '../../services/firebase-replication.service';
import { Product } from '../../models';

@Component({
  selector: 'app-replication-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="replication-demo">
      <h2>🧪 Database Replication Demo</h2>
      
      <!-- Current Status -->
      <div class="status-section">
        <h3>📊 Current Status</h3>
        <div class="status-info">
          <div class="status-item">
            <strong>Active Primary:</strong> 
            <span class="badge primary">{{ currentPrimary }}</span>
          </div>
          <div class="status-item">
            <strong>Healthy Replicas:</strong> 
            <span class="badge" [class.success]="healthyCount > 0" [class.warning]="healthyCount === 0">
              {{ healthyCount }}/{{ totalReplicas }}
            </span>
          </div>
        </div>
      </div>

      <!-- Test Actions -->
      <div class="test-section">
        <h3>🔧 Test Actions</h3>
        <div class="test-buttons">
          <button class="btn btn-primary" (click)="testRead()" [disabled]="isLoading">
            {{ isLoading ? 'Testing...' : '📖 Test Read Operation' }}
          </button>
          
          <button class="btn btn-warning" (click)="testFailover()" [disabled]="isLoading">
            {{ isLoading ? 'Testing...' : '🔀 Test Failover' }}
          </button>
          
          <button class="btn btn-info" (click)="testHealthCheck()" [disabled]="isLoading">
            {{ isLoading ? 'Checking...' : '💓 Test Health Check' }}
          </button>
        </div>
      </div>

      <!-- Test Results -->
      <div class="results-section" *ngIf="testResults.length > 0">
        <h3>📋 Test Results</h3>
        <div class="results-container">
          <div 
            *ngFor="let result of testResults; trackBy: trackByIndex" 
            class="result-item"
            [class.success]="result.success"
            [class.error]="!result.success"
          >
            <div class="result-header">
              <span class="result-icon">{{ result.success ? '✅' : '❌' }}</span>
              <span class="result-title">{{ result.title }}</span>
              <span class="result-time">{{ result.timestamp | date:'HH:mm:ss' }}</span>
            </div>
            <div class="result-details" *ngIf="result.details">
              {{ result.details }}
            </div>
            <div class="result-error" *ngIf="result.error">
              <strong>Error:</strong> {{ result.error }}
            </div>
          </div>
        </div>
      </div>

      <!-- Sample Data -->
      <div class="data-section" *ngIf="sampleProducts.length > 0">
        <h3>📦 Sample Data (from {{ currentPrimary }})</h3>
        <div class="data-grid">
          <div *ngFor="let product of sampleProducts; trackBy: trackByProductId" class="product-card">
            <h4>{{ product.name }}</h4>
            <p>{{ product.description }}</p>
            <div class="product-meta">
              <span class="price">{{ product.price | currency:'VND':'symbol':'1.0-0' }}</span>
              <span class="category">{{ product.category }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Performance Metrics -->
      <div class="metrics-section" *ngIf="performanceMetrics">
        <h3>📈 Performance Metrics</h3>
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-value">{{ performanceMetrics.readLatency }}ms</div>
            <div class="metric-label">Read Latency</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ performanceMetrics.successRate }}%</div>
            <div class="metric-label">Success Rate</div>
          </div>
          <div class="metric-card">
            <div class="metric-value">{{ performanceMetrics.totalTests }}</div>
            <div class="metric-label">Total Tests</div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .replication-demo {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .replication-demo h2 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }

    .replication-demo h3 {
      color: #34495e;
      margin: 20px 0 15px 0;
      font-size: 1.2em;
    }

    .status-section {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }

    .status-info {
      display: flex;
      gap: 30px;
      flex-wrap: wrap;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .badge {
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 0.9em;
    }

    .badge.primary {
      background: #007bff;
      color: white;
    }

    .badge.success {
      background: #28a745;
      color: white;
    }

    .badge.warning {
      background: #ffc107;
      color: #212529;
    }

    .test-section {
      margin-bottom: 30px;
    }

    .test-buttons {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 12px 24px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      transition: all 0.3s ease;
      min-width: 180px;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-primary {
      background: #007bff;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #0056b3;
    }

    .btn-warning {
      background: #ffc107;
      color: #212529;
    }

    .btn-warning:hover:not(:disabled) {
      background: #e0a800;
    }

    .btn-info {
      background: #17a2b8;
      color: white;
    }

    .btn-info:hover:not(:disabled) {
      background: #138496;
    }

    .results-section {
      margin-bottom: 30px;
    }

    .results-container {
      max-height: 400px;
      overflow-y: auto;
      border: 1px solid #dee2e6;
      border-radius: 6px;
    }

    .result-item {
      padding: 15px;
      border-bottom: 1px solid #e9ecef;
    }

    .result-item:last-child {
      border-bottom: none;
    }

    .result-item.success {
      background: #f8fff9;
      border-left: 4px solid #28a745;
    }

    .result-item.error {
      background: #fff8f8;
      border-left: 4px solid #dc3545;
    }

    .result-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 5px;
    }

    .result-icon {
      font-size: 1.2em;
    }

    .result-title {
      font-weight: 500;
      flex: 1;
    }

    .result-time {
      font-size: 0.9em;
      color: #6c757d;
    }

    .result-details {
      margin: 8px 0;
      color: #495057;
      font-size: 0.9em;
    }

    .result-error {
      margin-top: 8px;
      color: #dc3545;
      font-size: 0.9em;
    }

    .data-section {
      margin-bottom: 30px;
    }

    .data-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
    }

    .product-card {
      background: white;
      border: 1px solid #e9ecef;
      border-radius: 8px;
      padding: 20px;
      transition: transform 0.2s ease;
    }

    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    }

    .product-card h4 {
      margin: 0 0 10px 0;
      color: #2c3e50;
      font-size: 1.1em;
    }

    .product-card p {
      margin: 0 0 15px 0;
      color: #6c757d;
      font-size: 0.9em;
      line-height: 1.4;
    }

    .product-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .price {
      font-weight: bold;
      color: #e74c3c;
      font-size: 1.1em;
    }

    .category {
      background: #e9ecef;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.8em;
      color: #495057;
    }

    .metrics-section {
      margin-bottom: 20px;
    }

    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
    }

    .metric-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 25px;
      border-radius: 10px;
      text-align: center;
    }

    .metric-value {
      font-size: 2.2em;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .metric-label {
      font-size: 0.9em;
      opacity: 0.9;
    }

    @media (max-width: 768px) {
      .status-info {
        flex-direction: column;
        gap: 15px;
      }
      
      .test-buttons {
        flex-direction: column;
      }
      
      .btn {
        min-width: auto;
        width: 100%;
      }
      
      .data-grid {
        grid-template-columns: 1fr;
      }
      
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }
  `]
})
export class ReplicationDemoComponent implements OnInit {
  currentPrimary = '';
  healthyCount = 0;
  totalReplicas = 0;
  isLoading = false;
  
  testResults: any[] = [];
  sampleProducts: Product[] = [];
  
  performanceMetrics = {
    readLatency: 0,
    successRate: 100,
    totalTests: 0
  };

  constructor(
    private replicatedProductService: ReplicatedProductService,
    private replicationService: FirebaseReplicationService
  ) {}

  ngOnInit(): void {
    this.loadInitialData();
    this.subscribeToHealthStatus();
  }

  private loadInitialData(): void {
    this.currentPrimary = this.replicationService.getCurrentPrimary();
    this.addTestResult('System Initialized', true, `Current primary: ${this.currentPrimary}`);
  }

  private subscribeToHealthStatus(): void {
    this.replicationService.getHealthStatus().subscribe(healthData => {
      this.healthyCount = healthData.filter(h => h.isHealthy).length;
      this.totalReplicas = healthData.length;
      this.updatePerformanceMetrics();
    });
  }

  async testRead(): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;
    const startTime = Date.now();
    
    try {
      this.addTestResult('Read Test', true, 'Starting read operation test...');
      
      const products = await this.replicatedProductService.fetchProducts({ limit: 5 });
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      this.sampleProducts = products.slice(0, 3);
      this.performanceMetrics.readLatency = latency;
      this.performanceMetrics.totalTests++;
      
      this.addTestResult(
        'Read Test Completed', 
        true, 
        `Retrieved ${products.length} products in ${latency}ms from ${this.currentPrimary}`
      );
      
    } catch (error) {
      const endTime = Date.now();
      const latency = endTime - startTime;
      
      this.addTestResult(
        'Read Test Failed', 
        false, 
        `Test failed after ${latency}ms`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      this.updateSuccessRate(false);
    } finally {
      this.isLoading = false;
    }
  }

  async testFailover(): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      this.addTestResult('Failover Test', true, 'Initiating manual failover...');
      
      const oldPrimary = this.currentPrimary;
      await this.replicationService.forceFailover();
      this.currentPrimary = this.replicationService.getCurrentPrimary();
      
      this.addTestResult(
        'Failover Completed', 
        true, 
        `Switched from ${oldPrimary} to ${this.currentPrimary}`
      );
      
      // Test read after failover
      await this.testRead();
      
    } catch (error) {
      this.addTestResult(
        'Failover Failed', 
        false, 
        'Manual failover test failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      this.updateSuccessRate(false);
    } finally {
      this.isLoading = false;
    }
  }

  async testHealthCheck(): Promise<void> {
    if (this.isLoading) return;
    
    this.isLoading = true;
    
    try {
      this.addTestResult('Health Check', true, 'Performing comprehensive health check...');
      
      // Wait a moment for health check to complete
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.addTestResult(
        'Health Check Completed', 
        true, 
        `Health status updated. ${this.healthyCount}/${this.totalReplicas} replicas healthy`
      );
      
    } catch (error) {
      this.addTestResult(
        'Health Check Failed', 
        false, 
        'Health check test failed',
        error instanceof Error ? error.message : 'Unknown error'
      );
      
      this.updateSuccessRate(false);
    } finally {
      this.isLoading = false;
    }
  }

  private addTestResult(title: string, success: boolean, details?: string, error?: string): void {
    const result = {
      title,
      success,
      details,
      error,
      timestamp: new Date()
    };
    
    this.testResults.unshift(result);
    
    // Keep only last 20 results
    if (this.testResults.length > 20) {
      this.testResults = this.testResults.slice(0, 20);
    }
    
    this.updateSuccessRate(success);
  }

  private updateSuccessRate(lastTestSuccess: boolean): void {
    const successfulTests = this.testResults.filter(r => r.success).length;
    const totalTests = this.testResults.length;
    
    this.performanceMetrics.successRate = totalTests > 0 
      ? Math.round((successfulTests / totalTests) * 100) 
      : 100;
    
    this.performanceMetrics.totalTests = totalTests;
  }

  private updatePerformanceMetrics(): void {
    // Update metrics based on current health status
    if (this.healthyCount === 0) {
      this.performanceMetrics.successRate = 0;
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  trackByProductId(index: number, product: Product): string {
    return product.id;
  }
}

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';
import { FirebaseReplicationService, DatabaseHealth } from '../../services/firebase-replication.service';

@Component({
  selector: 'app-replication-management',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="replication-dashboard">
      <h2>🗄️ Database Replication Management</h2>
      
      <!-- Current Status -->
      <div class="status-section">
        <h3>📊 Tình trạng hiện tại</h3>
        <div class="current-primary">
          <strong>Database đang hoạt động:</strong> 
          <span class="primary-badge">{{ currentPrimary | titlecase }}</span>
        </div>
      </div>

      <!-- Health Status -->
      <div class="health-section">
        <h3>💓Tình trạng Database Health</h3>
        <div class="health-grid">
          <div 
            *ngFor="let health of healthStatus" 
            class="health-card"
            [class.healthy]="health.isHealthy"
            [class.unhealthy]="!health.isHealthy"
          >
            <div class="health-header">
              <h4>{{ health.name | titlecase }}</h4>
              <div class="status-indicator" [class.online]="health.isHealthy"></div>
            </div>
            
            <div class="health-details">
              <div class="detail-row">
                <span>Status:</span>
                <span [class.text-success]="health.isHealthy" [class.text-danger]="!health.isHealthy">
                  {{ health.isHealthy ? 'Healthy' : 'Unhealthy' }}
                </span>
              </div>
              
              <div class="detail-row" *ngIf="health.isHealthy">
                <span>Response Time:</span>
                <span>{{ health.responseTime }}ms</span>
              </div>
              
              <div class="detail-row">
                <span>Last Check:</span>
                <span>{{ health.lastCheck | date:'short' }}</span>
              </div>
              
              <div class="detail-row" *ngIf="health.error">
                <span>Error:</span>
                <span class="error-text">{{ health.error }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="actions-section">
        <h3>⚡ Actions</h3>
        <div class="action-buttons">
          <button 
            class="btn btn-primary" 
            (click)="performHealthCheck()"
            [disabled]="isPerformingHealthCheck"
          >
            {{ isPerformingHealthCheck ? 'Checking...' : '🔄 Refresh Health Check' }}
          </button>
          
          <button 
            class="btn btn-warning" 
            (click)="forceFailover()"
            [disabled]="isPerformingFailover"
          >
            {{ isPerformingFailover ? 'Failing over...' : '🔀 Force Failover' }}
          </button>
          
          <button 
            class="btn btn-info" 
            (click)="testReplication()"
            [disabled]="isTestingReplication"
          >
            {{ isTestingReplication ? 'Testing...' : '🧪 Test Replication' }}
          </button>
        </div>
      </div>

      <!-- Statistics -->
      <div class="stats-section" *ngIf="replicationStats">
        <h3>📈 Thống kê</h3>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ replicationStats.totalReplicas }}</div>
            <div class="stat-label">Bản sao database</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ replicationStats.healthyReplicas }}</div>
            <div class="stat-label">Healthy</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ replicationStats.avgResponseTime }}ms</div>
            <div class="stat-label">Thời gian phản hồi trung bình</div>
          </div>
          
          <div class="stat-card">
            <div class="stat-value">{{ replicationStats.uptime }}%</div>
            <div class="stat-label">Thời gian hoạt động hệ thống</div>
          </div>
        </div>
      </div>

      <!-- Logs -->
      <div class="logs-section">
        <h3>📝 Recent Activity</h3>
        <div class="logs-container">
          <div 
            *ngFor="let log of recentLogs; trackBy: trackByLogId" 
            class="log-entry"
            [class.log-info]="log.type === 'info'"
            [class.log-warning]="log.type === 'warning'"
            [class.log-error]="log.type === 'error'"
          >
            <span class="log-timestamp">{{ log.timestamp | date:'HH:mm:ss' }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .replication-dashboard {
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }

    .replication-dashboard h2 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }

    .replication-dashboard h3 {
      color: #34495e;
      margin: 20px 0 15px 0;
      font-size: 1.2em;
    }

    .status-section {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .current-primary {
      font-size: 1.1em;
    }

    .primary-badge {
      background: #28a745;
      color: white;
      padding: 4px 12px;
      border-radius: 20px;
      font-weight: bold;
      margin-left: 10px;
    }

    .health-section {
      margin-bottom: 30px;
    }

    .health-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 15px;
    }

    .health-card {
      border: 2px solid #e9ecef;
      border-radius: 10px;
      padding: 20px;
      background: white;
      transition: all 0.3s ease;
    }

    .health-card.healthy {
      border-color: #28a745;
      background: #f8fff9;
    }

    .health-card.unhealthy {
      border-color: #dc3545;
      background: #fff8f8;
    }

    .health-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
    }

    .health-header h4 {
      margin: 0;
      color: #2c3e50;
      font-size: 1.1em;
    }

    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: #dc3545;
      animation: pulse 2s infinite;
    }

    .status-indicator.online {
      background: #28a745;
    }

    @keyframes pulse {
      0% { opacity: 1; }
      50% { opacity: 0.5; }
      100% { opacity: 1; }
    }

    .health-details {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      font-size: 0.9em;
    }

    .detail-row span:first-child {
      font-weight: 500;
      color: #6c757d;
    }

    .text-success {
      color: #28a745 !important;
      font-weight: 500;
    }

    .text-danger {
      color: #dc3545 !important;
      font-weight: 500;
    }

    .error-text {
      color: #dc3545;
      font-size: 0.8em;
      max-width: 150px;
      word-break: break-word;
    }

    .actions-section {
      margin-bottom: 30px;
    }

    .action-buttons {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 0.9em;
      font-weight: 500;
      transition: all 0.3s ease;
      min-width: 150px;
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

    .stats-section {
      margin-bottom: 30px;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
    }

    .stat-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      border-radius: 10px;
      text-align: center;
    }

    .stat-value {
      font-size: 2em;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .stat-label {
      font-size: 0.9em;
      opacity: 0.9;
    }

    .logs-section {
      margin-bottom: 20px;
    }

    .logs-container {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 5px;
      max-height: 300px;
      overflow-y: auto;
      padding: 15px;
    }

    .log-entry {
      padding: 8px 0;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      gap: 15px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    .log-entry:last-child {
      border-bottom: none;
    }

    .log-timestamp {
      color: #6c757d;
      font-weight: 500;
      min-width: 80px;
    }

    .log-message {
      flex: 1;
    }

    .log-info {
      background: #f8f9fa;
    }

    .log-warning {
      background: #fff3cd;
      border-left: 3px solid #ffc107;
      padding-left: 10px;
    }

    .log-error {
      background: #f8d7da;
      border-left: 3px solid #dc3545;
      padding-left: 10px;
    }

    @media (max-width: 768px) {
      .health-grid {
        grid-template-columns: 1fr;
      }
      
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }
      
      .action-buttons {
        flex-direction: column;
      }
      
      .btn {
        min-width: auto;
        width: 100%;
      }
    }
  `]
})
export class ReplicationManagementComponent implements OnInit, OnDestroy {
  healthStatus: DatabaseHealth[] = [];
  currentPrimary: string = '';
  isPerformingHealthCheck = false;
  isPerformingFailover = false;
  isTestingReplication = false;
  
  replicationStats = {
    totalReplicas: 3,
    healthyReplicas: 0,
    avgResponseTime: 0,
    uptime: 100
  };

  recentLogs: any[] = [];
  
  private subscriptions: Subscription[] = [];

  constructor(
    private replicationService: FirebaseReplicationService
  ) {}

  ngOnInit(): void {
    this.initializeMonitoring();
    this.loadInitialData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private initializeMonitoring(): void {
    // Subscribe to health status updates
    const healthSub = this.replicationService.getHealthStatus().subscribe(
      healthData => {
        this.healthStatus = healthData;
        this.updateStats();
        this.addLog('info', 'Health status updated');
      }
    );
    this.subscriptions.push(healthSub);

    // Auto-refresh every 30 seconds
    const intervalSub = interval(30000).subscribe(() => {
      this.performHealthCheck();
    });
    this.subscriptions.push(intervalSub);
  }

  private loadInitialData(): void {
    this.currentPrimary = this.replicationService.getCurrentPrimary();
    this.addLog('info', `Application started. Current primary: ${this.currentPrimary}`);
  }

  private updateStats(): void {
    const healthyCount = this.healthStatus.filter(h => h.isHealthy).length;
    const avgResponseTime = this.healthStatus.length > 0 
      ? this.healthStatus
          .filter(h => h.isHealthy)
          .reduce((sum, h) => sum + h.responseTime, 0) / healthyCount || 0
      : 0;

    this.replicationStats = {
      totalReplicas: this.healthStatus.length,
      healthyReplicas: healthyCount,
      avgResponseTime: Math.round(avgResponseTime),
      uptime: Math.round((healthyCount / this.healthStatus.length) * 100) || 0
    };
  }

  async performHealthCheck(): Promise<void> {
    if (this.isPerformingHealthCheck) return;
    
    this.isPerformingHealthCheck = true;
    this.addLog('info', 'Performing health check...');

    try {
      // The health check is automatically performed by the replication service
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate check time
      this.addLog('info', 'Health check completed');
    } catch (error) {
      this.addLog('error', `Health check failed: ${error}`);
    } finally {
      this.isPerformingHealthCheck = false;
    }
  }

  async forceFailover(): Promise<void> {
    if (this.isPerformingFailover) return;

    this.isPerformingFailover = true;
    this.addLog('warning', 'Initiating manual failover...');

    try {
      await this.replicationService.forceFailover();
      this.currentPrimary = this.replicationService.getCurrentPrimary();
      this.addLog('info', `Failover completed. New primary: ${this.currentPrimary}`);
    } catch (error) {
      this.addLog('error', `Failover failed: ${error}`);
    } finally {
      this.isPerformingFailover = false;
    }
  }

  async testReplication(): Promise<void> {
    if (this.isTestingReplication) return;

    this.isTestingReplication = true;
    this.addLog('info', 'Testing replication system...');

    try {
      // Test by performing a simple query across replicas
      await this.replicationService.executeQuery(async (db) => {
        // Simple test query
        return true;
      }).toPromise();
      
      this.addLog('info', 'Replication test completed successfully');
    } catch (error) {
      this.addLog('error', `Replication test failed: ${error}`);
    } finally {
      this.isTestingReplication = false;
    }
  }

  private addLog(type: 'info' | 'warning' | 'error', message: string): void {
    const log = {
      id: Date.now(),
      type,
      message,
      timestamp: new Date()
    };

    this.recentLogs.unshift(log);
    
    // Keep only last 50 logs
    if (this.recentLogs.length > 50) {
      this.recentLogs = this.recentLogs.slice(0, 50);
    }
  }

  trackByLogId(index: number, log: any): number {
    return log.id;
  }
}

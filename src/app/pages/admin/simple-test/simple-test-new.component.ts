import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DirectFirebaseService } from '../../../services/direct-firebase.service';
import { firebaseConfig } from '../../../../environments/firebase.config';

@Component({
  selector: 'app-simple-test',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatProgressBarModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>🔥 Firebase Connection Test</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <div class="status-grid">
            <div class="status-item">
              <strong>Config:</strong> {{ configStatus }}
            </div>
            <div class="status-item">
              <strong>Connection:</strong> {{ connectionStatus }}
            </div>
            <div class="status-item">
              <strong>Project ID:</strong> {{ projectId }}
            </div>
            <div class="status-item">
              <strong>Last Test:</strong> {{ lastTest }}
            </div>
          </div>
          
          <mat-progress-bar 
            *ngIf="loading" 
            mode="indeterminate">
          </mat-progress-bar>
          
          <div *ngIf="error" class="error-box">
            <strong>Error:</strong> {{ error }}
          </div>
        </mat-card-content>
        
        <mat-card-actions>
          <button 
            mat-raised-button 
            color="primary"
            (click)="testConfig()"
            [disabled]="loading">
            Test Config
          </button>
          
          <button 
            mat-raised-button 
            color="accent"
            (click)="testConnection()"
            [disabled]="loading">
            Test Connection
          </button>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 600px;
      margin: 20px auto;
      padding: 20px;
    }
    
    .status-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 20px 0;
    }
    
    .status-item {
      padding: 10px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }
    
    .error-box {
      background-color: #ffebee;
      color: #c62828;
      padding: 10px;
      border-radius: 4px;
      margin: 10px 0;
    }
    
    mat-progress-bar {
      margin: 20px 0;
    }
  `]
})
export class SimpleTestComponent {
  private directFirebaseService = inject(DirectFirebaseService);
  
  configStatus = 'Not tested';
  connectionStatus = 'Not tested';
  projectId = 'Unknown';
  lastTest = 'Never';
  loading = false;
  error = '';

  testConfig() {
    try {
      this.loading = true;
      this.error = '';
      
      console.log('Firebase config:', firebaseConfig);
      
      if (firebaseConfig && firebaseConfig.projectId) {
        this.configStatus = '✅ Valid';
        this.projectId = firebaseConfig.projectId;
        this.lastTest = new Date().toLocaleTimeString();
      } else {
        this.configStatus = '❌ Invalid';
        this.error = 'Firebase config is missing or invalid';
      }
    } catch (err: any) {
      this.configStatus = '❌ Error';
      this.error = err.message;
    } finally {
      this.loading = false;
    }
  }

  async testConnection() {
    this.loading = true;
    this.error = '';
    
    try {
      const isConnected = await this.directFirebaseService.testConnection();
      
      if (isConnected) {
        this.connectionStatus = '✅ Connected';
        this.lastTest = new Date().toLocaleTimeString();
      } else {
        this.connectionStatus = '❌ Failed';
        this.error = 'Connection test failed';
      }
    } catch (err: any) {
      this.connectionStatus = '❌ Error';
      this.error = err.message;
      console.error('Connection test error:', err);
    } finally {
      this.loading = false;
    }
  }
}

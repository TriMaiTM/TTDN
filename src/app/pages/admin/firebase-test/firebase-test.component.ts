import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-firebase-test',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatSnackBarModule,
    MatProgressBarModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>🔥 Firebase Connection Test</mat-card-title>
          <mat-card-subtitle>Kiểm tra kết nối Firebase</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="test-section">
            <p><strong>Status:</strong> {{ status }}</p>
            <p><strong>Firebase Project:</strong> ttdn-store</p>
            <p><strong>Last Test:</strong> {{ lastTest }}</p>
          </div>
          
          <mat-progress-bar 
            *ngIf="loading" 
            mode="indeterminate">
          </mat-progress-bar>
        </mat-card-content>
        
        <mat-card-actions>
          <button 
            mat-raised-button 
            color="primary"
            (click)="testFirebase()"
            [disabled]="loading">
            Test Firebase Connection
          </button>
          
          <button 
            mat-raised-button 
            color="accent"
            (click)="addTestData()"
            [disabled]="loading">
            Add Test Data
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
    
    .test-section {
      margin: 20px 0;
      padding: 20px;
      background-color: #f5f5f5;
      border-radius: 8px;
    }
    
    mat-progress-bar {
      margin: 20px 0;
    }
    
    mat-card-actions {
      padding: 16px;
      gap: 10px;
    }
  `]
})
export class FirebaseTestComponent {
  private firestore = inject(Firestore);
  private snackBar = inject(MatSnackBar);
  
  status = 'Ready to test';
  lastTest = 'Never';
  loading = false;

  async testFirebase() {
    this.loading = true;
    this.status = 'Testing...';
    
    try {
      // Test basic Firebase connection
      const testCollection = collection(this.firestore, 'test');
      this.status = '✅ Firebase connected successfully!';
      this.lastTest = new Date().toLocaleString();
      this.showMessage('Firebase connection successful!', 'success');
    } catch (error) {
      console.error('Firebase test error:', error);
      this.status = '❌ Firebase connection failed';
      this.showMessage('Firebase connection failed: ' + error, 'error');
    }
    
    this.loading = false;
  }

  async addTestData() {
    this.loading = true;
    this.status = 'Adding test data...';
    
    try {
      const testCollection = collection(this.firestore, 'test');
      const testDoc = {
        message: 'Hello Firebase!',
        timestamp: new Date(),
        type: 'connection_test'
      };
      
      const docRef = await addDoc(testCollection, testDoc);
      console.log('Document written with ID: ', docRef.id);
      
      this.status = '✅ Test data added successfully!';
      this.lastTest = new Date().toLocaleString();
      this.showMessage('Test data added to Firebase!', 'success');
    } catch (error) {
      console.error('Error adding document: ', error);
      this.status = '❌ Failed to add test data';
      this.showMessage('Error: ' + error, 'error');
    }
    
    this.loading = false;
  }

  private showMessage(message: string, type: 'success' | 'error') {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: [type === 'success' ? 'success-snackbar' : 'error-snackbar']
    });
  }
}

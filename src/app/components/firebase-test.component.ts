import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-firebase-connection-test',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatCardModule],
  template: `
    <mat-card style="margin: 20px; padding: 20px;">
      <h2>Firebase Connection Test</h2>
      
      <button mat-raised-button color="primary" (click)="testFirestore()">
        Test Firestore Connection
      </button>
      
      <div *ngIf="status" [ngStyle]="{color: status.includes('Error') ? 'red' : 'green', marginTop: '10px'}">
        {{ status }}
      </div>
    </mat-card>
  `
})
export class FirebaseConnectionTestComponent {
  private firestore = inject(Firestore);
  status = '';

  async testFirestore() {
    this.status = 'Testing connection...';
    
    try {
      const testCollection = collection(this.firestore, 'connection_test');
      await addDoc(testCollection, {
        message: 'Test connection',
        timestamp: new Date()
      });
      
      this.status = '✅ Firebase connection successful!';
    } catch (error: any) {
      console.error('Firebase connection error:', error);
      this.status = `❌ Error: ${error.message}`;
    }
  }
}

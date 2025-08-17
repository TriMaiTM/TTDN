import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-simple-test',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule
  ],
  template: `
    <div class="container">
      <mat-card>
        <mat-card-header>
          <mat-card-title>🔥 Simple Firebase Test</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <p>Status: {{ status }}</p>
          <p>Config Test: {{ configTest }}</p>
          <p>Error: {{ error }}</p>
        </mat-card-content>
        
        <mat-card-actions>
          <button mat-raised-button color="primary" (click)="testConfig()">
            Test Config
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
  `]
})
export class SimpleTestComponent {
  status = 'Ready';
  configTest = 'Not tested';
  error = 'None';

  testConfig() {
    try {
      // Test import config
    import('../../../../environments/firebase.config').then(config => {
        console.log('Firebase config:', config.firebaseConfig);
        this.configTest = '✅ Config loaded successfully';
        this.status = '✅ Ready to test Firebase';
    }).catch(err => {
        console.error('Config error:', err);
        this.error = 'Config import failed: ' + err.message;
        this.configTest = '❌ Config failed';
    });
    } catch (err: any) {
      this.error = err.message;
      this.configTest = '❌ Config error';
    }
  }
}

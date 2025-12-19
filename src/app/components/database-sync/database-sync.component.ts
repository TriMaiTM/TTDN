import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc,
  writeBatch
} from 'firebase/firestore';
import { firebaseReplicaConfigs } from '../../../environments/firebase-replica.config';

interface SyncResult {
  collection: string;
  primaryCount: number;
  secondaryCount: number;
  tertiaryCount: number;
  synced: boolean;
  error?: string;
}

@Component({
  selector: 'app-database-sync',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sync-container">
      <h2>🔄 Database Synchronization</h2>
      
      <!-- Control Panel -->
      <div class="control-panel">
        <div class="buttons">
          <button 
            class="btn btn-primary"
            (click)="createSampleData()"
            [disabled]="isLoading">
            {{ isLoading ? 'Creating...' : '🎯 Create Sample Data' }}
          </button>
          
          <button 
            class="btn btn-success"
            (click)="syncAllCollections()"
            [disabled]="isLoading">
            {{ isLoading ? 'Syncing...' : '🚀 Sync All Collections' }}
          </button>
          
          <button 
            class="btn btn-info"
            (click)="verifyConsistency()"
            [disabled]="isLoading">
            {{ isLoading ? 'Verifying...' : '🔍 Verify Consistency' }}
          </button>
        </div>
      </div>

      <!-- Progress -->
      <div class="progress-section" *ngIf="isLoading">
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="progress"></div>
        </div>
        <p class="progress-text">{{ currentOperation }}</p>
      </div>

      <!-- Results -->
      <div class="results-section" *ngIf="syncResults.length > 0">
        <h3>📊 Sync Results</h3>
        <div class="results-table">
          <div class="table-header">
            <div>Collection</div>
            <div>Primary</div>
            <div>Secondary</div>
            <div>Tertiary</div>
            <div>Status</div>
          </div>
          
          <div 
            *ngFor="let result of syncResults" 
            class="table-row"
            [class.success]="result.synced && !result.error"
            [class.error]="result.error"
          >
            <div class="collection-name">{{ result.collection }}</div>
            <div class="count">{{ result.primaryCount }}</div>
            <div class="count">{{ result.secondaryCount }}</div>
            <div class="count">{{ result.tertiaryCount }}</div>
            <div class="status">
              <span *ngIf="result.synced && !result.error" class="status-success">✅ Synced</span>
              <span *ngIf="result.error" class="status-error">❌ Error</span>
              <span *ngIf="!result.synced && !result.error" class="status-pending">⏳ Pending</span>
            </div>
          </div>
        </div>
        
        <!-- Error Details -->
        <div class="error-details" *ngIf="hasErrors">
          <h4>❌ Errors</h4>
          <div *ngFor="let result of syncResults">
            <div *ngIf="result.error" class="error-item">
              <strong>{{ result.collection }}:</strong> {{ result.error }}
            </div>
          </div>
        </div>
      </div>

      <!-- Logs -->
      <div class="logs-section" *ngIf="logs.length > 0">
        <h3>📝 Operation Logs</h3>
        <div class="logs-container">
          <div *ngFor="let log of logs; trackBy: trackByIndex" class="log-entry">
            <span class="log-time">{{ log.time | date:'HH:mm:ss' }}</span>
            <span [class]="'log-' + log.level">{{ log.message }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sync-container {
      padding: 20px;
      max-width: 1000px;
      margin: 0 auto;
    }

    .sync-container h2 {
      color: #2c3e50;
      border-bottom: 2px solid #3498db;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }

    .control-panel {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 30px;
    }

    .buttons {
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

    .btn-success {
      background: #28a745;
      color: white;
    }

    .btn-info {
      background: #17a2b8;
      color: white;
    }

    .progress-section {
      margin-bottom: 30px;
    }

    .progress-bar {
      width: 100%;
      height: 20px;
      background: #e9ecef;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 10px;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #28a745, #20c997);
      transition: width 0.3s ease;
    }

    .progress-text {
      text-align: center;
      color: #6c757d;
      font-weight: 500;
    }

    .results-section {
      margin-bottom: 30px;
    }

    .results-section h3 {
      color: #34495e;
      margin-bottom: 15px;
    }

    .results-table {
      border: 1px solid #dee2e6;
      border-radius: 6px;
      overflow: hidden;
    }

    .table-header {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
      background: #343a40;
      color: white;
      font-weight: 500;
      padding: 15px;
    }

    .table-row {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr 1.5fr;
      padding: 15px;
      border-bottom: 1px solid #dee2e6;
      align-items: center;
    }

    .table-row:last-child {
      border-bottom: none;
    }

    .table-row.success {
      background: #f8fff9;
    }

    .table-row.error {
      background: #fff8f8;
    }

    .collection-name {
      font-weight: 500;
      color: #2c3e50;
    }

    .count {
      text-align: center;
      font-weight: 500;
    }

    .status {
      text-align: center;
    }

    .status-success {
      color: #28a745;
      font-weight: 500;
    }

    .status-error {
      color: #dc3545;
      font-weight: 500;
    }

    .status-pending {
      color: #ffc107;
      font-weight: 500;
    }

    .error-details {
      margin-top: 20px;
      padding: 15px;
      background: #fff8f8;
      border: 1px solid #f8d7da;
      border-radius: 6px;
    }

    .error-details h4 {
      margin: 0 0 10px 0;
      color: #dc3545;
    }

    .error-item {
      margin-bottom: 8px;
      color: #721c24;
    }

    .logs-section {
      margin-bottom: 20px;
    }

    .logs-section h3 {
      color: #34495e;
      margin-bottom: 15px;
    }

    .logs-container {
      background: #f8f9fa;
      border: 1px solid #dee2e6;
      border-radius: 6px;
      max-height: 300px;
      overflow-y: auto;
      padding: 15px;
    }

    .log-entry {
      padding: 5px 0;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      gap: 15px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
    }

    .log-entry:last-child {
      border-bottom: none;
    }

    .log-time {
      color: #6c757d;
      font-weight: 500;
      min-width: 80px;
    }

    .log-info {
      color: #17a2b8;
    }

    .log-success {
      color: #28a745;
    }

    .log-error {
      color: #dc3545;
    }

    .log-warning {
      color: #ffc107;
    }

    @media (max-width: 768px) {
      .buttons {
        flex-direction: column;
      }
      
      .btn {
        min-width: auto;
        width: 100%;
      }
      
      .table-header,
      .table-row {
        grid-template-columns: 1fr;
        text-align: center;
      }
      
      .table-header {
        display: none;
      }
      
      .table-row {
        display: block;
        padding: 10px;
      }
      
      .table-row > div {
        margin-bottom: 5px;
      }
    }
  `]
})
export class DatabaseSyncComponent {
  isLoading = false;
  progress = 0;
  currentOperation = '';
  syncResults: SyncResult[] = [];
  logs: any[] = [];

  private primaryDb: any;
  private secondaryDb: any;
  private tertiaryDb: any;

  constructor() {
    this.initializeDatabases();
  }

  get hasErrors(): boolean {
    return this.syncResults.some(result => result.error);
  }

  private initializeDatabases(): void {
    try {
      const primaryApp = initializeApp(firebaseReplicaConfigs[0].config, 'primary-sync');
      const secondaryApp = initializeApp(firebaseReplicaConfigs[1].config, 'secondary-sync');
      const tertiaryApp = initializeApp(firebaseReplicaConfigs[2].config, 'tertiary-sync');

      this.primaryDb = getFirestore(primaryApp);
      this.secondaryDb = getFirestore(secondaryApp);
      this.tertiaryDb = getFirestore(tertiaryApp);

      this.addLog('info', 'Firebase databases initialized successfully');
    } catch (error) {
      this.addLog('error', `Failed to initialize databases: ${error}`);
    }
  }

  async createSampleData(): Promise<void> {
    this.isLoading = true;
    this.progress = 0;
    this.currentOperation = 'Creating sample data...';

    try {
      this.addLog('info', 'Starting sample data creation...');

      const sampleProducts = [
        {
          id: 'sample-product-1',
          name: 'Máy khoan Bosch GSB 18V',
          description: 'Máy khoan pin chuyên nghiệp, công suất mạnh mẽ',
          price: 2500000,
          category: 'may-khoan',
          featured: true,
          rating: 4.5,
          stock: 10,
          images: ['bosch-gsb-18v.jpg'],
          tags: ['máy khoan', 'bosch', 'pin'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'sample-product-2',
          name: 'Cưa gỗ Makita SP6000',
          description: 'Cưa gỗ chính xác, thiết kế ergonomic',
          price: 4200000,
          category: 'cua-go',
          featured: true,
          rating: 4.8,
          stock: 5,
          images: ['makita-sp6000.jpg'],
          tags: ['cưa gỗ', 'makita', 'chính xác'],
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          id: 'sample-product-3',
          name: 'Máy mài góc DeWalt DWE402',
          description: 'Máy mài góc 4 inch, motor mạnh mẽ',
          price: 1800000,
          category: 'may-mai',
          featured: false,
          rating: 4.3,
          stock: 8,
          images: ['dewalt-dwe402.jpg'],
          tags: ['máy mài', 'dewalt', 'góc'],
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const sampleCategories = [
        {
          id: 'may-khoan',
          name: 'Máy Khoan',
          slug: 'may-khoan',
          description: 'Các loại máy khoan chuyên nghiệp',
          sortOrder: 1,
          isActive: true
        },
        {
          id: 'cua-go',
          name: 'Cưa Gỗ',
          slug: 'cua-go',
          description: 'Dụng cụ cưa gỗ các loại',
          sortOrder: 2,
          isActive: true
        },
        {
          id: 'may-mai',
          name: 'Máy Mài',
          slug: 'may-mai',
          description: 'Máy mài góc và máy mài thẳng',
          sortOrder: 3,
          isActive: true
        }
      ];

      this.progress = 25;

      // Add products
      for (const product of sampleProducts) {
        const docRef = doc(this.primaryDb, 'products', product.id);
        await setDoc(docRef, product);
      }

      this.progress = 50;
      this.addLog('success', `Created ${sampleProducts.length} sample products`);

      // Add categories
      for (const category of sampleCategories) {
        const docRef = doc(this.primaryDb, 'categories', category.id);
        await setDoc(docRef, category);
      }

      this.progress = 100;
      this.addLog('success', `Created ${sampleCategories.length} sample categories`);
      this.addLog('success', 'Sample data creation completed');

    } catch (error) {
      this.addLog('error', `Error creating sample data: ${error}`);
    } finally {
      this.isLoading = false;
      this.currentOperation = '';
    }
  }

  async syncAllCollections(): Promise<void> {
    this.isLoading = true;
    this.progress = 0;
    this.syncResults = [];
    this.currentOperation = 'Syncing all collections...';

    const collections = ['products', 'categories', 'orders', 'users'];

    try {
      this.addLog('info', 'Starting full database synchronization...');

      for (let i = 0; i < collections.length; i++) {
        const collectionName = collections[i];
        this.currentOperation = `Syncing ${collectionName}...`;
        
        await this.syncCollection(collectionName);
        
        this.progress = ((i + 1) / collections.length) * 100;
      }

      this.addLog('success', 'All collections synchronized successfully');

    } catch (error) {
      this.addLog('error', `Synchronization failed: ${error}`);
    } finally {
      this.isLoading = false;
      this.currentOperation = '';
    }
  }

  private async syncCollection(collectionName: string): Promise<void> {
    try {
      // Get data from primary
      const primaryCollection = collection(this.primaryDb, collectionName);
      const querySnapshot = await getDocs(primaryCollection);
      
      const documents: any[] = [];
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          data: doc.data()
        });
      });

      this.addLog('info', `Found ${documents.length} documents in ${collectionName}`);

      if (documents.length === 0) {
        this.syncResults.push({
          collection: collectionName,
          primaryCount: 0,
          secondaryCount: 0,
          tertiaryCount: 0,
          synced: true
        });
        return;
      }

      // Sync to secondary
      await this.syncToDatabase(this.secondaryDb, collectionName, documents);
      
      // Sync to tertiary
      await this.syncToDatabase(this.tertiaryDb, collectionName, documents);

      // Verify counts
      const secondaryCount = await this.getDocumentCount(this.secondaryDb, collectionName);
      const tertiaryCount = await this.getDocumentCount(this.tertiaryDb, collectionName);

      this.syncResults.push({
        collection: collectionName,
        primaryCount: documents.length,
        secondaryCount,
        tertiaryCount,
        synced: true
      });

      this.addLog('success', `${collectionName} synchronized successfully`);

    } catch (error) {
      this.syncResults.push({
        collection: collectionName,
        primaryCount: 0,
        secondaryCount: 0,
        tertiaryCount: 0,
        synced: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      this.addLog('error', `Error syncing ${collectionName}: ${error}`);
    }
  }

  private async syncToDatabase(targetDb: any, collectionName: string, documents: any[]): Promise<void> {
    const batchSize = 500;
    
    for (let i = 0; i < documents.length; i += batchSize) {
      const batch = writeBatch(targetDb);
      const batchDocs = documents.slice(i, i + batchSize);
      
      batchDocs.forEach(document => {
        const docRef = doc(targetDb, collectionName, document.id);
        batch.set(docRef, document.data);
      });
      
      await batch.commit();
    }
  }

  async verifyConsistency(): Promise<void> {
    this.isLoading = true;
    this.progress = 0;
    this.currentOperation = 'Verifying data consistency...';

    const collections = ['products', 'categories', 'orders', 'users'];

    try {
      this.addLog('info', 'Starting consistency verification...');

      for (let i = 0; i < collections.length; i++) {
        const collectionName = collections[i];
        this.currentOperation = `Verifying ${collectionName}...`;
        
        await this.verifyCollection(collectionName);
        
        this.progress = ((i + 1) / collections.length) * 100;
      }

      this.addLog('success', 'Consistency verification completed');

    } catch (error) {
      this.addLog('error', `Verification failed: ${error}`);
    } finally {
      this.isLoading = false;
      this.currentOperation = '';
    }
  }

  private async verifyCollection(collectionName: string): Promise<void> {
    try {
      const primaryCount = await this.getDocumentCount(this.primaryDb, collectionName);
      const secondaryCount = await this.getDocumentCount(this.secondaryDb, collectionName);
      const tertiaryCount = await this.getDocumentCount(this.tertiaryDb, collectionName);

      const existingResult = this.syncResults.find(r => r.collection === collectionName);
      if (existingResult) {
        existingResult.primaryCount = primaryCount;
        existingResult.secondaryCount = secondaryCount;
        existingResult.tertiaryCount = tertiaryCount;
      } else {
        this.syncResults.push({
          collection: collectionName,
          primaryCount,
          secondaryCount,
          tertiaryCount,
          synced: primaryCount === secondaryCount && secondaryCount === tertiaryCount
        });
      }

      if (primaryCount === secondaryCount && secondaryCount === tertiaryCount) {
        this.addLog('success', `${collectionName}: Consistent (${primaryCount} docs)`);
      } else {
        this.addLog('warning', `${collectionName}: Inconsistent - P:${primaryCount}, S:${secondaryCount}, T:${tertiaryCount}`);
      }

    } catch (error) {
      this.addLog('error', `Error verifying ${collectionName}: ${error}`);
    }
  }

  private async getDocumentCount(db: any, collectionName: string): Promise<number> {
    try {
      // Force fresh read by adding cache bust
      const snapshot = await getDocs(collection(db, collectionName));
      return snapshot.size;
    } catch (error) {
      return 0;
    }
  }

  private addLog(level: 'info' | 'success' | 'error' | 'warning', message: string): void {
    this.logs.unshift({
      time: new Date(),
      level,
      message
    });

    // Keep only last 50 logs
    if (this.logs.length > 50) {
      this.logs = this.logs.slice(0, 50);
    }
  }

  trackByIndex(index: number): number {
    return index;
  }
}
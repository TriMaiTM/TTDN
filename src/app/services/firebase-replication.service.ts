import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, from, throwError, timer, of } from 'rxjs';
import { map, catchError, switchMap, retry, timeout } from 'rxjs/operators';
import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore,
  collection, 
  getDocs,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  connectFirestoreEmulator
} from 'firebase/firestore';
import { 
  FirebaseReplicaConfig, 
  firebaseReplicaConfigs, 
  replicationConfig 
} from '../../environments/firebase-replica.config';

export interface DatabaseHealth {
  name: string;
  isHealthy: boolean;
  responseTime: number;
  lastCheck: Date;
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FirebaseReplicationService {
  private replicas: Map<string, { app: FirebaseApp; db: Firestore; config: FirebaseReplicaConfig }> = new Map();
  private currentPrimary: string = 'primary';
  private healthStatus$ = new BehaviorSubject<DatabaseHealth[]>([]);
  private healthCheckTimer: any;

  constructor() {
    this.initializeReplicas();
    this.startHealthChecking();
  }

  /**
   * Initialize all Firebase replicas
   */
  private initializeReplicas(): void {
    firebaseReplicaConfigs.forEach(config => {
      try {
        const app = initializeApp(config.config, config.name);
        const db = getFirestore(app);
        
        this.replicas.set(config.name, {
          app,
          db,
          config
        });

        console.log(`Initialized Firebase replica: ${config.name}`);
      } catch (error) {
        console.error(`Failed to initialize Firebase replica ${config.name}:`, error);
      }
    });
  }

  /**
   * Get the current primary database
   */
  getPrimaryDatabase(): Firestore {
    const primary = this.replicas.get(this.currentPrimary);
    if (!primary) {
      throw new Error(`Primary database ${this.currentPrimary} not available`);
    }
    return primary.db;
  }

  /**
   * Get a healthy database instance (with fallback)
   */
  getHealthyDatabase(): Observable<Firestore> {
    return this.getCurrentHealthyReplica().pipe(
      map(replica => {
        if (!replica) {
          throw new Error('No healthy database replica available');
        }
        return replica.db;
      })
    );
  }

  /**
   * Get current healthy replica
   */
  private getCurrentHealthyReplica(): Observable<{ app: FirebaseApp; db: Firestore; config: FirebaseReplicaConfig } | null> {
    return from(this.findHealthyReplica());
  }

  /**
   * Find the first healthy replica based on priority
   */
  private async findHealthyReplica(): Promise<{ app: FirebaseApp; db: Firestore; config: FirebaseReplicaConfig } | null> {
    const sortedConfigs = firebaseReplicaConfigs.sort((a, b) => a.priority - b.priority);
    
    for (const config of sortedConfigs) {
      const replica = this.replicas.get(config.name);
      if (replica && await this.checkReplicaHealth(config.name)) {
        this.currentPrimary = config.name;
        return replica;
      }
    }
    
    return null;
  }

  /**
   * Check health of a specific replica
   */
  private async checkReplicaHealth(replicaName: string): Promise<boolean> {
    const replica = this.replicas.get(replicaName);
    if (!replica) return false;

    try {
      const startTime = Date.now();
      
      // Try a simple read operation to test connectivity
      const testCollection = collection(replica.db, 'products');
      const snapshot = await Promise.race([
        getDocs(testCollection),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), replicationConfig.timeoutMs)
        )
      ]) as any;

      const responseTime = Date.now() - startTime;
      
      // Update health status
      replica.config.isHealthy = true;
      replica.config.lastCheck = new Date();
      replica.config.responseTime = responseTime;

      this.updateHealthStatus(replicaName, {
        name: replicaName,
        isHealthy: true,
        responseTime,
        lastCheck: new Date()
      });

      return true;
    } catch (error) {
      console.error(`Health check failed for ${replicaName}:`, error);
      
      // Update health status
      replica.config.isHealthy = false;
      replica.config.lastCheck = new Date();

      this.updateHealthStatus(replicaName, {
        name: replicaName,
        isHealthy: false,
        responseTime: 0,
        lastCheck: new Date(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return false;
    }
  }

  /**
   * Update health status for monitoring
   */
  private updateHealthStatus(replicaName: string, health: DatabaseHealth): void {
    const currentHealth = this.healthStatus$.value;
    const index = currentHealth.findIndex(h => h.name === replicaName);
    
    if (index >= 0) {
      currentHealth[index] = health;
    } else {
      currentHealth.push(health);
    }
    
    this.healthStatus$.next([...currentHealth]);
  }

  /**
   * Start periodic health checking
   */
  private startHealthChecking(): void {
    this.healthCheckTimer = setInterval(() => {
      this.performHealthCheck();
    }, replicationConfig.healthCheckInterval);

    // Initial health check
    this.performHealthCheck();
  }

  /**
   * Perform health check on all replicas
   */
  private async performHealthCheck(): Promise<void> {
    const healthPromises = Array.from(this.replicas.keys()).map(replicaName =>
      this.checkReplicaHealth(replicaName)
    );

    await Promise.allSettled(healthPromises);
  }

  /**
   * Get health status observable
   */
  getHealthStatus(): Observable<DatabaseHealth[]> {
    return this.healthStatus$.asObservable();
  }

  /**
   * Execute query with automatic failover
   */
  executeQuery<T>(queryFn: (db: Firestore) => Promise<T>): Observable<T> {
    return this.getHealthyDatabase().pipe(
      switchMap(db => from(queryFn(db))),
      timeout(replicationConfig.timeoutMs),
      retry(replicationConfig.maxRetries),
      catchError(error => {
        console.error('Query execution failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Sync data across replicas (for write operations)
   * FIXED: Only write to primary, then replicate the result
   */
  async syncDataAcrossReplicas<T>(
    operation: (db: Firestore) => Promise<T>
  ): Promise<T> {
    const healthyReplicas = Array.from(this.replicas.entries())
      .filter(([name, _]) => 
        firebaseReplicaConfigs.find(config => config.name === name)?.isHealthy
      );

    if (healthyReplicas.length === 0) {
      throw new Error('No healthy replicas available for write operation');
    }

    // Execute on primary first
    const primaryReplica = healthyReplicas.find(([name, _]) => name === this.currentPrimary);
    if (!primaryReplica) {
      throw new Error('Primary replica not healthy');
    }

    const result = await operation(primaryReplica[1].db);

    // Don't replicate write operations - they should replicate data, not operations
    console.log(`✅ Write operation completed on ${this.currentPrimary}`);
    console.log(`ℹ️ Data replication will be handled by manual sync`);

    return result;
  }

  /**
   * NEW: Replicate specific document to other replicas
   */
  async replicateDocument(
    collectionName: string, 
    documentId: string, 
    documentData: any
  ): Promise<void> {
    const healthyReplicas = Array.from(this.replicas.entries())
      .filter(([name, _]) => 
        firebaseReplicaConfigs.find(config => config.name === name)?.isHealthy &&
        name !== this.currentPrimary
      );

    const replicationPromises = healthyReplicas.map(async ([name, replica]) => {
      try {
        const docRef = doc(replica.db, collectionName, documentId);
        await setDoc(docRef, documentData);
        console.log(`✅ Document replicated to ${name}`);
      } catch (error) {
        console.error(`❌ Replication failed for ${name}:`, error);
      }
    });

    await Promise.allSettled(replicationPromises);
  }

  /**
   * Delete document from other replicas
   */
  async deleteFromReplicas(collectionName: string, documentId: string): Promise<void> {
    const healthyReplicas = Array.from(this.replicas.entries())
      .filter(([name, _]) => 
        firebaseReplicaConfigs.find(config => config.name === name)?.isHealthy &&
        name !== this.currentPrimary
      );

    const deletionPromises = healthyReplicas.map(async ([name, replica]) => {
      try {
        const docRef = doc(replica.db, collectionName, documentId);
        await deleteDoc(docRef);
        console.log(`✅ Document deleted from ${name}`);
      } catch (error) {
        console.error(`❌ Deletion failed for ${name}:`, error);
      }
    });

    await Promise.allSettled(deletionPromises);
  }

  /**
   * Get database configurations
   */
  getDatabaseConfigs() {
    return firebaseReplicaConfigs;
  }

  /**
   * Get collection count from specific database
   */
  async getCollectionCount(databaseName: string, collectionName: string): Promise<number> {
    try {
      const replica = this.replicas.get(databaseName);
      if (!replica) {
        console.warn(`Database ${databaseName} not found`);
        return 0;
      }

      const snapshot = await getDocs(collection(replica.db, collectionName));
      return snapshot.size;
    } catch (error) {
      console.error(`Error getting count from ${databaseName}:`, error);
      return 0;
    }
  }

  /**
   * Force failover to next healthy replica
   */
  async forceFailover(): Promise<void> {
    const currentPriority = firebaseReplicaConfigs.find(c => c.name === this.currentPrimary)?.priority || 1;
    
    const nextReplica = firebaseReplicaConfigs
      .filter(c => c.priority > currentPriority && c.isHealthy)
      .sort((a, b) => a.priority - b.priority)[0];

    if (nextReplica) {
      this.currentPrimary = nextReplica.name;
      console.log(`Failed over to replica: ${nextReplica.name}`);
    } else {
      throw new Error('No healthy replica available for failover');
    }
  }

  /**
   * Get current primary replica name
   */
  getCurrentPrimary(): string {
    return this.currentPrimary;
  }

  /**
   * Cleanup resources
   */
  ngOnDestroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }
  }
}

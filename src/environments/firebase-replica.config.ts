// Firebase configurations for Database Replication
export interface FirebaseReplicaConfig {
  name: string;
  config: any;
  priority: number; // 1 = Primary, 2 = Secondary, 3 = Tertiary
  isHealthy: boolean;
  lastCheck?: Date;
  responseTime?: number;
}

export const firebaseReplicaConfigs: FirebaseReplicaConfig[] = [
  {
    name: 'primary',
    priority: 1,
    isHealthy: true,
    config: {
      apiKey: "AIzaSyCxBU_2x0yEUJrtCdYCBQrttGE3uIk7wK0",
      authDomain: "ttdn-store.firebaseapp.com",
      projectId: "ttdn-store",
      storageBucket: "ttdn-store.firebasestorage.app",
      messagingSenderId: "356198567995",
      appId: "1:356198567995:web:d9608b2e1bf426bf15cc1e",
      measurementId: "G-LNNHFSDH5C"
    }
  },
  {
    name: 'secondary',
    priority: 2,
    isHealthy: true,
    config: {
      apiKey: "AIzaSyDwCF98me7F8m_hK4WhGky7VdXTuaIVQJE",
      authDomain: "ttdn-store-backup.firebaseapp.com",
      projectId: "ttdn-store-backup",
      storageBucket: "ttdn-store-backup.firebasestorage.app",
      messagingSenderId: "865093629255",
      appId: "1:865093629255:web:4c337cf5c82ab972914862",
      measurementId: "G-P6X4N6HSE7"
    }
  },
  {
    name: 'tertiary',
    priority: 3,
    isHealthy: true,
    config: {
      apiKey: "AIzaSyCxaPzeawFMKKbfWlfKRZOHYt41oypFF4g",
      authDomain: "ttdn-store-backup2.firebaseapp.com",
      projectId: "ttdn-store-backup2",
      storageBucket: "ttdn-store-backup2.firebasestorage.app",
      messagingSenderId: "858795277287",
      appId: "1:858795277287:web:3607cc00094bec680a9b42",
      measurementId: "G-MRDQFEVCS7"
    }
  }
];

// Health check configuration
export const replicationConfig = {
  healthCheckInterval: 30000, // 30 seconds
  maxRetries: 3,
  timeoutMs: 5000,
  fallbackToSecondary: true,
  syncInterval: 60000, // 1 minute for data sync
};
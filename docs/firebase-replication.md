# 🗄️ Firebase Database Replication System

## Tổng quan

Hệ thống Database Replication được thiết kế để đảm bảo high availability và fault tolerance cho ứng dụng TTDN Store. Hệ thống tự động chuyển đổi giữa các database replicas khi có sự cố.

## Kiến trúc

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Primary DB    │    │  Secondary DB   │    │  Tertiary DB    │
│  ttdn-store     │◄──►│ttdn-store-backup│◄──►│ttdn-store-backup2│
└─────────────────┘    └─────────────────┘    └─────────────────┘
         ▲                       ▲                       ▲
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │ Replication     │
                    │ Service         │
                    │                 │
                    │ - Health Check  │
                    │ - Failover      │
                    │ - Data Sync     │
                    └─────────────────┘
```

## Thành phần chính

### 1. Firebase Replica Configuration
- **File**: `src/environments/firebase-replica.config.ts`
- **Chức năng**: Quản lý thông tin cấu hình của các Firebase projects
- **Cấu trúc**:
  ```typescript
  interface FirebaseReplicaConfig {
    name: string;           // Tên replica (primary, secondary, tertiary)
    config: any;           // Firebase config object
    priority: number;      // Độ ưu tiên (1 = cao nhất)
    isHealthy: boolean;    // Trạng thái health
    lastCheck?: Date;      // Lần kiểm tra cuối
    responseTime?: number; // Thời gian phản hồi
  }
  ```

### 2. Firebase Replication Service
- **File**: `src/app/services/firebase-replication.service.ts`
- **Chức năng**: 
  - Quản lý kết nối đến multiple Firebase projects
  - Health checking và monitoring
  - Automatic failover
  - Cross-replica data synchronization

### 3. Replicated Product Service
- **File**: `src/app/services/replicated-product.service.ts`
- **Chức năng**: 
  - Wrapper cho DirectFirebaseProductService
  - Sử dụng replication system cho mọi database operations
  - Đảm bảo data consistency across replicas

### 4. Replication Management Component
- **File**: `src/app/components/replication-management/replication-management.component.ts`
- **Chức năng**: Admin dashboard để monitor và manage replication system

## Cài đặt và Triển khai

### Bước 1: Tạo Firebase Projects

Tạo 3 Firebase projects:
1. **ttdn-store** (Primary)
2. **ttdn-store-backup** (Secondary) 
3. **ttdn-store-backup2** (Tertiary)

### Bước 2: Cập nhật Cấu hình

Cập nhật file `firebase-replica.config.ts` với config thực tế:

```typescript
// Thay thế YOUR_BACKUP_* với thông tin thực tế
{
  name: 'secondary',
  priority: 2,
  isHealthy: true,
  config: {
    apiKey: "YOUR_BACKUP_API_KEY",
    authDomain: "ttdn-store-backup.firebaseapp.com",
    projectId: "ttdn-store-backup",
    // ... other config
  }
}
```

### Bước 3: Sync Database Structure

Đảm bảo tất cả replicas có cùng database structure:
- Collections: `products`, `categories`, `orders`, etc.
- Indexes: Tạo same indexes trên tất cả replicas
- Security Rules: Apply same rules cho tất cả projects

### Bước 4: Cập nhật Service Injection

Thay thế `DirectFirebaseProductService` bằng `ReplicatedProductService` trong components:

```typescript
// Trước
constructor(private productService: DirectFirebaseProductService) {}

// Sau  
constructor(private productService: ReplicatedProductService) {}
```

## Cách thức hoạt động

### Health Checking
- Tự động kiểm tra health mỗi 30 giây
- Test bằng cách thực hiện simple read operation
- Timeout: 5 seconds
- Retry: 3 lần

### Failover Process
1. **Automatic**: Khi primary unhealthy, tự động chuyển sang replica có priority cao nhất
2. **Manual**: Admin có thể force failover qua management dashboard

### Data Synchronization
- **Read Operations**: Luôn từ healthy replica có priority cao nhất
- **Write Operations**: 
  - Primary replica trước
  - Async sync sang other replicas
  - Rollback nếu primary write fails

### Priority System
```
Priority 1: Primary (ttdn-store)
Priority 2: Secondary (ttdn-store-backup)  
Priority 3: Tertiary (ttdn-store-backup2)
```

## Monitoring và Management

### Admin Dashboard
Truy cập: `/admin/replication-management`

**Features:**
- 📊 Real-time health status
- 📈 Performance metrics  
- 🔄 Manual health check
- 🔀 Force failover
- 🧪 Test replication
- 📝 Activity logs

### Key Metrics
- **Response Time**: Thời gian phản hồi của mỗi replica
- **Uptime**: Tỷ lệ thời gian healthy
- **Failover Count**: Số lần failover
- **Sync Status**: Trạng thái đồng bộ data

## Best Practices

### Development
1. **Testing**: Luôn test với all replicas healthy và unhealthy scenarios
2. **Error Handling**: Implement proper error handling cho network issues
3. **Logging**: Log all failover events và health changes

### Production
1. **Monitoring**: Set up alerts cho replica health issues
2. **Backup**: Regular backup của all replica databases
3. **Security**: Ensure all replicas có same security rules
4. **Performance**: Monitor response times và optimize queries

### Data Consistency
1. **Write Operations**: Always sync across replicas
2. **Read Operations**: Use nearest healthy replica
3. **Conflict Resolution**: Implement strategies cho data conflicts

## Troubleshooting

### Common Issues

**1. Replica Connection Failed**
```
Error: Failed to initialize Firebase replica
Solution: Check Firebase config và network connectivity
```

**2. Sync Failure**
```
Error: Sync failed for replica
Solution: Check write permissions và data validation
```

**3. All Replicas Unhealthy**
```
Error: No healthy database replica available
Solution: Check network, Firebase status, và config
```

### Debug Mode
Enable debug mode trong development:
```typescript
const replicationConfig = {
  ...existing config,
  debugMode: true, // Enable detailed logging
  healthCheckInterval: 10000 // More frequent checks
};
```

## Migration Guide

### Từ DirectFirebaseProductService sang ReplicatedProductService

1. **Import new service**:
```typescript
import { ReplicatedProductService } from '../services/replicated-product.service';
```

2. **Update constructor**:
```typescript
constructor(private productService: ReplicatedProductService) {}
```

3. **Methods remain same**: Tất cả method signatures giống nhau
4. **Test thoroughly**: Đảm bảo tất cả features hoạt động bình thường

## Performance Considerations

### Read Performance
- Automatic routing đến fastest healthy replica
- Caching có thể implement ở component level
- Consider geographic distribution của replicas

### Write Performance  
- Primary write + async replication = minimal latency
- Batch operations để reduce số lần sync
- Monitor sync lag giữa replicas

### Network Optimization
- Use connection pooling
- Implement retry strategies
- Consider CDN cho static assets

## Security

### Authentication
- Tất cả replicas phải use same authentication
- Service accounts cần access to all projects
- Regular rotation của API keys

### Authorization
- Same Firestore Security Rules across replicas
- Test rules với different user scenarios
- Monitor unauthorized access attempts

### Data Privacy
- Encrypt sensitive data before storing
- Audit logs cho data access
- Comply với GDPR/privacy regulations

## Roadmap

### Phase 1 ✅
- [x] Basic replication setup
- [x] Health checking
- [x] Manual failover
- [x] Admin dashboard

### Phase 2 🔄
- [ ] Geographic distribution
- [ ] Advanced monitoring
- [ ] Performance optimization
- [ ] Automated testing

### Phase 3 📅
- [ ] Multi-region deployment
- [ ] Advanced conflict resolution
- [ ] Machine learning for predictive failover
- [ ] Integration with external monitoring tools

## Liên hệ và Hỗ trợ

Để biết thêm thông tin hoặc báo cáo issues:
- 📧 Email: support@ttdn-store.com
- 📞 Phone: +84-xxx-xxx-xxx
- 🐛 GitHub Issues: [Repository Issues](https://github.com/TriMaiTM/TTDN/issues)

---

**Lưu ý**: Hệ thống replication này được thiết kế cho high availability. Trong production, cần monitor thường xuyên và có backup plan.
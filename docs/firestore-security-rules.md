# 🔒 Firestore Security Rules cho Database Replication

## Rules cho tất cả Firebase Projects (Primary + Backup)

Áp dụng rules này cho cả 3 projects:
- ttdn-store (Primary)
- ttdn-store-backup (Secondary)  
- ttdn-store-backup2 (Tertiary)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // ===== DEVELOPMENT RULES (OPEN ACCESS) =====
    // WARNING: Only use in development environment
    // For production, implement proper authentication checks
    
    match /{document=**} {
      allow read, write: if true;
    }
    
    // ===== SPECIFIC COLLECTION RULES =====
    
    // Products collection - Public read, Admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if true; // In production: check if user is admin
    }
    
    // Categories collection - Public read, Admin write  
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if true; // In production: check if user is admin
    }
    
    // Orders collection - User can read/write their own orders
    match /orders/{orderId} {
      allow read, write: if true; // In production: check if resource.data.userId == request.auth.uid
    }
    
    // Users collection - Users can read/write their own data
    match /users/{userId} {
      allow read, write: if true; // In production: check if userId == request.auth.uid
    }
    
    // News collection - Public read, Admin write
    match /news/{newsId} {
      allow read: if true;
      allow write: if true; // In production: check if user is admin
    }
    
    // Companies collection - Public read
    match /companies/{companyId} {
      allow read: if true;
      allow write: if true; // In production: check if user is admin
    }
    
    // Projects collection - Public read
    match /projects/{projectId} {
      allow read: if true;
      allow write: if true; // In production: check if user is admin
    }
  }
}
```

## Production Security Rules (Tham khảo)

Để production, thay thế bằng rules an toàn hơn:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isAdmin() {
      return isAuthenticated() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    // Products - Public read, Admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Categories - Public read, Admin write
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Orders - Users can read/write their own orders, Admins can read all
    match /orders/{orderId} {
      allow read: if isAdmin() || isOwner(resource.data.userId);
      allow create: if isAuthenticated();
      allow update, delete: if isAdmin() || isOwner(resource.data.userId);
    }
    
    // Users - Users can read/write their own data, Admins can read all
    match /users/{userId} {
      allow read: if isAdmin() || isOwner(userId);
      allow write: if isOwner(userId);
    }
    
    // News - Public read, Admin write
    match /news/{newsId} {
      allow read: if true;
      allow write: if isAdmin();
    }
    
    // Other collections - Admin only
    match /{document=**} {
      allow read, write: if isAdmin();
    }
  }
}
```

## Cách Apply Rules

### Cho Development (Hiện tại):
1. Copy rules đầu tiên (open access)
2. Paste vào Firebase Console → Firestore → Rules
3. Click "Publish"

### Cho Production (Sau này):
1. Implement authentication system
2. Add user roles trong Firestore
3. Apply production rules
4. Test thoroughly

## Lưu ý Security

⚠️ **Current rules cho phép full access - chỉ dùng cho development!**

✅ **Production checklist:**
- [ ] Implement user authentication
- [ ] Add admin role system  
- [ ] Apply restrictive rules
- [ ] Test với different user roles
- [ ] Monitor security với Firebase Console
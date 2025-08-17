# Hướng Dẫn Setup Firebase

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Nhấn "Create a project" hoặc "Add project"
3. Nhập tên project (ví dụ: "ttdn-3-store")
4. Bật/tắt Google Analytics (tuỳ chọn)
5. Chọn region phù hợp (Asia-Southeast1 cho Việt Nam)

## Bước 2: Setup Web App

1. Trong project vừa tạo, nhấn biểu tượng web `</>`
2. Nhập tên app (ví dụ: "TTDN-3 Web App")
3. Không cần chọn "Firebase Hosting" (có thể setup sau)
4. Copy thông tin config được hiển thị

## Bước 3: Cấu Hình Firebase

1. Mở file `src/app/firebase.config.ts`
2. Thay thế thông tin placeholder bằng config thực từ Firebase:

\`\`\`typescript
export const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
\`\`\`

## Bước 4: Enable Firestore Database

1. Trong Firebase Console, vào "Firestore Database"
2. Nhấn "Create database"
3. Chọn "Start in test mode" (cho development)
4. Chọn region giống với project (asia-southeast1)

## Bước 5: Setup Security Rules (Tuỳ chọn)

Trong Firestore Database > Rules, thay đổi rules:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Cho phép đọc products và categories
    match /products/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /categories/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Chỉ cho phép user đăng nhập thao tác với cart và orders
    match /carts/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /orders/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
\`\`\`

## Bước 6: Enable Authentication (Tuỳ chọn)

1. Vào "Authentication" trong Firebase Console
2. Nhấn "Get started"
3. Trong tab "Sign-in method", enable:
   - Email/Password
   - Google (tuỳ chọn)

## Bước 7: Khởi Tạo Dữ Liệu

1. Chạy development server: `npm start`
2. **Kiểm tra Firebase:** Truy cập `http://localhost:4202/admin/firebase-test`
3. **Nhấn "Test Firebase Connection"** để kiểm tra kết nối
4. **Nếu OK:** Truy cập `http://localhost:4202/admin/data-init`
5. **Nhấn "Khởi Tạo Dữ Liệu"** để tải dữ liệu mẫu

### ⚠️ Lưu ý quan trọng:
- Mở Developer Tools (F12) để xem log
- Kiểm tra Firebase Console để đảm bảo Firestore đã được tạo
- Nếu gặp lỗi "Permission denied", cập nhật Firestore Rules:

## Bước 8: Cập Nhật Services

Thay đổi trong các component để sử dụng FirebaseProductService:

1. Mở \`src/app/pages/home/home.ts\`
2. Thay thế \`ProductService\` bằng \`FirebaseProductService\`
3. Tương tự cho \`products.component.ts\`

## Cấu Trúc Dữ Liệu Firestore

### Collections:

- **products**: Thông tin sản phẩm
- **categories**: Danh mục sản phẩm  
- **carts**: Giỏ hàng của user
- **orders**: Đơn hàng
- **users**: Thông tin người dùng (nếu có auth)

### Sample Document (products):

\`\`\`json
{
  "name": "Xi măng Portland PCB40",
  "description": "Xi măng Portland PCB40 chất lượng cao...",
  "price": 165000,
  "category": "vat-lieu-xay-dung",
  "brand": "Vicem",
  "stock": 500,
  "featured": true,
  "rating": 4.5,
  "createdAt": "2024-12-15T10:00:00.000Z"
}
\`\`\`

## Troubleshooting

### Lỗi thường gặp:

1. **"Firebase config not found"**: Kiểm tra file \`firebase.config.ts\`
2. **"Permission denied"**: Cập nhật Firestore rules
3. **"Module not found"**: Chạy \`npm install\` để cài dependencies

### Development vs Production:

- **Development**: Sử dụng test mode rules
- **Production**: Cập nhật security rules nghiêm ngặt hơn

## Next Steps

1. Setup Firebase Authentication
2. Tạo admin panel để quản lý sản phẩm
3. Implement real-time updates
4. Add image upload functionality
5. Setup Firebase Hosting cho production

## Liên Hệ Support

Nếu gặp vấn đề, hãy check:
1. Firebase Console logs
2. Browser developer tools
3. Network tab để xem API calls
4. Console errors

# KẾ HOẠCH PHÁT TRIỂN WEBSITE THƯƠNG MẠI TTDN_3

## 🎯 MỤC TIÊU
Chuyển đổi từ website giới thiệu công ty thành nền tảng thương mại điện tử chuyên về thiết bị vật tư xây dựng.

## 🏗️ KIẾN TRÚC HỆ THỐNG

### Frontend (Angular 18)
- **Giữ nguyên**: Các trang giới thiệu công ty (About, Services, Projects, News)
- **Thêm mới**: 
  - Trang sản phẩm (Products)
  - Giỏ hàng (Cart)
  - Thanh toán (Checkout)
  - Tài khoản khách hàng (Account)
  - Admin Panel

### Backend Options
1. **Firebase (Recommended for Start)**
   - Firestore Database
   - Firebase Auth
   - Firebase Storage
   - Firebase Functions
   - Firebase Hosting

2. **Node.js + Express + MongoDB**
   - RESTful API
   - JWT Authentication
   - File Upload
   - Payment Integration

3. **ASP.NET Core + SQL Server**
   - Enterprise-grade
   - Strong typing
   - Microsoft ecosystem

## 📊 CƠ SỞ DỮ LIỆU

### Collections/Tables Cần Thiết

#### Products (Sản phẩm)
```typescript
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  category: string;
  subcategory: string;
  brand: string;
  model: string;
  specifications: {
    [key: string]: string;
  };
  images: string[];
  stock: number;
  unit: string; // m, kg, cái, bộ
  status: 'active' | 'inactive' | 'out-of-stock';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### Categories (Danh mục)
```typescript
interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  parentId?: string;
  isActive: boolean;
  sortOrder: number;
}
```

#### Orders (Đơn hàng)
```typescript
interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Users (Khách hàng)
```typescript
interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  company?: string;
  role: 'customer' | 'admin' | 'staff';
  addresses: Address[];
  createdAt: Date;
  lastLogin: Date;
}
```

## 🛒 TÍNH NĂNG THƯƠNG MẠI

### Khách Hàng
- [ ] Duyệt sản phẩm theo danh mục
- [ ] Tìm kiếm và lọc sản phẩm
- [ ] Xem chi tiết sản phẩm
- [ ] Thêm vào giỏ hàng
- [ ] Quản lý giỏ hàng
- [ ] Đăng ký/Đăng nhập
- [ ] Quản lý tài khoản
- [ ] Lịch sử đơn hàng
- [ ] Wishlist
- [ ] So sánh sản phẩm
- [ ] Đánh giá sản phẩm

### Admin Panel
- [ ] Dashboard thống kê
- [ ] Quản lý sản phẩm (CRUD)
- [ ] Quản lý danh mục
- [ ] Quản lý đơn hàng
- [ ] Quản lý khách hàng
- [ ] Quản lý kho hàng
- [ ] Báo cáo doanh thu
- [ ] Cài đặt hệ thống

## 💳 THANH TOÁN

### Cổng Thanh Toán Việt Nam
1. **VNPay** (Recommended)
2. **MoMo**
3. **ZaloPay**
4. **PayPal** (International)
5. **Thanh toán khi nhận hàng (COD)**

## 📦 VẬN CHUYỂN

### Đối Tác Vận Chuyển
1. **Giao Hàng Nhanh (GHN)**
2. **Giao Hàng Tiết Kiệm (GHTK)**
3. **Viettel Post**
4. **J&T Express**

## 🗂️ DANH MỤC SẢN PHẨM ĐỀ XUẤT

### 1. Vật Liệu Xây Dựng
- Xi măng, cát, sỏi
- Gạch các loại
- Thép xây dựng
- Ống nước, ống điện

### 2. Thiết Bị Máy Móc
- Máy trộn bê tông
- Máy cắt gạch
- Máy khoan
- Cần cẩu mini

### 3. Dụng Cụ Thi Công
- Búa, tua vít
- Thước đo
- Găng tay bảo hộ
- Mũ bảo hiểm

### 4. Thiết Bị Điện
- Dây điện
- Ổ cắm, công tắc
- Đèn LED
- Tủ điện

## 🚀 LỘ TRÌNH PHÁT TRIỂN

### Phase 1 (2-3 tuần): Cơ Sở Hạ Tầng
- [ ] Thiết kế database
- [ ] Setup backend (Firebase/Node.js)
- [ ] Authentication system
- [ ] Basic admin panel

### Phase 2 (3-4 tuần): Sản Phẩm
- [ ] Product management
- [ ] Category system
- [ ] Product listing page
- [ ] Product detail page
- [ ] Search & filter

### Phase 3 (2-3 tuần): Thương Mại
- [ ] Shopping cart
- [ ] Checkout process
- [ ] Payment integration
- [ ] Order management

### Phase 4 (2-3 tuần): Nâng Cao
- [ ] User account
- [ ] Order tracking
- [ ] Reviews & ratings
- [ ] Inventory management

### Phase 5 (1-2 tuần): Tối Ưu
- [ ] Performance optimization
- [ ] SEO optimization
- [ ] Mobile optimization
- [ ] Testing & deployment

## 💰 CHI PHÍ ƯỚC TÍNH

### Option 1: Firebase (Khởi nghiệp)
- Firebase: $25-50/tháng
- Domain + SSL: $20/năm
- Third-party services: $30-50/tháng
- **Total: ~$70-120/tháng**

### Option 2: VPS + Custom Backend
- VPS Server: $20-50/tháng
- Database: $10-30/tháng
- CDN: $10-20/tháng
- **Total: ~$40-100/tháng**

## 🔧 CÔNG CỤ & CÔNG NGHỆ

### Development
- Angular 18 (Frontend)
- Firebase/Node.js (Backend)
- TypeScript
- Angular Material
- SCSS

### Tools
- VS Code
- Git
- Figma (Design)
- Postman (API Testing)

### Analytics
- Google Analytics
- Google Search Console
- Firebase Analytics

## 📱 MOBILE APP (Tương lai)
- Ionic Angular
- React Native
- Flutter

## 🎯 KẾT LUẬN
Đây là kế hoạch chi tiết để chuyển đổi website thành nền tảng thương mại. Bước đầu nên bắt đầu với Firebase để nhanh chóng có MVP, sau đó có thể scale lên custom backend khi cần thiết.

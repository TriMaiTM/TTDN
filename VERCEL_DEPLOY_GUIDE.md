# TTDN Store - Vercel Deployment Guide

## 🚀 Hướng dẫn Deploy lên Vercel

### Bước 1: Chuẩn bị
✅ Project đã được build thành công
✅ File `vercel.json` đã được tạo 
✅ Firebase config đã được thiết lập

### Bước 2: Deploy qua Vercel Dashboard

1. **Truy cập:** https://vercel.com
2. **Đăng nhập** bằng GitHub/Google
3. **Click "New Project"**
4. **Import Git Repository:**
   - Connect GitHub account
   - Chọn repository: `TriMaiTM/TTDN`
   - Click "Import"

### Bước 3: Cấu hình Project

**Framework Preset:** Angular
**Build Command:** `npm run build:vercel`
**Output Directory:** `dist/browser`
**Install Command:** `npm install`

### Bước 4: Environment Variables (Tuỳ chọn)

Thêm environment variables nếu cần:
```
FIREBASE_API_KEY=AIzaSyCxBU_2x0yEUJrtCdYCBQrttGE3uIk7wK0
FIREBASE_AUTH_DOMAIN=ttdn-store.firebaseapp.com
FIREBASE_PROJECT_ID=ttdn-store
```

### Bước 5: Deploy

1. Click **"Deploy"**
2. Đợi 2-3 phút để build
3. Nhận được URL: `https://your-project.vercel.app`

---

## 🔧 Build Settings for Vercel

```json
{
  "buildCommand": "npm run build:vercel",
  "outputDirectory": "dist/browser",
  "installCommand": "npm install",
  "framework": "angular"
}
```

---

## 📋 File Structure đã chuẩn bị

- ✅ `vercel.json` - Routing config
- ✅ `package.json` - Build scripts
- ✅ `dist/browser/` - Production build
- ✅ Firebase configuration

---

## 🌐 Auto Deploy

Sau khi setup xong, mỗi lần push code lên GitHub:
1. Vercel tự động detect changes
2. Build project với `npm run build:vercel`
3. Deploy lên production URL
4. Nhận notification qua email

---

## ⚡ Performance Tips

- Bundle size: ~2.4MB (acceptable for ecommerce)
- CDN: Automatic via Vercel Edge Network
- HTTPS: Automatic SSL certificate
- Domain: Có thể custom domain sau

---

## 🔥 Firebase Integration

Project đã tích hợp Firebase:
- ✅ Authentication
- ✅ Firestore Database  
- ✅ Product Management
- ✅ Order Management

Tất cả hoạt động normal trên production!
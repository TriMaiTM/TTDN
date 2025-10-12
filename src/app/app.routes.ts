import { Route } from '@angular/router';
import { HomeComponent } from './pages/home/home';
import { AboutComponent } from './pages/about/about';
import { BusinessComponent } from './pages/business/business';
import { ConstructionComponent } from './pages/business/construction/construction';
import { DesignComponent } from './pages/business/design/design';
import { SupervisionComponent } from './pages/business/supervision/supervision';
import { LegalComponent } from './pages/business/legal/legal';
import { ProjectsComponent } from './pages/projects/projects';
import { NewsComponent } from './pages/news/news';
import { NewsDetailComponent } from './pages/news-detail/news-detail';
import { ContactComponent } from './pages/contact/contact';
import { StoryComponent } from './pages/about/story/story';
import { VisionComponent } from './pages/about/vision/vision';
import { ProductsComponent } from './pages/products/products';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrderSuccessComponent } from './pages/order-success/order-success.component';
import { OrderHistoryComponent } from './pages/order-history/order-history.component';
import { AdminComponent } from './pages/admin/admin.component';
import { FirebaseTestComponent } from './pages/admin/firebase-test/firebase-test.component';
import { SimpleTestComponent } from './pages/admin/simple-test/simple-test-new.component';
import { ProductManagementComponent } from './pages/admin/product-management/product-management.component';
import { CategoryManagementComponent } from './pages/admin/category-management/category-management.component';
import { OrderManagementComponent } from './pages/admin/order-management/order-management.component';
import { NewsAdminComponent } from './pages/admin/news-admin/news-admin';
import { ReplicationManagementComponent } from './components/replication-management/replication-management.component';
import { ReplicationDemoComponent } from './components/replication-demo/replication-demo.component';
import { DatabaseSyncComponent } from './components/database-sync/database-sync.component';
import { ReplicationTestComponent } from './components/replication-test/replication-test.component';
import { LoginComponent } from './pages/auth/login/login';
import { RegisterComponent } from './pages/auth/register/register';
import { authGuard, adminGuard, guestGuard } from './guards/auth.guard';

export const routes: Route[] = [
  // Public routes
  { path: '', component: HomeComponent, title: 'Trang chủ', data: { animation: 'HomePage' } },
  { path: 'home', component: HomeComponent, title: 'Trang chủ', data: { animation: 'HomePage' } },
  { path: 'about', component: AboutComponent, title: 'Giới thiệu', data: { animation: 'AboutPage' } },
  { path: 'about/story', component: StoryComponent, title: 'Câu chuyện', data: { animation: 'StoryPage' } },
  { path: 'about/vision', component: VisionComponent, title: 'Tầm nhìn', data: { animation: 'VisionPage' } },
  { path: 'business', component: BusinessComponent, title: 'Lĩnh vực hoạt động', data: { animation: 'BusinessPage' } },
  { path: 'business/construction', component: ConstructionComponent, title: 'Thi công xây dựng', data: { animation: 'ConstructionPage' } },
  { path: 'business/design', component: DesignComponent, title: 'Tư vấn thiết kế', data: { animation: 'DesignPage' } },
  { path: 'business/supervision', component: SupervisionComponent, title: 'Tư vấn giám sát và quản lý dự án', data: { animation: 'SupervisionPage' } },
  { path: 'business/legal', component: LegalComponent, title: 'Tư vấn pháp lý', data: { animation: 'LegalPage' } },
  { path: 'products', component: ProductsComponent, title: 'Sản phẩm', data: { animation: 'ProductsPage' } },
  { path: 'products/category/:category', component: ProductsComponent, title: 'Sản phẩm theo danh mục', data: { animation: 'ProductsPage' } },
  { path: 'product/:id', component: ProductDetailComponent, title: 'Chi tiết sản phẩm', data: { animation: 'ProductDetailPage' } },
  { path: 'cart', component: CartComponent, title: 'Giỏ hàng', data: { animation: 'CartPage' } },
  { 
    path: 'checkout', 
    component: CheckoutComponent, 
    title: 'Thanh toán', 
    canActivate: [authGuard],
    data: { animation: 'CheckoutPage' } 
  },
  { 
    path: 'order-success', 
    component: OrderSuccessComponent, 
    title: 'Đặt hàng thành công', 
    data: { animation: 'SuccessPage' } 
  },
  { 
    path: 'order-history', 
    component: OrderHistoryComponent, 
    title: 'Lịch sử đơn hàng',
    canActivate: [authGuard], 
    data: { animation: 'OrderHistoryPage' } 
  },
  { path: 'projects', component: ProjectsComponent, title: 'Dự án', data: { animation: 'ProjectsPage' } },
  { path: 'news', component: NewsComponent, title: 'Tin tức', data: { animation: 'NewsPage' } },
  { path: 'news/:id', component: NewsDetailComponent, title: 'Chi tiết tin tức', data: { animation: 'NewsDetailPage' } },
  { path: 'contact', component: ContactComponent, title: 'Liên hệ', data: { animation: 'ContactPage' } },

  // Auth routes (only for guests)
  { 
    path: 'auth/login', 
    component: LoginComponent, 
    title: 'Đăng nhập',
    canActivate: [guestGuard],
    data: { animation: 'AuthPage' } 
  },
  { 
    path: 'auth/register', 
    component: RegisterComponent, 
    title: 'Đăng ký',
    canActivate: [guestGuard], 
    data: { animation: 'AuthPage' } 
  },
  
  // Legacy login redirect
  { path: 'login', redirectTo: 'auth/login' },
  { path: 'register', redirectTo: 'auth/register' },
  
  // Removed temporary data initialization route

  // Admin routes (protected by admin guard)
  { 
    path: 'admin', 
    component: AdminComponent, 
    title: 'Admin Panel',
    canActivate: [adminGuard],
    data: { animation: 'AdminPage' } 
  },
  { 
    path: 'admin/simple-test', 
    component: SimpleTestComponent, 
    title: 'Simple Test',
    canActivate: [adminGuard],
    data: { animation: 'AdminPage' } 
  },
  // Removed data-init route
  { 
    path: 'admin/firebase-test', 
    component: FirebaseTestComponent, 
    title: 'Firebase Test',
    canActivate: [adminGuard],
    data: { animation: 'AdminPage' } 
  },
  { 
    path: 'admin/products', 
    component: ProductManagementComponent, 
    title: 'Quản lý sản phẩm',
    canActivate: [adminGuard],
    data: { animation: 'AdminPage' } 
  },
  { 
    path: 'admin/categories', 
    component: CategoryManagementComponent, 
    title: 'Quản lý danh mục',
    canActivate: [adminGuard],
    data: { animation: 'AdminPage' } 
  },
  { 
    path: 'admin/orders', 
    component: OrderManagementComponent, 
    title: 'Quản lý đơn hàng',
    canActivate: [adminGuard],
    data: { animation: 'AdminPage' } 
  },
  // Removed checkout-test route
  { 
    path: 'admin/news', 
    component: NewsAdminComponent, 
    title: 'Quản lý tin tức',
    canActivate: [adminGuard],
    data: { animation: 'AdminPage' } 
  },
  { 
    path: 'admin/replication', 
    component: ReplicationManagementComponent, 
    title: 'Quản lý Database Replication',
    canActivate: [adminGuard],
    data: { animation: 'AdminPage' } 
  },
  { 
    path: 'admin/replication-demo', 
    component: ReplicationDemoComponent, 
    title: 'Demo Database Replication',
    canActivate: [adminGuard],
    data: { animation: 'AdminPage' } 
  },
  { 
    path: 'admin/database-sync', 
    component: DatabaseSyncComponent, 
    title: 'Database Sync',
    canActivate: [adminGuard],
    data: { animation: 'AdminPage' } 
  },
  { 
    path: 'admin/replication-test', 
    component: ReplicationTestComponent, 
    title: 'Replication Test',
    canActivate: [adminGuard],
    data: { animation: 'AdminPage' } 
  },

  // Wildcard route - must be last
  { path: '**', redirectTo: '' }
];
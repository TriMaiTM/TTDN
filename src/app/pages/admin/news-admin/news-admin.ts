import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Firestore } from '@angular/fire/firestore';
import { 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp
} from '@angular/fire/firestore';

// Interfaces cho News Admin
interface NewsItem {
  id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: NewsCategory;
  tags: string[];
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  viewCount?: number;
  publishedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

interface NewsCategory {
  id?: string;
  name: string;
  slug?: string;
  description: string;
  color: string;
  icon?: string;
  isActive: boolean;
  sortOrder: number;
  newsCount?: number;
}

@Component({
  selector: 'app-news-admin',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatTableModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatChipsModule,
    MatTooltipModule
  ],
  templateUrl: './news-admin.html',
  styleUrl: './news-admin.scss'
})
export class NewsAdminComponent implements OnInit {
  private firestore = inject(Firestore);
  private fb = inject(FormBuilder);

  newsList: NewsItem[] = [];
  categories: NewsCategory[] = [];
  selectedNews: NewsItem | null = null;
  isEditing = false;
  newsForm: FormGroup;

  displayedColumns: string[] = ['title', 'category', 'status', 'featured', 'publishedAt', 'actions'];

  // Danh sách status và category options
  statusOptions = [
    { value: 'draft', label: 'Nháp' },
    { value: 'published', label: 'Đã xuất bản' },
    { value: 'archived', label: 'Lưu trữ' }
  ];

  constructor() {
    this.newsForm = this.createNewsForm();
  }

  ngOnInit(): void {
    this.loadNews();
    this.loadCategories();
  }

  async initializeSampleCategories(): Promise<void> {
    try {
      const categoryRef = collection(this.firestore, 'news_categories');
      const q = query(categoryRef);
      const querySnapshot = await getDocs(q);
      
      // Nếu chưa có categories nào, tạo dữ liệu mẫu
      if (querySnapshot.empty) {
        const sampleCategories = [
          { name: 'Tin tức chung', slug: 'tin-tuc-chung', description: 'Các tin tức chung về công ty', sortOrder: 1 },
          { name: 'Dự án', slug: 'du-an', description: 'Tin tức về các dự án', sortOrder: 2 },
          { name: 'Sản phẩm', slug: 'san-pham', description: 'Tin tức về sản phẩm', sortOrder: 3 },
          { name: 'Sự kiện', slug: 'su-kien', description: 'Các sự kiện của công ty', sortOrder: 4 }
        ];

        for (const category of sampleCategories) {
          await addDoc(categoryRef, {
            ...category,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        
        this.showSuccess('Đã khởi tạo dữ liệu mẫu cho danh mục');
        await this.loadCategories(); // Reload sau khi tạo
      }
    } catch (error) {
      console.error('Error initializing sample categories:', error);
      this.showError('Có lỗi xảy ra khi khởi tạo danh mục mẫu');
    }
  }

  createNewsForm(): FormGroup {
    return this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      excerpt: ['', [Validators.required, Validators.maxLength(200)]],
      content: ['', [Validators.required, Validators.minLength(20)]],
      category: ['', Validators.required],
      author: this.fb.group({
        id: ['admin'],
        name: ['Admin'],
        avatar: ['']
      }),
      featuredImage: ['', Validators.required],
      tags: [''],
      status: ['draft', Validators.required],
      featured: [false],
      publishedAt: ['']
    });
  }

  async loadNews(): Promise<void> {
    try {
      const newsRef = collection(this.firestore, 'news');
      const q = query(newsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      this.newsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsItem[];
    } catch (error) {
      console.error('Error loading news:', error);
      this.showError('Không thể tải danh sách tin tức');
    }
  }

  async loadCategories(): Promise<void> {
    try {
      const categoryRef = collection(this.firestore, 'news_categories');
      const q = query(categoryRef, orderBy('sortOrder', 'asc'));
      const querySnapshot = await getDocs(q);
      
      this.categories = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsCategory[];
    } catch (error) {
      console.error('Error loading categories:', error);
      this.showError('Không thể tải danh sách danh mục');
    }
  }

  selectNews(news: NewsItem): void {
    this.selectedNews = news;
    this.isEditing = true;
    this.populateForm(news);
  }

  populateForm(news: NewsItem): void {
    this.newsForm.patchValue({
      title: news.title,
      excerpt: news.excerpt,
      content: news.content,
      category: news.category.id,
      author: news.author,
      featuredImage: news.featuredImage || '',
      tags: news.tags.join(', '),
      status: news.status,
      featured: news.featured,
      publishedAt: news.publishedAt ? new Date(news.publishedAt).toISOString().slice(0, 16) : ''
    });
  }

  clearForm(): void {
    this.newsForm.reset();
    this.newsForm.patchValue({
      status: 'draft',
      featured: false,
      author: {
        id: 'admin',
        name: 'Admin',
        avatar: ''
      }
    });
    this.selectedNews = null;
    this.isEditing = false;
  }

  async saveNews(): Promise<void> {
    if (this.newsForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    try {
      console.log('Starting saveNews...', this.newsForm.value);
      
      const formValue = this.newsForm.value;
      const category = this.categories.find(c => c.id === formValue.category);
      
      if (!category) {
        this.showError('Vui lòng chọn danh mục');
        return;
      }

      const newsData: any = {
        title: formValue.title,
        excerpt: formValue.excerpt,
        content: formValue.content,
        featuredImage: formValue.featuredImage || '',
        category: category,
        author: formValue.author,
        tags: formValue.tags ? formValue.tags.split(',').map((tag: string) => tag.trim()) : [],
        status: formValue.status,
        featured: formValue.featured
      };
      
      // Only add publishedAt if it has a valid value
      if (formValue.publishedAt) {
        newsData.publishedAt = new Date(formValue.publishedAt);
      }

      console.log('News data to save:', newsData);

      if (this.isEditing && this.selectedNews) {
        const newsRef = doc(this.firestore, 'news', this.selectedNews.id!);
        const updateData = {
          ...newsData,
          slug: this.generateSlug(newsData.title),
          updatedAt: serverTimestamp()
        };
        
        console.log('Updating news...', updateData);
        await updateDoc(newsRef, updateData);
        this.showSuccess('Cập nhật tin tức thành công');
      } else {
        const newsRef = collection(this.firestore, 'news');
        const newNewsData = {
          ...newsData,
          slug: this.generateSlug(newsData.title),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          viewCount: 0
        };
        
        console.log('Adding new news...', newNewsData);
        await addDoc(newsRef, newNewsData);
        this.showSuccess('Tạo tin tức thành công');
      }

      this.clearForm();
      await this.loadNews();
    } catch (error) {
      console.error('Error saving news:', error);
      this.showError('Có lỗi xảy ra khi lưu tin tức: ' + (error as any).message);
    }
  }

  async deleteNews(news: NewsItem): Promise<void> {
    if (confirm(`Bạn có chắc chắn muốn xóa tin tức "${news.title}"?`)) {
      try {
        const newsRef = doc(this.firestore, 'news', news.id!);
        await deleteDoc(newsRef);
        this.showSuccess('Xóa tin tức thành công');
        await this.loadNews();
        
        if (this.selectedNews?.id === news.id) {
          this.clearForm();
        }
      } catch (error) {
        console.error('Error deleting news:', error);
        this.showError('Có lỗi xảy ra khi xóa tin tức');
      }
    }
  }

  async initializeSampleData(): Promise<void> {
    try {
      // Kiểm tra xem đã có categories chưa
      const categoryRef = collection(this.firestore, 'news_categories');
      const categorySnapshot = await getDocs(categoryRef);
      
      if (categorySnapshot.empty) {
        // Tạo sample categories
        const categories: NewsCategory[] = [
          {
            name: 'Tin Công Nghệ',
            description: 'Tin tức về công nghệ mới nhất',
            color: '#2196F3',
            icon: 'computer',
            isActive: true,
            sortOrder: 1
          },
          {
            name: 'Tin Kinh Doanh',
            description: 'Tin tức kinh doanh và thị trường',
            color: '#4CAF50',
            icon: 'business',
            isActive: true,
            sortOrder: 2
          },
          {
            name: 'Tin Xã Hội',
            description: 'Tin tức xã hội và đời sống',
            color: '#FF9800',
            icon: 'people',
            isActive: true,
            sortOrder: 3
          }
        ];

        for (const category of categories) {
          const categoryData = {
            ...category,
            slug: this.generateSlug(category.name),
            newsCount: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          await addDoc(categoryRef, categoryData);
        }
        
        console.log('Đã tạo categories mẫu');
      }

      // Load lại categories để có dữ liệu
      await this.loadCategories();
      
      // Kiểm tra xem đã có news chưa
      const newsRef = collection(this.firestore, 'news');
      const newsSnapshot = await getDocs(newsRef);
      
      if (newsSnapshot.empty && this.categories.length > 0) {
        // Tạo sample news
        const sampleNews = [
          {
            title: 'Chào mừng đến với hệ thống quản lý tin tức',
            excerpt: 'Đây là tin tức mẫu đầu tiên trong hệ thống. Bạn có thể chỉnh sửa hoặc xóa tin tức này.',
            content: 'Nội dung chi tiết của tin tức mẫu. Hệ thống cho phép bạn thêm, sửa, xóa tin tức một cách dễ dàng. Hãy thử nghiệm các tính năng để làm quen với hệ thống.',
            featuredImage: 'https://picsum.photos/600/400?random=1',
            category: this.categories[0],
            author: { id: 'admin', name: 'Admin', avatar: '' },
            tags: ['mẫu', 'hệ thống', 'chào mừng'],
            status: 'published',
            featured: true,
            publishedAt: new Date()
          },
          {
            title: 'Hướng dẫn sử dụng hệ thống',
            excerpt: 'Hướng dẫn chi tiết cách sử dụng các tính năng trong hệ thống quản lý tin tức.',
            content: 'Để tạo tin tức mới, bạn hãy điền đầy đủ thông tin vào form bên trái. Để chỉnh sửa tin tức, hãy click vào nút chỉnh sửa trong bảng. Để xóa tin tức, hãy click vào nút xóa.',
            featuredImage: 'https://picsum.photos/600/400?random=2',
            category: this.categories[1] || this.categories[0],
            author: { id: 'admin', name: 'Admin', avatar: '' },
            tags: ['hướng dẫn', 'sử dụng'],
            status: 'draft',
            featured: false
            // No publishedAt for draft status
          }
        ];

        for (const news of sampleNews) {
          const newsData: any = {
            ...news,
            slug: this.generateSlug(news.title),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            viewCount: 0
          };
          
          // Remove undefined fields to avoid Firestore errors
          if (newsData.publishedAt === undefined) {
            delete newsData.publishedAt;
          }
          
          await addDoc(newsRef, newsData);
        }
        
        console.log('Đã tạo news mẫu');
      }
      
      this.showSuccess('Khởi tạo dữ liệu mẫu thành công');
      await this.loadNews();
      
    } catch (error) {
      console.error('Error initializing sample data:', error);
      this.showError('Có lỗi xảy ra khi khởi tạo dữ liệu mẫu');
    }
  }

  // Utility methods
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  private markFormGroupTouched(): void {
    Object.keys(this.newsForm.controls).forEach(key => {
      this.newsForm.get(key)?.markAsTouched();
    });
  }

  private showSuccess(message: string): void {
    console.log('SUCCESS:', message);
    alert(message);
  }

  private showError(message: string): void {
    console.error('ERROR:', message);
    alert(message);
  }

  getStatusText(status: string): string {
    const statusMap: { [key: string]: string } = {
      'draft': 'Nháp',
      'published': 'Đã xuất bản',
      'archived': 'Lưu trữ'
    };
    return statusMap[status] || status;
  }

  getCategoryName(news: NewsItem): string {
    return news.category?.name || 'Không có danh mục';
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('vi-VN');
  }
}

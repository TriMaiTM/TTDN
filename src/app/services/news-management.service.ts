import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp
} from '@angular/fire/firestore';

export interface NewsItem {
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

export interface NewsCategory {
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

@Injectable({
  providedIn: 'root'
})
export class NewsManagementService {
  constructor(private firestore: Firestore) {}

  // News CRUD
  async createNews(newsData: NewsItem): Promise<string> {
    const newsRef = collection(this.firestore, 'news');
    const slug = this.generateSlug(newsData.title);
    
    const news = {
      ...newsData,
      slug,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      viewCount: 0
    };

    const docRef = await addDoc(newsRef, news);
    return docRef.id;
  }

  async updateNews(newsId: string, newsData: Partial<NewsItem>): Promise<void> {
    const newsRef = doc(this.firestore, 'news', newsId);
    const updateData = {
      ...newsData,
      updatedAt: serverTimestamp()
    };

    if (newsData.title) {
      updateData.slug = this.generateSlug(newsData.title);
    }

    await updateDoc(newsRef, updateData);
  }

  async deleteNews(newsId: string): Promise<void> {
    const newsRef = doc(this.firestore, 'news', newsId);
    await deleteDoc(newsRef);
  }

  async getAllNews(): Promise<NewsItem[]> {
    const newsRef = collection(this.firestore, 'news');
    const q = query(newsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as NewsItem[];
  }

  // Categories CRUD
  async createNewsCategory(categoryData: NewsCategory): Promise<string> {
    const categoryRef = collection(this.firestore, 'news_categories');
    const slug = this.generateSlug(categoryData.name);
    
    const category = {
      ...categoryData,
      slug,
      newsCount: 0
    };

    const docRef = await addDoc(categoryRef, category);
    return docRef.id;
  }

  async updateNewsCategory(categoryId: string, categoryData: Partial<NewsCategory>): Promise<void> {
    const categoryRef = doc(this.firestore, 'news_categories', categoryId);
    await updateDoc(categoryRef, categoryData);
  }

  async deleteNewsCategory(categoryId: string): Promise<void> {
    const categoryRef = doc(this.firestore, 'news_categories', categoryId);
    await deleteDoc(categoryRef);
  }

  async getAllNewsCategories(): Promise<NewsCategory[]> {
    const categoryRef = collection(this.firestore, 'news_categories');
    const q = query(categoryRef, orderBy('sortOrder', 'asc'));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as NewsCategory[];
  }

  // Utility
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  // Initialize sample data
  async initializeSampleData(): Promise<void> {
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
      await this.createNewsCategory(category);
    }
  }
}

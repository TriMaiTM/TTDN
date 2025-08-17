import { Injectable } from '@angular/core';
import { 
  Firestore, 
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

// Định nghĩa interface riêng cho service này để tránh circular dependency
export interface AdminNewsItem {
  id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: AdminNewsCategory;
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

export interface AdminNewsCategory {
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
export class AdminNewsService {
  private newsCollection = 'news';
  private categoriesCollection = 'news_categories';

  constructor(private firestore: Firestore) {}

  // News CRUD
  async createNews(newsData: AdminNewsItem): Promise<string> {
    try {
      const newsRef = collection(this.firestore, this.newsCollection);
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
    } catch (error) {
      console.error('Error creating news:', error);
      throw error;
    }
  }

  async updateNews(newsId: string, newsData: Partial<AdminNewsItem>): Promise<void> {
    try {
      const newsRef = doc(this.firestore, this.newsCollection, newsId);
      const updateData = {
        ...newsData,
        updatedAt: serverTimestamp()
      };

      if (newsData.title) {
        updateData.slug = this.generateSlug(newsData.title);
      }

      await updateDoc(newsRef, updateData);
    } catch (error) {
      console.error('Error updating news:', error);
      throw error;
    }
  }

  async deleteNews(newsId: string): Promise<void> {
    try {
      const newsRef = doc(this.firestore, this.newsCollection, newsId);
      await deleteDoc(newsRef);
    } catch (error) {
      console.error('Error deleting news:', error);
      throw error;
    }
  }

  async getAllNews(): Promise<AdminNewsItem[]> {
    try {
      const newsRef = collection(this.firestore, this.newsCollection);
      const q = query(newsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminNewsItem[];
    } catch (error) {
      console.error('Error getting news:', error);
      throw error;
    }
  }

  // Categories CRUD
  async createNewsCategory(categoryData: AdminNewsCategory): Promise<string> {
    try {
      const categoryRef = collection(this.firestore, this.categoriesCollection);
      const slug = this.generateSlug(categoryData.name);
      
      const category = {
        ...categoryData,
        slug,
        newsCount: 0
      };

      const docRef = await addDoc(categoryRef, category);
      return docRef.id;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  async updateNewsCategory(categoryId: string, categoryData: Partial<AdminNewsCategory>): Promise<void> {
    try {
      const categoryRef = doc(this.firestore, this.categoriesCollection, categoryId);
      await updateDoc(categoryRef, categoryData);
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteNewsCategory(categoryId: string): Promise<void> {
    try {
      const categoryRef = doc(this.firestore, this.categoriesCollection, categoryId);
      await deleteDoc(categoryRef);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  async getAllNewsCategories(): Promise<AdminNewsCategory[]> {
    try {
      const categoryRef = collection(this.firestore, this.categoriesCollection);
      const q = query(categoryRef, orderBy('sortOrder', 'asc'));
      const querySnapshot = await getDocs(q);
      
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminNewsCategory[];
    } catch (error) {
      console.error('Error getting categories:', error);
      throw error;
    }
  }

  // Utility method
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
    try {
      const categories: AdminNewsCategory[] = [
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
    } catch (error) {
      console.error('Error initializing sample data:', error);
      throw error;
    }
  }
}

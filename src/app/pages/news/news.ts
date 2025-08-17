import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Firestore } from '@angular/fire/firestore';
import { 
  collection, 
  getDocs, 
  query, 
  orderBy
} from '@angular/fire/firestore';

// Inline interfaces to avoid circular dependencies
interface NewsAuthor {
  id: string;
  name: string;
  avatar?: string;
}

interface NewsCategory {
  id?: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  isActive?: boolean;
  sortOrder?: number;
}

interface NewsItem {
  id?: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  category: NewsCategory;
  author: NewsAuthor;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featured: boolean;
  publishedAt?: Date;
  createdAt?: any;
  updatedAt?: any;
  viewCount?: number;
  slug?: string;
}

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule, MatButtonModule, MatChipsModule],
  templateUrl: './news.html',
  styleUrls: ['./news.scss']
})
export class NewsComponent implements OnInit {
  private firestore = inject(Firestore);
  private router = inject(Router);
  
  news: NewsItem[] = [];
  featuredNews: NewsItem[] = [];
  isLoading = false;

  ngOnInit(): void {
    this.loadNews();
  }

  async loadNews(): Promise<void> {
    try {
      this.isLoading = true;
      const newsRef = collection(this.firestore, 'news');
      
      // Simple query without composite index requirement
      const q = query(newsRef, orderBy('createdAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      
      const allNews = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as NewsItem[];

      // Filter published news in code instead of query
      this.news = allNews.filter(news => news.status === 'published');

      // Separate featured news
      this.featuredNews = this.news.filter(n => n.featured);
      
      console.log('Loaded news:', this.news);
    } catch (error) {
      console.error('Error loading news:', error);
      // Fallback to empty array if error
      this.news = [];
      this.featuredNews = [];
    } finally {
      this.isLoading = false;
    }
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  }

  getCategoryName(news: NewsItem): string {
    return news.category?.name || 'Tin tức';
  }

  viewNewsDetail(news: NewsItem): void {
    if (news.id) {
      this.router.navigate(['/news', news.id]);
    }
  }

  viewFeaturedNews(news: NewsItem): void {
    this.viewNewsDetail(news);
  }
}

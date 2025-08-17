import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { Firestore } from '@angular/fire/firestore';
import { 
  doc, 
  getDoc
} from '@angular/fire/firestore';
import { Nl2brPipe } from '../../pipes/nl2br.pipe';

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
  selector: 'app-news-detail',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule,
    MatCardModule, 
    MatIconModule, 
    MatButtonModule, 
    MatChipsModule,
    MatDividerModule,
    Nl2brPipe
  ],
  templateUrl: './news-detail.html',
  styleUrls: ['./news-detail.scss']
})
export class NewsDetailComponent implements OnInit {
  private firestore = inject(Firestore);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  
  news: NewsItem | null = null;
  isLoading = false;
  notFound = false;

  ngOnInit(): void {
    // Get news ID from route parameters
    const newsId = this.route.snapshot.paramMap.get('id');
    if (newsId) {
      this.loadNews(newsId);
    } else {
      this.notFound = true;
    }
  }

  async loadNews(newsId: string): Promise<void> {
    try {
      this.isLoading = true;
      const newsRef = doc(this.firestore, 'news', newsId);
      const newsSnap = await getDoc(newsRef);
      
      if (newsSnap.exists()) {
        const newsData = { id: newsSnap.id, ...newsSnap.data() } as NewsItem;
        
        // Only show published news to public
        if (newsData.status === 'published') {
          this.news = newsData;
          // Increment view count (optional)
          this.incrementViewCount(newsId);
        } else {
          this.notFound = true;
        }
      } else {
        this.notFound = true;
      }
    } catch (error) {
      console.error('Error loading news:', error);
      this.notFound = true;
    } finally {
      this.isLoading = false;
    }
  }

  async incrementViewCount(newsId: string): Promise<void> {
    try {
      // This would typically be done server-side to avoid manipulation
      // For now, we'll just increment locally
      if (this.news) {
        this.news.viewCount = (this.news.viewCount || 0) + 1;
      }
    } catch (error) {
      console.error('Error incrementing view count:', error);
    }
  }

  formatDate(date: any): string {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getCategoryName(): string {
    return this.news?.category?.name || 'Tin tức';
  }

  goBack(): void {
    this.router.navigate(['/news']);
  }

  shareNews(): void {
    if (navigator.share && this.news) {
      navigator.share({
        title: this.news.title,
        text: this.news.excerpt,
        url: window.location.href
      });
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link đã được sao chép vào clipboard!');
    }
  }
}

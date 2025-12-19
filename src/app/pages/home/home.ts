import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DataService } from '../../services/data';
import { ReplicatedProductService } from '../../services/replicated-product.service';
import { CartService } from '../../services/cart.service';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { SliderComponent } from '../../components/slider/slider';
import { Product } from '../../models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, SliderComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.scss']
})
export class HomeComponent implements OnInit {
  company: any = null;
  projects: any[] = [];
  news: any[] = [];
  featuredProducts: Product[] = [];

  constructor(
    private data: DataService,
    private productService: ReplicatedProductService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.data.getCompany().subscribe(c => this.company = c);
    this.data.getProjects().subscribe(p => this.projects = p);
    this.data.getNews().subscribe(n => this.news = n);
    this.productService.getFeaturedProducts(4).subscribe((products: Product[]) => {
      this.featuredProducts = products;
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  }

  addToCart(product: Product): void {
    this.cartService.addToCart(product, 1);
    // Could add a toast notification here
  }

  goToProduct(productId: string): void {
    this.router.navigate(['/product', productId]).then(() => {
      // Scroll to top after navigation
      window.scrollTo(0, 0);
    });
  }
}

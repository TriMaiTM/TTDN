import { Component, OnInit, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { Category } from '../../models';
import { ReplicatedProductService } from '../../services/replicated-product.service';

@Component({
  selector: 'app-category-filter',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatChipsModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule
  ],
  template: `
    <mat-card class="category-filter-card">
      <mat-card-header>
        <mat-icon mat-card-avatar>category</mat-icon>
        <mat-card-title>Danh Mục Sản Phẩm</mat-card-title>
        <mat-card-subtitle>Lọc theo danh mục</mat-card-subtitle>
      </mat-card-header>
      
      <mat-card-content>
        <!-- All Categories Button -->
        <div class="filter-section">
          <button 
            mat-button
            [class.active]="!selectedCategory"
            [style.background-color]="!selectedCategory ? '#1976d2' : 'transparent'"
            [style.color]="!selectedCategory ? 'white' : 'inherit'"
            [style.border-color]="!selectedCategory ? '#1976d2' : '#ddd'"
            (click)="selectCategory(null)"
            class="category-button all-categories">
            <mat-icon>apps</mat-icon>
            <span>Tất cả sản phẩm</span>
            <mat-chip class="count-chip">{{ totalProducts }}</mat-chip>
          </button>
        </div>

        <!-- Main Categories -->
        <div class="filter-section" *ngFor="let mainCategory of mainCategories">
          <div class="main-category-header">
            <button 
              mat-button
              [class.active]="selectedCategory === mainCategory.slug"
              [style.background-color]="selectedCategory === mainCategory.slug ? '#1976d2' : 'transparent'"
              [style.color]="selectedCategory === mainCategory.slug ? 'white' : 'inherit'"
              [style.border-color]="selectedCategory === mainCategory.slug ? '#1976d2' : '#ddd'"
              (click)="selectCategory(mainCategory.slug)"
              class="category-button main-category">
              <mat-icon>{{ mainCategory.icon || 'folder' }}</mat-icon>
              <span>{{ mainCategory.name }}</span>
              <mat-chip class="count-chip">{{ mainCategory.productCount || 0 }}</mat-chip>
            </button>
          </div>
          
          <!-- Sub Categories -->
          <div class="sub-categories" *ngIf="mainCategory.children && mainCategory.children.length > 0">
            <button 
              *ngFor="let subCategory of mainCategory.children"
              mat-button
              [class.active]="selectedCategory === subCategory.slug"
              [style.background-color]="selectedCategory === subCategory.slug ? '#1976d2' : 'transparent'"
              [style.color]="selectedCategory === subCategory.slug ? 'white' : 'inherit'"
              [style.border-color]="selectedCategory === subCategory.slug ? '#1976d2' : '#ddd'"
              (click)="selectCategory(subCategory.slug)"
              class="category-button sub-category">
              <mat-icon>subdirectory_arrow_right</mat-icon>
              <span>{{ subCategory.name }}</span>
              <mat-chip class="count-chip">{{ subCategory.productCount || 0 }}</mat-chip>
            </button>
          </div>
        </div>

        <!-- Quick Filters -->
        <div class="quick-filters">
          <h4>Bộ lọc nhanh</h4>
          <div class="filter-chips">
            <mat-chip-option 
              *ngFor="let filter of quickFilters"
              [selected]="false"
              (click)="applyQuickFilter(filter)">
              <mat-icon>{{ filter.icon }}</mat-icon>
              {{ filter.name }}
            </mat-chip-option>
          </div>
        </div>
      </mat-card-content>
    </mat-card>
  `,
  styleUrls: ['./category-filter.component.scss']
})
export class CategoryFilterComponent implements OnInit {
  @Input() selectedCategory: string | null = null;
  @Input() totalProducts: number = 0;
  @Output() categorySelected = new EventEmitter<string | null>();
  @Output() quickFilterApplied = new EventEmitter<any>();

  private productService = inject(ReplicatedProductService);
  
  mainCategories: Category[] = [];
  
  quickFilters = [
    { name: 'Sản phẩm mới', icon: 'new_releases', filter: 'newest' },
    { name: 'Giá rẻ', icon: 'local_offer', filter: 'cheapest' },
    { name: 'Đánh giá cao', icon: 'star', filter: 'highest_rated' },
    { name: 'Bán chạy', icon: 'trending_up', filter: 'best_seller' },
    { name: 'Giảm giá', icon: 'discount', filter: 'on_sale' }
  ];

  async ngOnInit() {
    await this.loadCategories();
  }

  async loadCategories() {
    try {
      const categories = await this.productService.fetchCategories();
      
      // Filter main categories (no parentId) and organize hierarchy
      this.mainCategories = categories
        .filter(cat => !cat.parentId && cat.isActive)
        .map(mainCat => ({
          ...mainCat,
          children: categories.filter(cat => cat.parentId === mainCat.slug && cat.isActive)
        }));
        
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  selectCategory(categorySlug: string | null) {
    console.log('Category selected:', categorySlug); // Debug log
    this.selectedCategory = categorySlug;
    this.categorySelected.emit(categorySlug);
  }

  applyQuickFilter(filter: any) {
    this.quickFilterApplied.emit(filter);
  }
}

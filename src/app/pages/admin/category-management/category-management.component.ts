import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Category } from '../../../models';
import { ReplicatedProductService } from '../../../services/replicated-product.service';

@Component({
  selector: 'app-category-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule,
    MatSlideToggleModule,
    MatTooltipModule
  ],
  template: `
    <div class="container">
      <h1>Quản Lý Danh Mục</h1>
      
      <!-- Add/Edit Category Form -->
      <mat-card class="form-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>{{ editingCategory ? 'edit' : 'add' }}</mat-icon>
          <mat-card-title>{{ editingCategory ? 'Sửa Danh Mục' : 'Thêm Danh Mục Mới' }}</mat-card-title>
        </mat-card-header>
        
        <mat-card-content>
          <form [formGroup]="categoryForm" (ngSubmit)="saveCategory()">
            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Tên danh mục</mat-label>
                <input matInput formControlName="name" required>
                <mat-error *ngIf="categoryForm.get('name')?.hasError('required')">
                  Tên danh mục là bắt buộc
                </mat-error>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Slug (URL)</mat-label>
                <input matInput formControlName="slug" required>
                <mat-hint>Chỉ sử dụng chữ thường, số và dấu gạch ngang</mat-hint>
                <mat-error *ngIf="categoryForm.get('slug')?.hasError('required')">
                  Slug là bắt buộc
                </mat-error>
              </mat-form-field>
            </div>

            <div class="form-row">
              <mat-form-field appearance="outline">
                <mat-label>Danh mục cha</mat-label>
                <mat-select formControlName="parentId">
                  <mat-option value="">Không có (danh mục gốc)</mat-option>
                  <mat-option *ngFor="let category of getMainCategories()" [value]="category.slug">
                    {{ category.name }}
                  </mat-option>
                </mat-select>
              </mat-form-field>
              
              <mat-form-field appearance="outline">
                <mat-label>Thứ tự sắp xếp</mat-label>
                <input matInput type="number" formControlName="sortOrder">
              </mat-form-field>
            </div>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Mô tả</mat-label>
              <textarea matInput rows="3" formControlName="description"></textarea>
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>URL hình ảnh</mat-label>
              <input matInput formControlName="image">
            </mat-form-field>

            <mat-form-field appearance="outline" class="full-width">
              <mat-label>Icon (Material Icon)</mat-label>
              <input matInput formControlName="icon" placeholder="category, build, etc.">
            </mat-form-field>

            <div class="form-row">
              <mat-slide-toggle formControlName="isActive" color="primary">
                Kích hoạt danh mục
              </mat-slide-toggle>
            </div>

            <div class="form-actions">
              <button 
                mat-raised-button 
                color="primary" 
                type="submit" 
                [disabled]="categoryForm.invalid || loading">
                <mat-icon>{{ editingCategory ? 'save' : 'add' }}</mat-icon>
                {{ editingCategory ? 'Cập Nhật' : 'Thêm Mới' }}
              </button>
              
              <button 
                mat-button 
                type="button" 
                (click)="cancelEdit()" 
                *ngIf="editingCategory">
                <mat-icon>cancel</mat-icon>
                Hủy
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <!-- Categories Table -->
      <mat-card class="table-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>category</mat-icon>
          <mat-card-title>Danh Sách Danh Mục</mat-card-title>
          <mat-card-subtitle>{{ categories.length }} danh mục</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div *ngIf="loading" class="loading">
            <mat-spinner></mat-spinner>
            <p>Đang tải dữ liệu...</p>
          </div>

          <div *ngIf="!loading && categories.length === 0" class="no-data">
            <mat-icon>category</mat-icon>
            <p>Chưa có danh mục nào</p>
          </div>

          <table mat-table [dataSource]="categories" *ngIf="!loading && categories.length > 0" class="categories-table">
            <!-- Icon Column -->
            <ng-container matColumnDef="icon">
              <th mat-header-cell *matHeaderCellDef>Icon</th>
              <td mat-cell *matCellDef="let category">
                <mat-icon *ngIf="category.icon">{{ category.icon }}</mat-icon>
                <img *ngIf="category.image && !category.icon" 
                     [src]="category.image" 
                     [alt]="category.name" 
                     class="category-image">
                <mat-icon *ngIf="!category.icon && !category.image">category</mat-icon>
              </td>
            </ng-container>

            <!-- Name Column -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Tên Danh Mục</th>
              <td mat-cell *matCellDef="let category">
                <div class="category-info">
                  <strong>{{ category.name }}</strong>
                  <small>{{ category.slug }}</small>
                  <mat-chip *ngIf="category.parentId" color="accent" class="parent-chip">
                    Con của: {{ getParentName(category.parentId) }}
                  </mat-chip>
                </div>
              </td>
            </ng-container>

            <!-- Description Column -->
            <ng-container matColumnDef="description">
              <th mat-header-cell *matHeaderCellDef>Mô Tả</th>
              <td mat-cell *matCellDef="let category">
                <p class="description-text">{{ category.description || 'Không có mô tả' }}</p>
              </td>
            </ng-container>

            <!-- Sort Order Column -->
            <ng-container matColumnDef="sortOrder">
              <th mat-header-cell *matHeaderCellDef>Thứ Tự</th>
              <td mat-cell *matCellDef="let category">
                {{ category.sortOrder }}
              </td>
            </ng-container>

            <!-- Product Count Column -->
            <ng-container matColumnDef="productCount">
              <th mat-header-cell *matHeaderCellDef>Số SP</th>
              <td mat-cell *matCellDef="let category">
                <mat-chip>{{ category.productCount || 0 }}</mat-chip>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Trạng Thái</th>
              <td mat-cell *matCellDef="let category">
                <mat-chip [color]="category.isActive ? 'primary' : 'warn'">
                  {{ category.isActive ? 'Hoạt động' : 'Tạm ngưng' }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Thao Tác</th>
              <td mat-cell *matCellDef="let category">
                <button mat-icon-button color="primary" (click)="editCategory(category)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button 
                        color="accent" 
                        (click)="toggleStatus(category)"
                        [matTooltip]="category.isActive ? 'Tạm ngưng' : 'Kích hoạt'">
                  <mat-icon>{{ category.isActive ? 'pause_circle' : 'play_circle' }}</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="deleteCategory(category)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <!-- Category Tree Preview -->
      <mat-card class="tree-card">
        <mat-card-header>
          <mat-icon mat-card-avatar>account_tree</mat-icon>
          <mat-card-title>Cây Danh Mục</mat-card-title>
          <mat-card-subtitle>Xem cấu trúc phân cấp</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content>
          <div class="category-tree">
            <div *ngFor="let mainCategory of getMainCategories()" class="tree-node">
              <div class="main-category">
                <mat-icon>{{ mainCategory.icon || 'folder' }}</mat-icon>
                <strong>{{ mainCategory.name }}</strong>
                <mat-chip>{{ mainCategory.productCount || 0 }} SP</mat-chip>
              </div>
              
              <div class="sub-categories" *ngIf="getSubCategories(mainCategory.slug).length > 0">
                <div *ngFor="let subCategory of getSubCategories(mainCategory.slug)" class="sub-category">
                  <mat-icon>subdirectory_arrow_right</mat-icon>
                  <span>{{ subCategory.name }}</span>
                  <mat-chip>{{ subCategory.productCount || 0 }} SP</mat-chip>
                </div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 20px auto;
      padding: 20px;
    }

    h1 {
      text-align: center;
      margin-bottom: 30px;
      color: #333;
    }

    .form-card, .table-card, .tree-card {
      margin-bottom: 30px;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 10px;
    }

    .full-width {
      width: 100%;
      margin-bottom: 10px;
    }

    .form-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }

    .categories-table {
      width: 100%;
    }

    .category-image {
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: 4px;
    }

    .category-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .category-info small {
      color: #666;
      font-size: 12px;
    }

    .parent-chip {
      font-size: 10px;
      height: 18px;
    }

    .description-text {
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      margin: 0;
      color: #666;
    }

    .loading, .no-data {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .loading mat-spinner {
      margin: 0 auto 20px;
    }

    .no-data mat-icon {
      font-size: 48px;
      color: #ccc;
      margin-bottom: 10px;
    }

    .category-tree {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .tree-node {
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 15px;
    }

    .main-category {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 10px;
      font-size: 16px;
    }

    .sub-categories {
      margin-left: 20px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .sub-category {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;
      font-size: 14px;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .container {
        padding: 10px;
      }

      .categories-table {
        font-size: 14px;
      }
    }
  `]
})
export class CategoryManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ReplicatedProductService);
  private snackBar = inject(MatSnackBar);

  categories: Category[] = [];
  editingCategory: Category | null = null;
  loading = false;

  displayedColumns = ['icon', 'name', 'description', 'sortOrder', 'productCount', 'status', 'actions'];

  categoryForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    slug: ['', Validators.required],
    description: [''],
    image: [''],
    icon: [''],
    parentId: [''],
    isActive: [true],
    sortOrder: [0]
  });

  async ngOnInit() {
    await this.loadCategories();
    
    // Auto-generate slug when name changes
    this.categoryForm.get('name')?.valueChanges.subscribe(name => {
      if (name && !this.editingCategory) {
        const slug = this.generateSlug(name);
        this.categoryForm.patchValue({ slug }, { emitEvent: false });
      }
    });
  }

  async loadCategories() {
    this.loading = true;
    try {
      this.categories = await this.productService.fetchCategories();
    } catch (error) {
      console.error('Error loading categories:', error);
      this.snackBar.open('Lỗi khi tải danh mục!', 'Đóng', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  async saveCategory() {
    if (this.categoryForm.invalid) return;

    this.loading = true;
    try {
      const formValue = this.categoryForm.value;
      const categoryData: Omit<Category, 'id'> = {
        ...formValue,
        productCount: 0,
        children: []
      };

      if (this.editingCategory) {
        await this.productService.updateCategory(this.editingCategory.id, categoryData);
        this.snackBar.open('Cập nhật danh mục thành công!', 'Đóng', { duration: 3000 });
      } else {
        await this.productService.addCategory(categoryData);
        this.snackBar.open('Thêm danh mục thành công!', 'Đóng', { duration: 3000 });
      }

      this.categoryForm.reset();
      this.categoryForm.patchValue({ isActive: true, sortOrder: 0 });
      this.editingCategory = null;
      await this.loadCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      this.snackBar.open('Lỗi khi lưu danh mục!', 'Đóng', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  editCategory(category: Category) {
    this.editingCategory = category;
    this.categoryForm.patchValue({
      name: category.name,
      slug: category.slug,
      description: category.description,
      image: category.image,
      icon: category.icon,
      parentId: category.parentId || '',
      isActive: category.isActive,
      sortOrder: category.sortOrder
    });

    // Scroll to form
    document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingCategory = null;
    this.categoryForm.reset();
    this.categoryForm.patchValue({ isActive: true, sortOrder: 0 });
  }

  async toggleStatus(category: Category) {
    this.loading = true;
    try {
      await this.productService.updateCategory(category.id, { 
        isActive: !category.isActive 
      });
      this.snackBar.open(
        `Danh mục đã ${!category.isActive ? 'kích hoạt' : 'tạm ngưng'}!`, 
        'Đóng', 
        { duration: 3000 }
      );
      await this.loadCategories();
    } catch (error) {
      console.error('Error toggling category status:', error);
      this.snackBar.open('Lỗi khi thay đổi trạng thái!', 'Đóng', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  async deleteCategory(category: Category) {
    // Check if category has subcategories
    const hasSubCategories = this.categories.some(c => c.parentId === category.slug);
    if (hasSubCategories) {
      this.snackBar.open('Không thể xóa danh mục có danh mục con!', 'Đóng', { duration: 3000 });
      return;
    }

    if (!confirm(`Bạn có chắc chắn muốn xóa danh mục "${category.name}"?`)) {
      return;
    }

    this.loading = true;
    try {
      await this.productService.deleteCategory(category.id);
      this.snackBar.open('Xóa danh mục thành công!', 'Đóng', { duration: 3000 });
      await this.loadCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
      this.snackBar.open('Lỗi khi xóa danh mục!', 'Đóng', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  getMainCategories(): Category[] {
    return this.categories.filter(c => !c.parentId);
  }

  getSubCategories(parentSlug: string): Category[] {
    return this.categories.filter(c => c.parentId === parentSlug);
  }

  getParentName(parentId: string): string {
    const parent = this.categories.find(c => c.slug === parentId);
    return parent?.name || 'Không xác định';
  }

  generateSlug(name: string): string {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
  }
}

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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatChipsModule } from '@angular/material/chips';
import { Product, Category } from '../../../models';
import { ReplicatedProductService } from '../../../services/replicated-product.service';

@Component({
  selector: 'app-product-management',
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
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    MatChipsModule
  ],
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss']
})
export class ProductManagementComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ReplicatedProductService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);

  products: Product[] = [];
  categories: Category[] = [];
  editingProduct: Product | null = null;
  loading = false;

  displayedColumns = ['image', 'name', 'category', 'price', 'stock', 'rating', 'actions'];

  productForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    sku: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]],
    category: ['', Validators.required],
    imageUrl: [''],
    rating: [0, [Validators.min(0), Validators.max(5)]]
  });

  async ngOnInit() {
    await this.loadData();
  }

  async loadData() {
    this.loading = true;
    try {
      const [products, categories] = await Promise.all([
        this.productService.fetchProducts(),
        this.productService.fetchCategories()
      ]);
      
      this.products = products;
      this.categories = categories;
    } catch (error) {
      console.error('Error loading data:', error);
      this.snackBar.open('Lỗi khi tải dữ liệu!', 'Đóng', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  async saveProduct() {
    if (this.productForm.invalid) return;

    this.loading = true;
    try {
      const formValue = this.productForm.value;
      console.log('Form value category:', formValue.category); // Debug log
      const productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'> = {
        ...formValue,
        featured: false,
        tags: [],
        images: formValue.imageUrl ? [formValue.imageUrl] : [],
        category: formValue.category, // Use category directly
        specifications: [],
        brand: 'Generic',
        unit: 'cái',
        status: 'active' as const,
        reviewCount: 0
      };
      console.log('Product data to save:', productData); // Debug log

      if (this.editingProduct) {
        await this.productService.updateProduct(this.editingProduct.id, productData);
        this.snackBar.open('Cập nhật sản phẩm thành công!', 'Đóng', { duration: 3000 });
      } else {
        await this.productService.addProduct(productData);
        this.snackBar.open('Thêm sản phẩm thành công!', 'Đóng', { duration: 3000 });
      }

      this.productForm.reset();
      this.editingProduct = null;
      await this.loadData();
    } catch (error) {
      console.error('Error saving product:', error);
      this.snackBar.open('Lỗi khi lưu sản phẩm!', 'Đóng', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  editProduct(product: Product) {
    this.editingProduct = product;
    this.productForm.patchValue({
      name: product.name,
      sku: product.sku,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category, // Use category
      imageUrl: product.images?.[0] || '',
      rating: product.rating
    });

    // Scroll to form
    document.querySelector('.form-card')?.scrollIntoView({ behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingProduct = null;
    this.productForm.reset();
  }

  async deleteProduct(product: Product) {
    if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm "${product.name}"?`)) {
      return;
    }

    this.loading = true;
    try {
      await this.productService.deleteProduct(product.id);
      this.snackBar.open('Xóa sản phẩm thành công!', 'Đóng', { duration: 3000 });
      await this.loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
      this.snackBar.open('Lỗi khi xóa sản phẩm!', 'Đóng', { duration: 3000 });
    } finally {
      this.loading = false;
    }
  }

  getCategoryName(categorySlug: string): string {
    if (!categorySlug) return 'Không xác định';
    
    console.log('Getting category name for slug:', categorySlug);
    console.log('Available categories:', this.categories.map(c => ({ slug: c.slug, name: c.name })));
    
    // Try exact match first
    let category = this.categories.find(c => c.slug === categorySlug);
    
    // If not found, try case-insensitive match
    if (!category) {
      category = this.categories.find(c => c.slug.toLowerCase() === categorySlug.toLowerCase());
    }
    
    // If still not found, try matching by name
    if (!category) {
      category = this.categories.find(c => c.name === categorySlug);
    }
    
    const result = category?.name || categorySlug || 'Không xác định';
    console.log('Category found:', category, 'Returning:', result);
    return result;
  }
}

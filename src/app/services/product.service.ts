import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map, of } from 'rxjs';
import { Product, Category, Cart, CartItem, SearchParams, SearchResult, ProductFilter } from '../models';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [
    {
      id: '1',
      name: 'Xi măng Portland PCB40',
      description: 'Xi măng Portland PCB40 chất lượng cao, phù hợp cho các công trình dân dụng và công nghiệp',
      shortDescription: 'Xi măng chất lượng cao cho xây dựng',
      price: 165000,
      originalPrice: 180000,
      discount: 8,
      category: 'vat-lieu-xay-dung',
      subcategory: 'xi-mang',
      brand: 'Vicem',
      sku: 'XM-PCB40-50KG',
      specifications: [
        { name: 'Khối lượng', value: '50', unit: 'kg' },
        { name: 'Độ bền nén 28 ngày', value: '40', unit: 'MPa' },
        { name: 'Thời gian đông kết đầu', value: '≥45', unit: 'phút' },
        { name: 'Thời gian đông kết cuối', value: '≤375', unit: 'phút' }
      ],
      images: [
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      stock: 500,
      unit: 'bao',
      status: 'active',
      tags: ['xi-mang', 'portland', 'chất-lượng-cao'],
      featured: true,
      rating: 4.5,
      reviewCount: 128,
      weight: 50,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-12-01')
    },
    {
      id: '2',
      name: 'Thép thanh vằn D16 Hòa Phát',
      description: 'Thép thanh vằn D16 Hòa Phát tiêu chuẩn TCVN, độ bền cao, chống ăn mòn tốt',
      shortDescription: 'Thép thanh vằn chất lượng cao',
      price: 18500,
      category: 'vat-lieu-xay-dung',
      subcategory: 'thep-xay-dung',
      brand: 'Hòa Phát',
      sku: 'THEP-D16-HP-12M',
      specifications: [
        { name: 'Đường kính', value: '16', unit: 'mm' },
        { name: 'Chiều dài', value: '12', unit: 'm' },
        { name: 'Khối lượng', value: '18.97', unit: 'kg/thanh' },
        { name: 'Cường độ chảy', value: '≥400', unit: 'MPa' }
      ],
      images: [
        'https://images.unsplash.com/photo-1587293852726-70cdb56c2866?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      stock: 200,
      unit: 'thanh',
      status: 'active',
      tags: ['thép', 'thanh-vằn', 'hòa-phát'],
      featured: true,
      rating: 4.7,
      reviewCount: 95,
      weight: 18.97,
      createdAt: new Date('2024-02-01'),
      updatedAt: new Date('2024-12-01')
    },
    {
      id: '3',
      name: 'Gạch block xây 100x200x400mm',
      description: 'Gạch block không nung, nhẹ, cách nhiệt tốt, thân thiện môi trường',
      shortDescription: 'Gạch block xây dựng chất lượng',
      price: 3200,
      category: 'vat-lieu-xay-dung',
      subcategory: 'gach',
      brand: 'An Cường',
      sku: 'GACH-BLOCK-100x200x400',
      specifications: [
        { name: 'Kích thước', value: '100x200x400', unit: 'mm' },
        { name: 'Khối lượng riêng', value: '1.8-2.0', unit: 'tấn/m³' },
        { name: 'Cường độ nén', value: '≥7.5', unit: 'MPa' },
        { name: 'Độ hút nước', value: '≤15', unit: '%' }
      ],
      images: [
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      stock: 1000,
      unit: 'viên',
      status: 'active',
      tags: ['gạch', 'block', 'không-nung'],
      featured: false,
      rating: 4.3,
      reviewCount: 67,
      weight: 3.2,
      createdAt: new Date('2024-02-15'),
      updatedAt: new Date('2024-12-01')
    },
    {
      id: '4',
      name: 'Máy khoan búa Bosch GBH 2-26 DRE',
      description: 'Máy khoan búa Bosch chuyên nghiệp, công suất 800W, khoan được bê tông cứng',
      shortDescription: 'Máy khoan búa chuyên nghiệp',
      price: 2850000,
      originalPrice: 3200000,
      discount: 11,
      category: 'thiet-bi-may-moc',
      subcategory: 'may-khoan',
      brand: 'Bosch',
      sku: 'BOSCH-GBH-2-26-DRE',
      specifications: [
        { name: 'Công suất', value: '800', unit: 'W' },
        { name: 'Tốc độ không tải', value: '0-900', unit: 'vòng/phút' },
        { name: 'Tần số búa', value: '0-4000', unit: 'nhát/phút' },
        { name: 'Năng lượng búa', value: '2.7', unit: 'J' }
      ],
      images: [
        'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      stock: 25,
      unit: 'cái',
      status: 'active',
      tags: ['máy-khoan', 'bosch', 'chuyên-nghiệp'],
      featured: true,
      rating: 4.8,
      reviewCount: 142,
      weight: 2.9,
      createdAt: new Date('2024-03-01'),
      updatedAt: new Date('2024-12-01')
    },
    {
      id: '5',
      name: 'Dây điện Cadivi CVV 2x2.5',
      description: 'Dây điện Cadivi loại CVV 2 ruột, tiết diện 2.5mm², chất lượng cao, an toàn',
      shortDescription: 'Dây điện chất lượng cao',
      price: 45000,
      category: 'thiet-bi-dien',
      subcategory: 'day-dien',
      brand: 'Cadivi',
      sku: 'CADIVI-CVV-2x2.5-100M',
      specifications: [
        { name: 'Loại dây', value: 'CVV', unit: '' },
        { name: 'Số ruột', value: '2', unit: 'ruột' },
        { name: 'Tiết diện', value: '2.5', unit: 'mm²' },
        { name: 'Chiều dài', value: '100', unit: 'm' }
      ],
      images: [
        'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
      ],
      stock: 150,
      unit: 'cuộn',
      status: 'active',
      tags: ['dây-điện', 'cadivi', 'cvv'],
      featured: false,
      rating: 4.4,
      reviewCount: 89,
      weight: 8.5,
      createdAt: new Date('2024-03-15'),
      updatedAt: new Date('2024-12-01')
    }
  ];

  private categories: Category[] = [
    {
      id: 'vat-lieu-xay-dung',
      name: 'Vật Liệu Xây Dựng',
      slug: 'vat-lieu-xay-dung',
      description: 'Xi măng, cát, sỏi, gạch và các vật liệu xây dựng cơ bản',
      image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      icon: 'construction',
      isActive: true,
      sortOrder: 1,
      productCount: 250,
      children: [
        {
          id: 'xi-mang',
          name: 'Xi Măng',
          slug: 'xi-mang',
          description: 'Các loại xi măng Portland, xi măng hỗn hợp',
          image: '',
          parentId: 'vat-lieu-xay-dung',
          isActive: true,
          sortOrder: 1,
          productCount: 25
        },
        {
          id: 'thep-xay-dung',
          name: 'Thép Xây Dựng',
          slug: 'thep-xay-dung',
          description: 'Thép thanh, thép hộp, thép góc',
          image: '',
          parentId: 'vat-lieu-xay-dung',
          isActive: true,
          sortOrder: 2,
          productCount: 80
        },
        {
          id: 'gach',
          name: 'Gạch',
          slug: 'gach',
          description: 'Gạch nung, gạch block, gạch trang trí',
          image: '',
          parentId: 'vat-lieu-xay-dung',
          isActive: true,
          sortOrder: 3,
          productCount: 120
        }
      ]
    },
    {
      id: 'thiet-bi-may-moc',
      name: 'Thiết Bị & Máy Móc',
      slug: 'thiet-bi-may-moc',
      description: 'Máy khoan, máy cắt, máy trộn và các thiết bị thi công',
      image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      icon: 'build',
      isActive: true,
      sortOrder: 2,
      productCount: 150,
      children: [
        {
          id: 'may-khoan',
          name: 'Máy Khoan',
          slug: 'may-khoan',
          description: 'Máy khoan cầm tay, máy khoan búa',
          image: '',
          parentId: 'thiet-bi-may-moc',
          isActive: true,
          sortOrder: 1,
          productCount: 45
        },
        {
          id: 'may-cat',
          name: 'Máy Cắt',
          slug: 'may-cat',
          description: 'Máy cắt gạch, máy cắt sắt',
          image: '',
          parentId: 'thiet-bi-may-moc',
          isActive: true,
          sortOrder: 2,
          productCount: 35
        }
      ]
    },
    {
      id: 'thiet-bi-dien',
      name: 'Thiết Bị Điện',
      slug: 'thiet-bi-dien',
      description: 'Dây điện, ổ cắm, công tắc và thiết bị điện',
      image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      icon: 'electrical_services',
      isActive: true,
      sortOrder: 3,
      productCount: 200,
      children: [
        {
          id: 'day-dien',
          name: 'Dây Điện',
          slug: 'day-dien',
          description: 'Dây điện CVV, dây điện VCV',
          image: '',
          parentId: 'thiet-bi-dien',
          isActive: true,
          sortOrder: 1,
          productCount: 60
        },
        {
          id: 'o-cam-cong-tac',
          name: 'Ổ Cắm & Công Tắc',
          slug: 'o-cam-cong-tac',
          description: 'Ổ cắm điện, công tắc các loại',
          image: '',
          parentId: 'thiet-bi-dien',
          isActive: true,
          sortOrder: 2,
          productCount: 80
        }
      ]
    },
    {
      id: 'dung-cu-thi-cong',
      name: 'Dụng Cụ Thi Công',
      slug: 'dung-cu-thi-cong',
      description: 'Búa, tua vít, thước đo và các dụng cụ cầm tay',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      icon: 'handyman',
      isActive: true,
      sortOrder: 4,
      productCount: 300
    }
  ];

  // Get all products
  getProducts(params?: SearchParams): Observable<SearchResult<Product>> {
    let filteredProducts = [...this.products];

    // Apply filters
    if (params?.filter) {
      filteredProducts = this.applyFilters(filteredProducts, params.filter);
    }

    // Apply search query
    if (params?.query) {
      const query = params.query.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query) ||
        product.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    if (params?.sortBy) {
      filteredProducts = this.sortProducts(filteredProducts, params.sortBy, params.sortOrder || 'asc');
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const result: SearchResult<Product> = {
      items: paginatedProducts,
      total: filteredProducts.length,
      page,
      limit,
      hasNext: endIndex < filteredProducts.length,
      hasPrev: page > 1
    };

    return of(result);
  }

  // Get product by ID
  getProduct(id: string): Observable<Product | null> {
    const product = this.products.find(p => p.id === id);
    return of(product || null);
  }

  // Get featured products
  getFeaturedProducts(limit: number = 8): Observable<Product[]> {
    const featured = this.products.filter(p => p.featured).slice(0, limit);
    return of(featured);
  }

  // Get categories
  getCategories(): Observable<Category[]> {
    return of(this.categories);
  }

  // Get category by slug
  getCategory(slug: string): Observable<Category | null> {
    const category = this.findCategoryBySlug(this.categories, slug);
    return of(category);
  }

  // Get products by category
  getProductsByCategory(categorySlug: string, params?: SearchParams): Observable<SearchResult<Product>> {
    const categoryProducts = this.products.filter(p => 
      p.category === categorySlug || p.subcategory === categorySlug
    );
    
    let filteredProducts = [...categoryProducts];

    if (params?.filter) {
      filteredProducts = this.applyFilters(filteredProducts, params.filter);
    }

    if (params?.query) {
      const query = params.query.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    }

    if (params?.sortBy) {
      filteredProducts = this.sortProducts(filteredProducts, params.sortBy, params.sortOrder || 'asc');
    }

    const page = params?.page || 1;
    const limit = params?.limit || 12;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    const result: SearchResult<Product> = {
      items: paginatedProducts,
      total: filteredProducts.length,
      page,
      limit,
      hasNext: endIndex < filteredProducts.length,
      hasPrev: page > 1
    };

    return of(result);
  }

  private applyFilters(products: Product[], filter: ProductFilter): Product[] {
    return products.filter(product => {
      if (filter.category && product.category !== filter.category && product.subcategory !== filter.category) {
        return false;
      }
      if (filter.brand && product.brand !== filter.brand) {
        return false;
      }
      if (filter.priceRange) {
        if (product.price < filter.priceRange.min || product.price > filter.priceRange.max) {
          return false;
        }
      }
      if (filter.rating && product.rating < filter.rating) {
        return false;
      }
      if (filter.inStock && product.stock <= 0) {
        return false;
      }
      if (filter.featured !== undefined && product.featured !== filter.featured) {
        return false;
      }
      if (filter.tags && filter.tags.length > 0) {
        const hasMatchingTag = filter.tags.some(tag => product.tags.includes(tag));
        if (!hasMatchingTag) {
          return false;
        }
      }
      return true;
    });
  }

  private sortProducts(products: Product[], sortBy: string, sortOrder: 'asc' | 'desc'): Product[] {
    return products.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'name':
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'rating':
          aValue = a.rating;
          bValue = b.rating;
          break;
        case 'createdAt':
          aValue = a.createdAt.getTime();
          bValue = b.createdAt.getTime();
          break;
        case 'discount':
          aValue = a.discount || 0;
          bValue = b.discount || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortOrder === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortOrder === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }

  private findCategoryBySlug(categories: Category[], slug: string): Category | null {
    for (const category of categories) {
      if (category.slug === slug) {
        return category;
      }
      if (category.children) {
        const found = this.findCategoryBySlug(category.children, slug);
        if (found) {
          return found;
        }
      }
    }
    return null;
  }
}

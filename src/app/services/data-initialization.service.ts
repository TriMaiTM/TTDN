import { Injectable } from '@angular/core';
import { DirectFirebaseService } from './direct-firebase.service';
import { Product, Category } from '../models';

@Injectable({
  providedIn: 'root'
})
export class DataInitializationService {
  
  constructor(private directFirebaseService: DirectFirebaseService) {}

  // Khởi tạo dữ liệu mẫu vào Firebase
  async initializeSampleData(): Promise<void> {
    try {
      console.log('🔄 Bắt đầu khởi tạo dữ liệu mẫu...');
      
      // 1. Tạo categories trước
      await this.createCategories();
      console.log('✅ Đã tạo categories');
      
      // 2. Tạo products
      await this.createProducts();
      console.log('✅ Đã tạo products');
      
      console.log('🎉 Hoàn thành khởi tạo dữ liệu!');
    } catch (error) {
      console.error('❌ Lỗi khởi tạo dữ liệu:', error);
    }
  }

  private async createCategories(): Promise<void> {
    const categories: Omit<Category, 'id'>[] = [
      {
        name: 'Vật Liệu Xây Dựng',
        slug: 'vat-lieu-xay-dung',
        description: 'Xi măng, cát, sỏi, gạch và các vật liệu xây dựng cơ bản',
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        icon: 'construction',
        isActive: true,
        sortOrder: 1,
        productCount: 250
      },
      {
        name: 'Xi Măng',
        slug: 'xi-mang',
        description: 'Các loại xi măng Portland, xi măng hỗn hợp',
        image: '',
        parentId: 'vat-lieu-xay-dung', // Sẽ được update sau
        isActive: true,
        sortOrder: 1,
        productCount: 25
      },
      {
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
        name: 'Gạch',
        slug: 'gach',
        description: 'Gạch nung, gạch block, gạch trang trí',
        image: '',
        parentId: 'vat-lieu-xay-dung',
        isActive: true,
        sortOrder: 3,
        productCount: 120
      },
      {
        name: 'Thiết Bị & Máy Móc',
        slug: 'thiet-bi-may-moc',
        description: 'Máy khoan, máy cắt, máy trộn và các thiết bị thi công',
        image: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        icon: 'build',
        isActive: true,
        sortOrder: 2,
        productCount: 150
      },
      {
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
        name: 'Máy Cắt',
        slug: 'may-cat',
        description: 'Máy cắt gạch, máy cắt sắt',
        image: '',
        parentId: 'thiet-bi-may-moc',
        isActive: true,
        sortOrder: 2,
        productCount: 35
      },
      {
        name: 'Thiết Bị Điện',
        slug: 'thiet-bi-dien',
        description: 'Dây điện, ổ cắm, công tắc và thiết bị điện',
        image: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        icon: 'electrical_services',
        isActive: true,
        sortOrder: 3,
        productCount: 200
      },
      {
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
        name: 'Ổ Cắm & Công Tắc',
        slug: 'o-cam-cong-tac',
        description: 'Ổ cắm điện, công tắc các loại',
        image: '',
        parentId: 'thiet-bi-dien',
        isActive: true,
        sortOrder: 2,
        productCount: 80
      },
      {
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

    for (const category of categories) {
      await this.directFirebaseService.addCategory(category);
    }
  }

  private async createProducts(): Promise<void> {
    const products: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>[] = [
      {
        name: 'Xi măng Portland PCB40',
        description: 'Xi măng Portland PCB40 chất lượng cao, phù hợp cho các công trình dân dụng và công nghiệp. Sản phẩm đạt tiêu chuẩn TCVN 2682:2009, có độ bền nén cao và thời gian đông kết ổn định.',
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
        weight: 50
      },
      {
        name: 'Thép thanh vằn D16 Hòa Phát',
        description: 'Thép thanh vằn D16 Hòa Phát tiêu chuẩn TCVN, độ bền cao, chống ăn mòn tốt. Thích hợp cho các công trình bê tông cốt thép, đảm bảo độ bền và an toàn.',
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
        weight: 18.97
      },
      {
        name: 'Gạch block xây 100x200x400mm',
        description: 'Gạch block không nung, nhẹ, cách nhiệt tốt, thân thiện môi trường. Sản phẩm được sản xuất theo công nghệ hiện đại, đảm bảo độ đồng đều và chất lượng.',
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
        weight: 3.2
      },
      {
        name: 'Máy khoan búa Bosch GBH 2-26 DRE',
        description: 'Máy khoan búa Bosch chuyên nghiệp, công suất 800W, khoan được bê tông cứng. Thiết kế ergonomic, độ rung thấp, đảm bảo hiệu suất làm việc cao và bền bỉ.',
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
        weight: 2.9
      },
      {
        name: 'Dây điện Cadivi CVV 2x2.5',
        description: 'Dây điện Cadivi loại CVV 2 ruột, tiết diện 2.5mm², chất lượng cao, an toàn. Vỏ bọc PVC bền, chống cháy, phù hợp cho hệ thống điện dân dụng và công nghiệp nhẹ.',
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
        weight: 8.5
      },
      {
        name: 'Máy cắt gạch Makita CC02R1',
        description: 'Máy cắt gạch Makita công nghệ Nhật Bản, pin 12V, cắt chính xác, độ bền cao. Thiết kế compact, tiện lợi cho các công việc cắt gạch, ceramic trong xây dựng.',
        shortDescription: 'Máy cắt gạch chính xác',
        price: 3200000,
        originalPrice: 3500000,
        discount: 9,
        category: 'thiet-bi-may-moc',
        subcategory: 'may-cat',
        brand: 'Makita',
        sku: 'MAKITA-CC02R1',
        specifications: [
          { name: 'Điện áp pin', value: '12', unit: 'V' },
          { name: 'Đường kính lưỡi cắt', value: '85', unit: 'mm' },
          { name: 'Độ sâu cắt tối đa', value: '26', unit: 'mm' },
          { name: 'Trọng lượng', value: '1.4', unit: 'kg' }
        ],
        images: [
          'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        stock: 15,
        unit: 'cái',
        status: 'active',
        tags: ['máy-cắt', 'makita', 'pin'],
        featured: true,
        rating: 4.6,
        reviewCount: 73,
        weight: 1.4
      },
      {
        name: 'Ổ cắm đôi Schneider Electric',
        description: 'Ổ cắm đôi Schneider Electric loại âm tường, an toàn cao, thiết kế đẹp mắt. Chất liệu PC chống cháy, tiếp xúc đồng nguyên chất, bảo hành 5 năm.',
        shortDescription: 'Ổ cắm đôi cao cấp',
        price: 125000,
        category: 'thiet-bi-dien',
        subcategory: 'o-cam-cong-tac',
        brand: 'Schneider Electric',
        sku: 'SCHNEIDER-SOCKET-DOUBLE',
        specifications: [
          { name: 'Loại', value: 'Ổ cắm đôi âm tường', unit: '' },
          { name: 'Điện áp định mức', value: '250', unit: 'V' },
          { name: 'Dòng điện định mức', value: '16', unit: 'A' },
          { name: 'Chuẩn bảo vệ', value: 'IP20', unit: '' }
        ],
        images: [
          'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        stock: 100,
        unit: 'cái',
        status: 'active',
        tags: ['ổ-cắm', 'schneider', 'âm-tường'],
        featured: false,
        rating: 4.5,
        reviewCount: 156,
        weight: 0.2
      },
      {
        name: 'Búa tạ Stanley 500g',
        description: 'Búa tạ Stanley 500g chuyên dụng, cán thép chắc chắn, đầu búa cứng, chống gỉ. Thiết kế ergonomic, cầm nắm thoải mái, phù hợp cho nhiều công việc xây dựng.',
        shortDescription: 'Búa tạ chuyên dụng',
        price: 95000,
        category: 'dung-cu-thi-cong',
        brand: 'Stanley',
        sku: 'STANLEY-HAMMER-500G',
        specifications: [
          { name: 'Trọng lượng đầu búa', value: '500', unit: 'g' },
          { name: 'Chiều dài cán', value: '32', unit: 'cm' },
          { name: 'Chất liệu cán', value: 'Thép carbon', unit: '' },
          { name: 'Chất liệu đầu búa', value: 'Thép tôi', unit: '' }
        ],
        images: [
          'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
        ],
        stock: 50,
        unit: 'cái',
        status: 'active',
        tags: ['búa', 'stanley', 'dụng-cụ'],
        featured: false,
        rating: 4.2,
        reviewCount: 89,
        weight: 0.7
      }
    ];

    for (const product of products) {
      await this.directFirebaseService.addProduct(product);
    }
  }

  // Kiểm tra xem dữ liệu đã được khởi tạo chưa
  async checkDataExists(): Promise<boolean> {
    try {
      return await this.directFirebaseService.checkDataExists();
    } catch (error) {
      return false;
    }
  }
}

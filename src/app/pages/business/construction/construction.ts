import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-construction',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './construction.html',
  styleUrls: ['./construction.scss']
})
export class ConstructionComponent {
  services = [
    {
      title: 'Xây dựng dân dụng',
      icon: 'home',
      description: 'Thi công các công trình nhà ở, chung cư, biệt thự',
      features: [
        'Nhà ở cá nhân, biệt thự',
        'Chung cư, nhà tập thể',
        'Nhà phố thương mại',
        'Cải tạo, sửa chữa nhà cũ'
      ]
    },
    {
      title: 'Xây dựng công nghiệp',
      icon: 'factory',
      description: 'Thi công nhà máy, kho bãi, công trình công nghiệp',
      features: [
        'Nhà máy sản xuất',
        'Kho bãi logistics',
        'Trung tâm phân phối',
        'Công trình hạ tầng'
      ]
    },
    {
      title: 'Xây dựng thương mại',
      icon: 'storefront',
      description: 'Thi công các công trình thương mại, dịch vụ',
      features: [
        'Trung tâm thương mại',
        'Văn phòng, tòa nhà',
        'Khách sạn, resort',
        'Siêu thị, cửa hàng'
      ]
    },
    {
      title: 'Hạ tầng kỹ thuật',
      icon: 'foundation',
      description: 'Thi công các công trình hạ tầng đô thị',
      features: [
        'Đường giao thông',
        'Cầu, cống, hầm',
        'Hệ thống cấp thoát nước',
        'Điện, viễn thông'
      ]
    }
  ];

  projects = [
    {
      title: 'Nhà máy sản xuất Samsung',
      description: 'Thi công xây dựng nhà máy sản xuất điện tử hiện đại',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=400',
      area: '15,000m²',
      duration: '12 tháng',
      location: 'Bắc Ninh'
    },
    {
      title: 'Khu chung cư Vinhomes',
      description: 'Xây dựng khu chung cư cao cấp với đầy đủ tiện ích',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400',
      area: '50,000m²',
      duration: '24 tháng',
      location: 'TP. Hồ Chí Minh'
    },
    {
      title: 'Trung tâm thương mại AEON',
      description: 'Thi công trung tâm thương mại đa chức năng hiện đại',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400',
      area: '8,500m²',
      duration: '15 tháng',
      location: 'Hà Nội'
    }
  ];

  capabilities = [
    {
      title: 'Công nghệ thi công',
      icon: 'precision_manufacturing',
      description: 'Ứng dụng công nghệ hiện đại trong thi công'
    },
    {
      title: 'Quản lý chất lượng',
      icon: 'verified',
      description: 'Hệ thống quản lý chất lượng ISO 9001:2015'
    },
    {
      title: 'An toàn lao động',
      icon: 'security',
      description: 'Tuân thủ nghiêm ngặt các quy định về ATVSLĐ'
    },
    {
      title: 'Tiến độ đảm bảo',
      icon: 'schedule',
      description: 'Cam kết bàn giao đúng tiến độ đã thỏa thuận'
    }
  ];
}

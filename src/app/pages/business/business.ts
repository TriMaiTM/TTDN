import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-business',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './business.html',
  styleUrls: ['./business.scss']
})
export class BusinessComponent {
  constructor(private router: Router) {}
  
  businessActivities = [
    {
      title: 'Xây dựng Dân dụng',
      icon: 'home',
      description: 'Chuyên thi công các công trình dân dụng: nhà ở, chung cư, biệt thự...',
      details: [
        'Thiết kế và thi công nhà ở cá nhân',
        'Xây dựng chung cư cao tầng', 
        'Thi công biệt thự, villa sang trọng',
        'Cải tạo, sửa chữa nhà cũ'
      ]
    },
    {
      title: 'Xây dựng Công nghiệp',
      icon: 'business',
      description: 'Thi công các công trình công nghiệp quy mô lớn với tiêu chuẩn cao',
      details: [
        'Nhà máy, kho bãi công nghiệp',
        'Trung tâm logistics, warehouse',
        'Công trình hạ tầng kỹ thuật',
        'Hệ thống điện, nước công nghiệp'
      ]
    },
    {
      title: 'Tư vấn Thiết kế',
      icon: 'architecture',
      description: 'Dịch vụ tư vấn và thiết kế chuyên nghiệp cho mọi loại công trình',
      details: [
        'Thiết kế kiến trúc và nội thất',
        'Tư vấn kết cấu và M&E',
        'Lập hồ sơ pháp lý xây dựng',
        'Giám sát thi công chuyên nghiệp'
      ]
    },
    {
      title: 'Thương mại Vật tư',
      icon: 'store',
      description: 'Cung cấp vật tư xây dựng chất lượng cao từ các thương hiệu uy tín',
      details: [
        'Thép xây dựng các loại',
        'Xi măng, cát, sỏi đá',
        'Gạch block, gạch ốp lát',
        'Thiết bị điện, nước, PCCC'
      ]
    }
  ];

  getRouteForActivity(title: string): string {
    switch (title) {
      case 'Xây dựng Dân dụng':
      case 'Xây dựng Công nghiệp':
        return '/business/construction';
      case 'Tư vấn Thiết kế':
        return '/business/consulting';
      case 'Thương mại Vật tư':
        return '/business/materials';
      default:
        return '/business';
    }
  }
}
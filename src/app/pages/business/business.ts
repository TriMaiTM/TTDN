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
      title: 'Thi công xây dựng',
      icon: 'construction',
      description: 'Chuyên thi công các công trình dân dụng và công nghiệp với chất lượng cao',
      details: [
        'Thi công nhà ở, biệt thự, chung cư',
        'Xây dựng nhà máy, kho bãi công nghiệp',
        'Thi công hạ tầng kỹ thuật',
        'Cải tạo và sửa chữa công trình'
      ]
    },
    {
      title: 'Tư vấn thiết kế',
      icon: 'design_services',
      description: 'Dịch vụ tư vấn và thiết kế kiến trúc, kết cấu chuyên nghiệp',
      details: [
        'Thiết kế kiến trúc và nội thất',
        'Tư vấn kết cấu công trình',
        'Thiết kế hệ thống M&E',
        'Lập bản vẽ thi công chi tiết'
      ]
    },
    {
      title: 'Tư vấn giám sát và quản lý dự án',
      icon: 'supervisor_account',
      description: 'Dịch vụ giám sát thi công và quản lý dự án toàn diện',
      details: [
        'Giám sát chất lượng thi công',
        'Quản lý tiến độ dự án',
        'Kiểm soát chi phí và ngân sách',
        'Điều phối các bên liên quan'
      ]
    },
    {
      title: 'Tư vấn pháp lý',
      icon: 'gavel',
      description: 'Tư vấn pháp lý và thủ tục liên quan đến xây dựng',
      details: [
        'Lập hồ sơ xin phép xây dựng',
        'Tư vấn pháp luật xây dựng',
        'Giải quyết tranh chấp xây dựng',
        'Thủ tục nghiệm thu công trình'
      ]
    }
  ];  getRouteForActivity(title: string): string {
    switch (title) {
      case 'Thi công xây dựng':
        return '/business/construction';
      case 'Tư vấn thiết kế':
        return '/business/design';
      case 'Tư vấn giám sát và quản lý dự án':
        return '/business/supervision';
      case 'Tư vấn pháp lý':
        return '/business/legal';
      default:
        return '/business';
    }
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-design',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './design.html',
  styleUrls: ['./design.scss']
})
export class DesignComponent {
  services = [
    {
      title: 'Thiết kế kiến trúc',
      icon: 'architecture',
      description: 'Thiết kế kiến trúc độc đáo, hiện đại phù hợp với xu hướng',
      features: [
        'Thiết kế concept độc đáo',
        'Tối ưu hóa không gian sống',
        'Phù hợp với phong thủy',
        'Ứng dụng công nghệ BIM'
      ]
    },
    {
      title: 'Thiết kế kết cấu',
      icon: 'engineering',
      description: 'Tính toán và thiết kế kết cấu chịu lực an toàn, tối ưu',
      features: [
        'Tính toán kết cấu chính xác',
        'Tối ưu hóa vật liệu',
        'Đảm bảo an toàn tuyệt đối',
        'Tuân thủ tiêu chuẩn Việt Nam'
      ]
    },
    {
      title: 'Thiết kế M&E',
      icon: 'electrical_services',
      description: 'Thiết kế hệ thống điện, nước, HVAC, PCCC chuyên nghiệp',
      features: [
        'Hệ thống điện thông minh',
        'Thiết kế cấp thoát nước',
        'Hệ thống HVAC tiết kiệm năng lượng',
        'Hệ thống PCCC hiện đại'
      ]
    },
    {
      title: 'Thiết kế nội thất',
      icon: 'chair',
      description: 'Thiết kế nội thất sang trọng, tiện nghi và thẩm mỹ cao',
      features: [
        'Phong cách thiết kế đa dạng',
        'Nội thất cao cấp, bền đẹp',
        'Tối ưu hóa công năng sử dụng',
        'Hài hòa với kiến trúc tổng thể'
      ]
    }
  ];

  process = [
    {
      step: 1,
      title: 'Khảo sát và tư vấn',
      description: 'Khảo sát thực địa, tìm hiểu nhu cầu khách hàng'
    },
    {
      step: 2,
      title: 'Ý tưởng thiết kế',
      description: 'Đưa ra ý tưởng thiết kế phù hợp với yêu cầu'
    },
    {
      step: 3,
      title: 'Thiết kế sơ bộ',
      description: 'Lập bản vẽ thiết kế sơ bộ để khách hàng thảo luận'
    },
    {
      step: 4,
      title: 'Thiết kế chi tiết',
      description: 'Hoàn thiện bản vẽ thi công chi tiết đầy đủ'
    }
  ];

  projects = [
    {
      name: 'Biệt thự hiện đại Thảo Điền',
      location: 'TP. Hồ Chí Minh',
      area: '500m²',
      style: 'Hiện đại tối giản',
      image: 'assets/images/design-project1.jpg'
    },
    {
      name: 'Nhà phố liền kề Garden City',
      location: 'Hà Nội',
      area: '150m²',
      style: 'Tân cổ điển',
      image: 'assets/images/design-project2.jpg'
    },
    {
      name: 'Chung cư cao cấp Landmark',
      location: 'Đà Nẵng',
      area: '100m²',
      style: 'Scandinavia',
      image: 'assets/images/design-project3.jpg'
    }
  ];
}

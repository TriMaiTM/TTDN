import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-consulting',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './consulting.html',
  styleUrls: ['./consulting.scss']
})
export class ConsultingComponent {
  services = [
    {
      title: 'Thiết kế kiến trúc',
      description: 'Thiết kế kiến trúc chuyên nghiệp từ ý tưởng đến bản vẽ hoàn chỉnh',
      icon: 'architecture',
      features: ['Thiết kế 2D/3D', 'Phối cảnh chân thực', 'Tối ưu không gian', 'Tuân thủ quy chuẩn']
    },
    {
      title: 'Tư vấn kết cấu',
      description: 'Tính toán và thiết kế kết cấu an toàn, tối ưu chi phí',
      icon: 'engineering',
      features: ['Tính toán kết cấu', 'Thiết kế móng', 'Kiểm định chất lượng', 'Giám sát thi công']
    },
    {
      title: 'Thiết kế M&E',
      description: 'Hệ thống cơ điện hiện đại, tiết kiệm năng lượng',
      icon: 'electrical_services',
      features: ['Hệ thống điện', 'Hệ thống nước', 'Điều hòa thông gió', 'Hệ thống an ninh']
    }
  ];
}

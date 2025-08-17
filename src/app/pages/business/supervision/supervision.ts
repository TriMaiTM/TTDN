import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-supervision',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './supervision.html',
  styleUrls: ['./supervision.scss']
})
export class SupervisionComponent {
  services = [
    {
      title: 'Giám sát chất lượng',
      icon: 'verified',
      description: 'Kiểm soát chất lượng thi công theo tiêu chuẩn cao nhất',
      features: [
        'Kiểm tra chất lượng vật liệu',
        'Giám sát quy trình thi công',
        'Đảm bảo an toàn lao động',
        'Báo cáo tiến độ định kỳ'
      ]
    },
    {
      title: 'Quản lý tiến độ',
      icon: 'schedule',
      description: 'Điều phối và quản lý tiến độ dự án hiệu quả',
      features: [
        'Lập kế hoạch chi tiết',
        'Theo dõi milestone',
        'Điều chỉnh tiến độ kịp thời',
        'Tối ưu hóa nguồn lực'
      ]
    },
    {
      title: 'Kiểm soát chi phí',
      icon: 'account_balance',
      description: 'Quản lý ngân sách và kiểm soát chi phí dự án',
      features: [
        'Lập dự toán chi tiết',
        'Theo dõi chi phí thực tế',
        'Kiểm soát biến động giá',
        'Tối ưu hóa chi phí'
      ]
    },
    {
      title: 'Điều phối các bên',
      icon: 'groups',
      description: 'Phối hợp hiệu quả giữa các bên tham gia dự án',
      features: [
        'Họp điều phối định kỳ',
        'Giải quyết xung đột',
        'Quản lý thông tin dự án',
        'Đảm bảo giao tiếp hiệu quả'
      ]
    }
  ];

  benefits = [
    {
      icon: 'trending_up',
      title: 'Nâng cao hiệu quả',
      description: 'Tối ưu hóa quy trình và nâng cao hiệu quả thực hiện dự án'
    },
    {
      icon: 'savings',
      title: 'Tiết kiệm chi phí',
      description: 'Kiểm soát chặt chẽ ngân sách và giảm thiểu rủi ro phát sinh'
    },
    {
      icon: 'security',
      title: 'Đảm bảo chất lượng',
      description: 'Giám sát chặt chẽ mọi công đoạn để đảm bảo chất lượng tối ưu'
    },
    {
      icon: 'access_time',
      title: 'Đúng tiến độ',
      description: 'Quản lý thời gian hiệu quả, bàn giao đúng cam kết'
    }
  ];

  process = [
    {
      phase: 'KHỞI ĐỘNG',
      activities: [
        'Nghiên cứu hồ sơ dự án',
        'Lập kế hoạch giám sát',
        'Thiết lập quy trình quản lý',
        'Họp khởi động dự án'
      ]
    },
    {
      phase: 'THI CÔNG',
      activities: [
        'Giám sát hàng ngày',
        'Kiểm tra chất lượng',
        'Báo cáo tiến độ',
        'Xử lý các vấn đề phát sinh'
      ]
    },
    {
      phase: 'NGHIỆM THU',
      activities: [
        'Kiểm tra tổng thể',
        'Lập báo cáo nghiệm thu',
        'Bàn giao công trình',
        'Đánh giá dự án'
      ]
    }
  ];

  projects = [
    {
      name: 'Dự án Chung cư Vinhomes',
      location: 'TP. Hồ Chí Minh',
      value: '500 tỷ VNĐ',
      duration: '24 tháng',
      status: 'Hoàn thành',
      image: 'assets/images/supervision-project1.jpg'
    },
    {
      name: 'Nhà máy Samsung',
      location: 'Bắc Ninh',
      value: '1.2 tỷ USD',
      duration: '18 tháng',
      status: 'Đang thực hiện',
      image: 'assets/images/supervision-project2.jpg'
    }
  ];
}

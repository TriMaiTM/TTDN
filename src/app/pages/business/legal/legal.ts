import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-legal',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, RouterModule],
  templateUrl: './legal.html',
  styleUrls: ['./legal.scss']
})
export class LegalComponent {
  services = [
    {
      title: 'Thủ tục xin phép xây dựng',
      icon: 'description',
      description: 'Hỗ trợ hoàn thiện hồ sơ xin phép xây dựng theo quy định',
      details: [
        'Lập hồ sơ xin giấy phép xây dựng',
        'Thủ tục thẩm định thiết kế',
        'Xin phép động thổ',
        'Hỗ trợ tiến độ xử lý hồ sơ'
      ]
    },
    {
      title: 'Tư vấn pháp luật xây dựng',
      icon: 'gavel',
      description: 'Tư vấn về các quy định pháp luật trong lĩnh vực xây dựng',
      details: [
        'Luật Xây dựng và các nghị định',
        'Quy chuẩn kỹ thuật xây dựng',
        'Quy định về an toàn lao động',
        'Pháp luật về đất đai liên quan'
      ]
    },
    {
      title: 'Giải quyết tranh chấp',
      icon: 'balance',
      description: 'Hỗ trợ giải quyết các tranh chấp phát sinh trong xây dựng',
      details: [
        'Tranh chấp hợp đồng xây dựng',
        'Tranh chấp chất lượng công trình',
        'Tranh chấp bồi thường thiệt hại',
        'Tư vấn giải pháp pháp lý'
      ]
    },
    {
      title: 'Nghiệm thu và bàn giao',
      icon: 'assignment_turned_in',
      description: 'Hỗ trợ thủ tục nghiệm thu và bàn giao công trình',
      details: [
        'Nghiệm thu công trình hoàn thành',
        'Lập biên bản nghiệm thu',
        'Thủ tục bàn giao công trình',
        'Cấp giấy chứng nhận nghiệm thu'
      ]
    }
  ];

  legalAreas = [
    {
      title: 'Pháp luật Xây dựng',
      icon: 'account_balance',
      laws: [
        'Luật Xây dựng 2014',
        'Nghị định 15/2021/NĐ-CP',
        'Thông tư 01/2021/TT-BXD',
        'Quyết định 1329/QĐ-BXD'
      ]
    },
    {
      title: 'Quy chuẩn kỹ thuật',
      icon: 'engineering',
      laws: [
        'QCVN 01:2021/BXD',
        'TCVN 9362:2012',
        'TCVN 2737:2023',
        'TCVN 5574:2018'
      ]
    },
    {
      title: 'An toàn lao động',
      icon: 'security',
      laws: [
        'Luật An toàn lao động 2015',
        'Nghị định 44/2016/NĐ-CP',
        'Thông tư 15/2016/TT-BLĐTBXH',
        'Quyết định 3733/2002/QĐ-BXD'
      ]
    }
  ];

  process = [
    {
      step: 1,
      title: 'Tiếp nhận yêu cầu',
      description: 'Gặp gỡ, tìm hiểu nhu cầu tư vấn của khách hàng',
      icon: 'contact_support'
    },
    {
      step: 2,
      title: 'Phân tích pháp lý',
      description: 'Nghiên cứu, phân tích các vấn đề pháp lý liên quan',
      icon: 'search'
    },
    {
      step: 3,
      title: 'Đưa ra giải pháp',
      description: 'Tư vấn các giải pháp pháp lý phù hợp và khả thi',
      icon: 'lightbulb'
    },
    {
      step: 4,
      title: 'Hỗ trợ thực hiện',
      description: 'Đồng hành hỗ trợ khách hàng thực hiện các thủ tục',
      icon: 'support_agent'
    }
  ];

  faqs = [
    {
      question: 'Thủ tục xin giấy phép xây dựng mất bao lâu?',
      answer: 'Thời gian xử lý hồ sơ xin giấy phép xây dựng thường từ 20-45 ngày làm việc tùy theo quy mô và loại công trình.'
    },
    {
      question: 'Cần chuẩn bị những giấy tờ gì để xin phép xây dựng?',
      answer: 'Cần có: quyền sử dụng đất, thiết kế cơ sở, báo cáo đánh giá tác động môi trường, và các giấy tờ liên quan khác.'
    },
    {
      question: 'Chi phí tư vấn pháp lý được tính như thế nào?',
      answer: 'Chi phí được tính dựa trên độ phức tạp của vụ việc, thời gian tư vấn và các dịch vụ cụ thể mà khách hàng yêu cầu.'
    }
  ];
}

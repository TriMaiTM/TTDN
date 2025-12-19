import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header';
import { FooterComponent } from './components/footer/footer';
import { trigger, transition, style, query, group, animate } from '@angular/animations';
import { filter } from 'rxjs/operators';

// THÊM: Import Firebase để kiểm tra
import { getApp } from 'firebase/app';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        query(':enter, :leave', style({ position: 'absolute', width: '100%' }), { optional: true }),
        group([
          query(':enter', [
            style({ opacity: 0, transform: 'translateY(10px)' }),
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ], { optional: true }),
          query(':leave', [
            animate('200ms ease-out', style({ opacity: 0, transform: 'translateY(-10px)' }))
          ], { optional: true })
        ])
      ])
    ])
  ]
})
export class AppComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit() {
    // ---------------------------------------------------------
    // CODE KIỂM TRA KẾT NỐI (Chỉ dùng để debug)
    try {
      const app = getApp(); // Lấy App Firebase mặc định đang chạy
      console.log('--- KIỂM TRA KẾT NỐI FIREBASE ---');
      console.log('Project ID đang chạy:', app.options.projectId);

      if (app.options.projectId === 'ttdn-main') { // Thay 'ttdn-main' bằng ID thật của project Main
        console.log('✅ TUYỆT VỜI! App đang chạy trên Database TRUNG TÂM (Main).');
      } else {
        console.warn('⚠️ CẢNH BÁO: App vẫn đang chạy trên Database cũ:', app.options.projectId);
      }
      console.log('-----------------------------------');
    } catch (e) {
      console.error('Lỗi: Chưa khởi tạo Firebase App nào cả!');
    }
    // ---------------------------------------------------------

    // Auto scroll to top on route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);
    });
  }

  public prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
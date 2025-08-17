import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface Slide {
  image: string;       // đường dẫn đến ảnh, ví dụ 'assets/images/hero1.jpg'
  title?: string;      // tiêu đề lớn (có thể multi-line)
  subtitle?: string;   // dòng mô tả ngắn
  logo?: string;       // (tùy) logo overlay
  ctaText?: string;    // (tùy) nút CTA
  ctaLink?: string;    // (tùy) link CTA (router)
}

@Component({
  selector: 'app-hero-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './carousel.html',
  styleUrls: ['./carousel.scss']
})
export class CarouselComponent implements OnInit, OnDestroy {
  @Input() slides: Slide[] = [];

  current = 0;
  autoplay = true;
  intervalMs = 5000; // thời gian chuyển (ms)
  private timer: any = null;

  ngOnInit(): void {
    if (!this.slides || this.slides.length === 0) {
      // fallback demo slides nếu chưa truyền slides
      this.slides = [
        { image: 'assets/images/hero1.jpg', title: 'CÔNG TY CỔ PHẦN ĐẦU TƯ XÂY DỰNG', subtitle: 'VIỆT PHÁP HOLDINGS'},
        { image: 'assets/images/hero2.jpg', title: 'DỰ ÁN TIÊU BIỂU', subtitle: 'Chất lượng - Tiến độ - An toàn' },
        { image: 'assets/images/hero3.jpg', title: 'GIẢI PHÁP VẬT TƯ TOÀN DIỆN', subtitle: 'Cung cấp vật tư chính hãng' }
      ];
    }
    this.startAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  startAutoplay() {
    if (!this.autoplay) return;
    this.stopAutoplay();
    this.timer = setInterval(() => this.next(), this.intervalMs);
  }

  stopAutoplay() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  goTo(index: number) {
    if (index < 0) index = this.slides.length - 1;
    if (index >= this.slides.length) index = 0;
    this.current = index;
  }

  prev() {
    this.goTo((this.current - 1 + this.slides.length) % this.slides.length);
  }

  next() {
    this.goTo((this.current + 1) % this.slides.length);
  }

  onMouseEnter() { this.stopAutoplay(); }
  onMouseLeave() { this.startAutoplay(); }

  // keyboard support
  onKey(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') this.prev();
    if (event.key === 'ArrowRight') this.next();
  }
}

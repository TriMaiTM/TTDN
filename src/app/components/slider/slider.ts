import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-slider',
  standalone: true,
  templateUrl: './slider.html',
  styleUrls: ['./slider.scss'],
  imports: [CommonModule]
})
export class SliderComponent implements OnInit, OnDestroy {
  images = [
    'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=600&fit=crop',
    'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&h=600&fit=crop'
  ];
  
  currentIndex = 0;
  autoplayInterval: any = null;
  isAutoplayActive = true;

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Delay để đảm bảo component render xong
    setTimeout(() => {
      this.startAutoplay();
    }, 1000);
  }

  ngOnDestroy() {
    this.stopAutoplay();
  }

  prev() {
    this.stopAutoplay();
    this.currentIndex = this.currentIndex === 0 ? this.images.length - 1 : this.currentIndex - 1;
    this.cdr.detectChanges();
    
    // Restart autoplay sau 3 giây
    setTimeout(() => {
      if (this.isAutoplayActive) {
        this.startAutoplay();
      }
    }, 3000);
  }

  next() {
    this.stopAutoplay();
    this.currentIndex = this.currentIndex === this.images.length - 1 ? 0 : this.currentIndex + 1;
    this.cdr.detectChanges();
    
    // Restart autoplay sau 3 giây
    setTimeout(() => {
      if (this.isAutoplayActive) {
        this.startAutoplay();
      }
    }, 3000);
  }

  goToSlide(index: number) {
    this.stopAutoplay();
    this.currentIndex = index;
    this.cdr.detectChanges();
    
    // Restart autoplay sau 3 giây
    setTimeout(() => {
      if (this.isAutoplayActive) {
        this.startAutoplay();
      }
    }, 3000);
  }

  startAutoplay() {
    this.stopAutoplay();
    this.autoplayInterval = setInterval(() => {
      this.currentIndex = this.currentIndex === this.images.length - 1 ? 0 : this.currentIndex + 1;
      this.cdr.detectChanges();
    }, 5000);
  }

  stopAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
    }
  }

  onMouseEnter() {
    this.isAutoplayActive = false;
    this.stopAutoplay();
  }

  onMouseLeave() {
    this.isAutoplayActive = true;
    this.startAutoplay();
  }
}

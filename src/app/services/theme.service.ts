import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  // Signal để track dark mode state
  private _isDarkMode = signal(false);
  
  // Public readonly signal
  readonly isDarkMode = this._isDarkMode.asReadonly();

  constructor() {
    // Kiểm tra localStorage hoặc system preference
    this.initializeTheme();
    
    // Effect để cập nhật DOM khi theme thay đổi
    effect(() => {
      this.updateTheme(this._isDarkMode());
    });
  }

  private initializeTheme() {
    // Kiểm tra localStorage trước
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this._isDarkMode.set(savedTheme === 'dark');
    } else {
      // Nếu không có trong localStorage, dùng system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this._isDarkMode.set(prefersDark);
    }
  }

  private updateTheme(isDark: boolean) {
    const body = document.body;
    const html = document.documentElement;
    
    if (isDark) {
      body.classList.add('dark-theme');
      html.classList.add('dark-theme');
    } else {
      body.classList.remove('dark-theme');
      html.classList.remove('dark-theme');
    }
    
    // Lưu vào localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }

  // Method để toggle theme
  toggleTheme() {
    this._isDarkMode.set(!this._isDarkMode());
  }

  // Method để set theme cụ thể
  setTheme(isDark: boolean) {
    this._isDarkMode.set(isDark);
  }
}

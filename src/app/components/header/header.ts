import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatSidenavModule,
    MatListModule,
    MatSlideToggleModule
  ],
  templateUrl: './header.html',
  styleUrls: ['./header.scss']
})
export class HeaderComponent {
  showSidenav = false;

  // state dropdown about
  showAboutDropdown = false;

  // optional small delay to avoid flicker (ms)
  private closeTimer: any;

  constructor(public themeService: ThemeService) {}

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  openAbout() {
    clearTimeout(this.closeTimer);
    this.showAboutDropdown = true;
  }

  closeAboutSoon(delay = 120) {
    clearTimeout(this.closeTimer);
    this.closeTimer = setTimeout(() => this.showAboutDropdown = false, delay);
  }

  cancelClose() {
    clearTimeout(this.closeTimer);
  }

  // close dropdown when clicking anywhere outside (optional)
  @HostListener('document:click', ['$event'])
  onDocumentClick(e: Event) {
    // if click outside nav area, close
    const target = e.target as HTMLElement;
    if (!target.closest('.nav-links')) {
      this.showAboutDropdown = false;
    }
  }
}

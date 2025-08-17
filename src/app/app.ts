import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header';
import { FooterComponent } from './components/footer/footer';
import { trigger, transition, style, query, group, animate } from '@angular/animations';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  animations: [
    trigger('routeAnimations', [
      transition('* <=> *', [
        // set a default style for enter and leave
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
export class AppComponent {
  // helper for binding animation state
  public prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}

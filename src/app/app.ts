import { Component, OnInit } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './components/header/header';
import { FooterComponent } from './components/footer/footer';
import { trigger, transition, style, query, group, animate } from '@angular/animations';
import { filter } from 'rxjs/operators';

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
export class AppComponent implements OnInit {
  
  constructor(private router: Router) {}

  ngOnInit() {
    // Auto scroll to top on route changes
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      window.scrollTo(0, 0);
    });
  }

  // helper for binding animation state
  public prepareRoute(outlet: RouterOutlet) {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}

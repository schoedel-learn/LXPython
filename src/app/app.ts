import {ChangeDetectionStrategy, Component, inject, effect} from '@angular/core';
import {RouterOutlet, Router} from '@angular/router';
import { AuthService } from './services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    @if (!authService.isAuthReady()) {
      <div class="min-h-screen flex items-center justify-center bg-[#131314]">
        <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#8ab4f8]"></div>
      </div>
    } @else {
      <router-outlet></router-outlet>
    }
  `,
  styles: []
})
export class App {
  authService = inject(AuthService);
  router = inject(Router);

  constructor() {
    effect(() => {
      if (this.authService.isAuthReady()) {
        const user = this.authService.currentUser();
        const profile = this.authService.userProfile();
        
        if (user) {
          const isVerified = user.email === 'schoedelb@gmail.com' || user.emailVerified;
          const isRegistered = profile?.registrationComplete;
          
          if (!isVerified || !isRegistered) {
            if (!this.router.url.includes('/onboarding')) {
              this.router.navigate(['/onboarding']);
            }
          } else if (this.router.url.includes('/login') || this.router.url.includes('/onboarding')) {
            this.router.navigate(['/dashboard/learn']);
          }
        } else if (!user && (this.router.url.includes('/dashboard') || this.router.url.includes('/onboarding'))) {
          this.router.navigate(['/login']);
        }
      }
    });
  }
}

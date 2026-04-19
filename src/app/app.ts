import {ChangeDetectionStrategy, Component, inject, effect} from '@angular/core';
import {RouterOutlet, Router} from '@angular/router';
import { AuthService, ADMIN_EMAIL } from './services/auth.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    @if (!authService.isAuthReady()) {
      <div class="flex min-h-screen items-center justify-center bg-[#081425]">
        <div class="flex flex-col items-center gap-4 rounded-[1.5rem] bg-[#152031] px-8 py-7 text-[#d8e3fb] shadow-[0_24px_60px_rgba(0,0,0,0.18)]">
          <div class="h-12 w-12 animate-spin rounded-full border-y-2 border-[#4fdbc8] border-x-2 border-x-transparent"></div>
          <p class="text-sm uppercase tracking-[0.24em] text-[#859490]">Preparing your workspace</p>
        </div>
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
          // Only the admin account may use the app. Any other signed-in user
          // is immediately signed out and sent back to the login page.
          if (user.email !== ADMIN_EMAIL) {
            void this.authService.logout();
            this.router.navigate(['/login']);
            return;
          }

          const isEmailVerified = user.email === ADMIN_EMAIL || user.emailVerified;
          const isRegistered = profile?.registrationComplete;

          if (!isEmailVerified || !isRegistered) {
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

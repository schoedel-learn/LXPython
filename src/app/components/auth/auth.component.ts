import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="min-h-[100dvh] flex flex-col items-center justify-center bg-[#131314] p-4">
      <div class="flex items-center gap-3 mb-8">
        <div class="w-10 h-10 bg-[#8ab4f8] rounded-lg flex items-center justify-center">
          <mat-icon class="text-[#131314] text-2xl h-6 w-6">terminal</mat-icon>
        </div>
        <h1 class="text-3xl font-bold text-[#e3e3e3] font-sans tracking-tight">LXPython</h1>
      </div>

      <div class="w-full max-w-sm bg-[#1e1f20] rounded-2xl shadow-2xl p-6 border border-[#444746]">
        @if (errorMessage()) {
          <div class="mb-4 p-3 bg-red-900/40 border border-red-500/30 rounded-xl text-red-200 text-sm">
            {{ errorMessage() }}
          </div>
        }

        <button 
          (click)="login()" 
          class="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors duration-200 cursor-pointer">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" class="w-5 h-5" referrerpolicy="no-referrer">
          Sign in with Google
        </button>

        <div class="relative flex py-4 items-center">
          <div class="flex-grow border-t border-[#444746]/50"></div>
          <span class="flex-shrink mx-4 text-xs text-[#8e918f] uppercase tracking-wider font-medium">or</span>
          <div class="flex-grow border-t border-[#444746]/50"></div>
        </div>

        <button 
          (click)="loginGuest()" 
          class="w-full flex items-center justify-center gap-3 bg-transparent border border-[#444746] text-[#e3e3e3] font-medium py-3 px-4 rounded-xl hover:bg-[#2a2b2c] transition-colors duration-200 cursor-pointer">
          <mat-icon class="text-[#8ab4f8] text-xl h-5 w-5">person_outline</mat-icon>
          Continue as Guest
        </button>
      </div>
    </div>
  `
})
export class AuthComponent {
  authService = inject(AuthService);
  errorMessage = signal<string | null>(null);

  async login() {
    this.errorMessage.set(null);
    try {
      await this.authService.loginWithGoogle();
    } catch (error: unknown) {
      console.error('Failed to login with Google', error);
      const ferr = error as { code?: string; message?: string };
      if (ferr?.code === 'auth/unauthorized-domain') {
        this.errorMessage.set('Google Sign-In domain is unauthorized in this environment. Please log in using "Continue as Guest".');
      } else {
        this.errorMessage.set(ferr?.message || 'Failed to sign in with Google');
      }
    }
  }

  async loginGuest() {
    this.errorMessage.set(null);
    try {
      await this.authService.loginAnonymously();
    } catch (error: unknown) {
      console.error('Failed to login anonymously', error);
      const ferr = error as { message?: string };
      this.errorMessage.set(ferr?.message || 'Failed to join as guest');
    }
  }
}

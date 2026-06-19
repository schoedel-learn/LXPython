import { Component, inject } from '@angular/core';
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
        <button 
          (click)="login()" 
          class="w-full flex items-center justify-center gap-3 bg-white text-gray-900 font-medium py-3 px-4 rounded-xl hover:bg-gray-100 transition-colors duration-200">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google Logo" class="w-5 h-5" referrerpolicy="no-referrer">
          Sign in with Google
        </button>
      </div>
    </div>
  `
})
export class AuthComponent {
  authService = inject(AuthService);

  async login() {
    try {
      await this.authService.loginWithGoogle();
    } catch (error) {
      console.error('Failed to login', error);
    }
  }
}

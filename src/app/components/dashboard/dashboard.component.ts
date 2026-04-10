import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatIconModule, FormsModule],
  template: `
    <div class="h-[100dvh] w-full flex flex-col md:flex-row bg-[#131314] text-[#e3e3e3] overflow-hidden">
      
      <!-- Mobile Top Bar -->
      <div class="md:hidden flex items-center justify-between py-2 px-4 bg-[#1e1f20] border-b border-[#444746] shrink-0 z-40">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 bg-[#8ab4f8] rounded-lg flex items-center justify-center">
            <mat-icon class="text-[#131314] text-xl h-5 w-5">terminal</mat-icon>
          </div>
          <h1 class="text-xl font-bold font-sans tracking-tight">LXPython</h1>
        </div>
        <button (click)="isProfileDrawerOpen = true" class="w-8 h-8 rounded-full overflow-hidden border border-[#444746]">
          @if (authService.currentUser()?.photoURL) {
            <img [src]="authService.currentUser()?.photoURL" alt="Profile" class="w-full h-full object-cover" referrerpolicy="no-referrer">
          } @else {
            <div class="w-full h-full bg-[#282a2c] flex items-center justify-center text-sm font-medium">
              {{ authService.userProfile()?.firstName?.charAt(0) || 'U' }}
            </div>
          }
        </button>
      </div>

      <!-- Sidebar (Hidden on mobile) -->
      <aside class="hidden md:flex w-64 bg-[#1e1f20] border-r border-[#444746] flex-col shrink-0 z-50">
        <div class="py-2 px-6 border-b border-[#444746] h-[48px] flex items-center">
          <div class="flex items-center gap-3">
            <div class="w-6 h-6 bg-[#8ab4f8] rounded-md flex items-center justify-center">
              <mat-icon class="text-[#131314] text-sm h-4 w-4">terminal</mat-icon>
            </div>
            <h1 class="text-lg font-bold font-sans tracking-tight">LXPython</h1>
          </div>
        </div>

        <nav class="flex-1 p-4 space-y-2 overflow-y-auto">
          <a routerLink="/dashboard/learn" routerLinkActive="bg-[#8ab4f8]/10 text-[#8ab4f8]" 
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-[#c4c7c5] hover:bg-[#282a2c] transition-colors">
            <mat-icon class="h-5 w-5">school</mat-icon>
            <span class="font-medium">Learn</span>
          </a>
          
          <a routerLink="/dashboard/forum" routerLinkActive="bg-[#8ab4f8]/10 text-[#8ab4f8]" 
            class="flex items-center gap-3 px-4 py-3 rounded-xl text-[#c4c7c5] hover:bg-[#282a2c] transition-colors">
            <mat-icon class="h-5 w-5">forum</mat-icon>
            <span class="font-medium">Community</span>
          </a>
          
          @if (isAdmin()) {
            <a routerLink="/dashboard/secrets" routerLinkActive="bg-[#8ab4f8]/10 text-[#8ab4f8]"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-[#c4c7c5] hover:bg-[#282a2c] transition-colors">
              <mat-icon class="h-5 w-5">key</mat-icon>
              <span class="font-medium">Secrets</span>
            </a>
            <a routerLink="/dashboard/admin" routerLinkActive="bg-[#8ab4f8]/10 text-[#8ab4f8]"
              class="flex items-center gap-3 px-4 py-3 rounded-xl text-[#c4c7c5] hover:bg-[#282a2c] transition-colors">
              <mat-icon class="h-5 w-5">admin_panel_settings</mat-icon>
              <span class="font-medium">Admin Portal</span>
            </a>
          }
        </nav>

        <div class="p-4 border-t border-[#444746]">
          <button (click)="isProfileDrawerOpen = true" class="w-full flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-[#282a2c] transition-colors text-left">
            <div class="w-8 h-8 rounded-full overflow-hidden border border-[#444746] shrink-0">
              @if (authService.currentUser()?.photoURL) {
                <img [src]="authService.currentUser()?.photoURL" alt="Profile" class="w-full h-full object-cover" referrerpolicy="no-referrer">
              } @else {
                <div class="w-full h-full bg-[#282a2c] flex items-center justify-center text-sm font-medium">
                  {{ authService.userProfile()?.firstName?.charAt(0) || 'U' }}
                </div>
              }
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">{{ authService.userProfile()?.firstName }}</div>
              <div class="text-xs text-[#8e918f] truncate">Profile & Settings</div>
            </div>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 relative overflow-hidden flex flex-col">
        <router-outlet></router-outlet>
      </main>

      <!-- Profile Drawer Overlay -->
      @if (isProfileDrawerOpen) {
        <div class="absolute inset-0 bg-black/50 z-[60] transition-opacity" (click)="isProfileDrawerOpen = false" (keydown.enter)="isProfileDrawerOpen = false" tabindex="0" role="button" aria-label="Close profile drawer"></div>
        <div class="absolute inset-y-0 right-0 w-full md:w-80 bg-[#1e1f20] border-l border-[#444746] shadow-2xl z-[70] flex flex-col transform transition-transform duration-300">
          <div class="p-4 border-b border-[#444746] flex items-center justify-between shrink-0">
            <h2 class="text-lg font-bold text-[#e3e3e3]">Profile</h2>
            <button (click)="isProfileDrawerOpen = false" class="text-[#8e918f] hover:text-[#e3e3e3] p-1">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <div class="p-6 flex-1 overflow-y-auto">
            <div class="flex flex-col items-center mb-8">
              <div class="w-24 h-24 rounded-full overflow-hidden border-2 border-[#8ab4f8] mb-4">
                @if (authService.currentUser()?.photoURL) {
                  <img [src]="authService.currentUser()?.photoURL" alt="Profile" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                } @else {
                  <div class="w-full h-full bg-[#282a2c] flex items-center justify-center text-3xl font-medium">
                    {{ authService.userProfile()?.firstName?.charAt(0) || 'U' }}
                  </div>
                }
              </div>
              <h3 class="text-xl font-bold text-[#e3e3e3]">{{ authService.userProfile()?.firstName }}</h3>
              <p class="text-[#8e918f]">{{ authService.userProfile()?.email }}</p>
              <p class="text-xs font-mono text-[#8e918f] mt-1 bg-[#131314] px-2 py-0.5 rounded border border-[#444746]">ID: {{ authService.userProfile()?.customId }}</p>
              <p class="text-sm text-[#8ab4f8] mt-2">{{ authService.userProfile()?.country || 'No country set' }}</p>
            </div>

            <div class="space-y-4">
              <a routerLink="/dashboard/profile" (click)="isProfileDrawerOpen = false" 
                class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#282a2c] text-[#e3e3e3] hover:bg-[#444746] transition-colors font-medium">
                <mat-icon class="h-5 w-5">edit</mat-icon> Edit Profile
              </a>
              
              <button (click)="logout()" class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#282a2c] text-[#e3e3e3] hover:bg-[#444746] transition-colors font-medium">
                <mat-icon class="h-5 w-5">logout</mat-icon> Sign Out
              </button>

              @if (!isAdmin()) {
                <div class="pt-8 mt-8 border-t border-[#444746]">
                  <h4 class="text-[#f28b82] font-medium mb-2 flex items-center gap-2">
                    <mat-icon class="h-5 w-5">warning</mat-icon> Danger Zone
                  </h4>
                  <p class="text-xs text-[#8e918f] mb-4">Deleting your account is permanent. Type your email to confirm.</p>
                  <input type="email" [(ngModel)]="deleteEmailConfirm" placeholder="{{ authService.userProfile()?.email }}"
                    class="w-full bg-[#131314] border border-[#444746] rounded-lg px-3 py-2 text-sm text-[#e3e3e3] focus:outline-none focus:border-[#f28b82] mb-3">
                  <button (click)="deleteAccount()" [disabled]="deleteEmailConfirm !== authService.userProfile()?.email"
                    class="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#f28b82]/10 text-[#f28b82] hover:bg-[#f28b82]/20 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                    <mat-icon class="h-5 w-5">delete_forever</mat-icon> Delete Account
                  </button>
                </div>
              }
            </div>
          </div>
        </div>
      }
    </div>
  `
})
export class DashboardComponent {
  authService = inject(AuthService);
  isProfileDrawerOpen = false;
  deleteEmailConfirm = '';

  isAdmin() {
    return this.authService.userProfile()?.email === 'schoedelb@gmail.com';
  }

  async logout() {
    await this.authService.logout();
  }

  async deleteAccount() {
    if (this.deleteEmailConfirm === this.authService.userProfile()?.email) {
      await this.authService.deleteAccount();
    }
  }
}

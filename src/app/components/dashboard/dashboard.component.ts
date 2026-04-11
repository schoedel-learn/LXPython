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
    <div class="flex h-[100dvh] w-full flex-col overflow-hidden bg-[#081425] text-[#d8e3fb] md:flex-row">
      
      <!-- Mobile Top Bar -->
      <div class="z-40 flex shrink-0 items-center justify-between bg-[#152031] px-5 py-4 md:hidden">
        <div class="flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1f2a3c] text-sm font-semibold text-[#4fdbc8]">
            &lt;/&gt;
          </div>
          <div>
            <p class="text-[0.62rem] uppercase tracking-[0.24em] text-[#859490]">Digital Sanctuary</p>
            <h1 class="text-xl font-bold tracking-tight">LXPython</h1>
          </div>
        </div>
        <button (click)="isProfileDrawerOpen = true" class="ghost-outline flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#111c2d]">
          @if (authService.currentUser()?.photoURL) {
            <img [src]="authService.currentUser()?.photoURL" alt="Profile" class="w-full h-full object-cover" referrerpolicy="no-referrer">
          } @else {
            <div class="flex h-full w-full items-center justify-center bg-[#1f2a3c] text-sm font-medium text-[#4fdbc8]">
              {{ authService.userProfile()?.firstName?.charAt(0) || 'U' }}
            </div>
          }
        </button>
      </div>

      <!-- Sidebar (Hidden on mobile) -->
      <aside class="z-50 hidden w-72 shrink-0 flex-col bg-[#111c2d] px-5 py-6 md:flex">
        <div class="flex items-center gap-4 px-3">
          <div class="flex items-center gap-3">
            <div class="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f2a3c] text-base font-semibold text-[#4fdbc8]">
              &lt;/&gt;
            </div>
            <div>
              <p class="text-[0.62rem] uppercase tracking-[0.24em] text-[#859490]">Quiet workspace</p>
              <h1 class="text-2xl font-bold tracking-tight">LXPython</h1>
            </div>
          </div>
        </div>

        <div class="mt-10 px-3">
          <p class="text-[0.68rem] uppercase tracking-[0.28em] text-[#859490]">Navigate</p>
        </div>

        <nav class="flex-1 space-y-2 overflow-y-auto px-3 py-4">
          <a routerLink="/dashboard/learn" routerLinkActive="bg-[#1f2a3c] text-[#4fdbc8]" 
            class="flex min-h-16 items-center gap-3 rounded-2xl px-4 py-4 text-[#bbcac6] transition-colors hover:bg-[#152031]">
            <mat-icon class="h-5 w-5">school</mat-icon>
            <span class="font-medium">Learn</span>
          </a>
          
          <a routerLink="/dashboard/forum" routerLinkActive="bg-[#1f2a3c] text-[#4fdbc8]" 
            class="flex min-h-16 items-center gap-3 rounded-2xl px-4 py-4 text-[#bbcac6] transition-colors hover:bg-[#152031]">
            <mat-icon class="h-5 w-5">forum</mat-icon>
            <span class="font-medium">Community</span>
          </a>
          
          @if (isAdmin()) {
            <a routerLink="/dashboard/secrets" routerLinkActive="bg-[#1f2a3c] text-[#4fdbc8]"
              class="flex min-h-16 items-center gap-3 rounded-2xl px-4 py-4 text-[#bbcac6] transition-colors hover:bg-[#152031]">
              <mat-icon class="h-5 w-5">key</mat-icon>
              <span class="font-medium">Secrets</span>
            </a>
            <a routerLink="/dashboard/admin" routerLinkActive="bg-[#1f2a3c] text-[#4fdbc8]"
              class="flex min-h-16 items-center gap-3 rounded-2xl px-4 py-4 text-[#bbcac6] transition-colors hover:bg-[#152031]">
              <mat-icon class="h-5 w-5">admin_panel_settings</mat-icon>
              <span class="font-medium">Admin Portal</span>
            </a>
          }
        </nav>

        <div class="mt-auto rounded-[1.75rem] bg-[#152031] p-4">
          <button (click)="isProfileDrawerOpen = true" class="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-colors hover:bg-[#1f2a3c]">
            <div class="ghost-outline h-10 w-10 shrink-0 overflow-hidden rounded-full bg-[#111c2d]">
              @if (authService.currentUser()?.photoURL) {
                <img [src]="authService.currentUser()?.photoURL" alt="Profile" class="w-full h-full object-cover" referrerpolicy="no-referrer">
              } @else {
                <div class="flex h-full w-full items-center justify-center bg-[#1f2a3c] text-sm font-medium text-[#4fdbc8]">
                  {{ authService.userProfile()?.firstName?.charAt(0) || 'U' }}
                </div>
              }
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium truncate">{{ authService.userProfile()?.firstName }}</div>
              <div class="truncate text-xs text-[#859490]">Profile & Settings</div>
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
        <div class="absolute inset-y-0 right-0 z-[70] flex w-full transform flex-col bg-[#152031] shadow-[0_12px_40px_rgba(0,0,0,0.08)] transition-transform duration-300 md:w-96">
          <div class="flex items-center justify-between px-6 py-5 shrink-0">
            <div>
              <p class="text-[0.68rem] uppercase tracking-[0.26em] text-[#859490]">Profile</p>
              <h2 class="text-2xl font-bold text-[#d8e3fb]">Account</h2>
            </div>
            <button (click)="isProfileDrawerOpen = false" class="rounded-full bg-[#111c2d] p-2 text-[#859490] hover:text-[#d8e3fb]">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          
          <div class="flex-1 overflow-y-auto px-6 pb-6">
            <div class="flex flex-col items-center mb-8">
              <div class="mb-4 h-24 w-24 overflow-hidden rounded-full bg-[#111c2d] shadow-[inset_0_0_0_2px_rgba(79,219,200,0.22)]">
                @if (authService.currentUser()?.photoURL) {
                  <img [src]="authService.currentUser()?.photoURL" alt="Profile" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                } @else {
                  <div class="flex h-full w-full items-center justify-center bg-[#1f2a3c] text-3xl font-medium text-[#4fdbc8]">
                    {{ authService.userProfile()?.firstName?.charAt(0) || 'U' }}
                  </div>
                }
              </div>
              <h3 class="text-2xl font-bold text-[#d8e3fb]">{{ authService.userProfile()?.firstName }}</h3>
              <p class="text-[#859490]">{{ authService.userProfile()?.email }}</p>
              <p class="mt-2 rounded-full bg-[#111c2d] px-3 py-1 font-mono text-xs text-[#859490]">ID: {{ authService.userProfile()?.customId }}</p>
              <p class="mt-3 text-sm text-[#4fdbc8]">{{ authService.userProfile()?.country || 'No country set' }}</p>
            </div>

            <div class="space-y-4">
              <a routerLink="/dashboard/profile" (click)="isProfileDrawerOpen = false" 
                class="flex w-full items-center justify-center gap-2 rounded-[1.25rem] bg-[#111c2d] px-4 py-3 text-[#d8e3fb] transition-colors hover:bg-[#1f2a3c] font-medium">
                <mat-icon class="h-5 w-5">edit</mat-icon> Edit Profile
              </a>
              
              <button (click)="logout()" class="flex w-full items-center justify-center gap-2 rounded-[1.25rem] bg-[#111c2d] px-4 py-3 text-[#d8e3fb] transition-colors hover:bg-[#1f2a3c] font-medium">
                <mat-icon class="h-5 w-5">logout</mat-icon> Sign Out
              </button>

              @if (!isAdmin()) {
                <div class="mt-8 rounded-[1.5rem] bg-[#111c2d] p-5">
                  <h4 class="mb-2 flex items-center gap-2 font-medium text-[#ffb4ab]">
                    <mat-icon class="h-5 w-5">warning</mat-icon> Danger Zone
                  </h4>
                  <p class="mb-4 text-xs text-[#859490]">Deleting your account is permanent. Type your email to confirm.</p>
                  <input type="email" [(ngModel)]="deleteEmailConfirm" placeholder="{{ authService.userProfile()?.email }}"
                    class="sanctuary-input mb-3 w-full px-4 py-3 text-sm focus:outline-none">
                  <button (click)="deleteAccount()" [disabled]="deleteEmailConfirm !== authService.userProfile()?.email"
                    class="flex w-full items-center justify-center gap-2 rounded-[1.25rem] bg-[#ffb4ab]/12 px-4 py-3 font-medium text-[#ffb4ab] transition-colors hover:bg-[#ffb4ab]/20 disabled:cursor-not-allowed disabled:opacity-50">
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

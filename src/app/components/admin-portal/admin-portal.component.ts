import { Component, inject, OnInit, signal } from '@angular/core';
import { AuthService, UserProfile } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../../firebase';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-admin-portal',
  standalone: true,
  imports: [MatIconModule, DatePipe],
  template: `
    <div class="p-6 max-w-6xl mx-auto h-full flex flex-col">
      <div class="mb-8 shrink-0">
        <h2 class="text-2xl font-bold text-[#d8e3fb] mb-2">Admin Portal</h2>
        <p class="text-[#859490]">Manage newsletter subscribers and application settings.</p>
      </div>

      <div class="bg-[#152031] border border-[#3c4947] rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div class="p-4 border-b border-[#3c4947] bg-[#1f2a3c] flex justify-between items-center shrink-0">
          <div class="flex items-center gap-2">
            <mat-icon class="text-[#4fdbc8]">mark_email_read</mat-icon>
            <h3 class="font-medium text-[#d8e3fb]">Newsletter Subscribers</h3>
          </div>
          <button class="bg-[#4fdbc8] hover:bg-[#71f8e4] text-[#081425] text-sm font-medium py-1.5 px-4 rounded-lg transition-colors flex items-center gap-2">
            <mat-icon class="h-4 w-4 text-[16px]">api</mat-icon> Connect to Mailchimp
          </button>
        </div>

        <div class="flex-1 overflow-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-[#081425] sticky top-0 z-10 border-b border-[#3c4947]">
              <tr>
                <th class="p-4 text-sm font-medium text-[#859490]">Name</th>
                <th class="p-4 text-sm font-medium text-[#859490]">Email</th>
                <th class="p-4 text-sm font-medium text-[#859490]">Country</th>
                <th class="p-4 text-sm font-medium text-[#859490]">Experience</th>
                <th class="p-4 text-sm font-medium text-[#859490]">Joined</th>
                <th class="p-4 text-sm font-medium text-[#859490]">Confirmed</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#3c4947]">
              @for (user of subscribers(); track user.uid) {
                <tr class="hover:bg-[#1f2a3c] transition-colors">
                  <td class="p-4 text-sm text-[#d8e3fb]">{{ user.firstName }}</td>
                  <td class="p-4 text-sm text-[#d8e3fb]">{{ user.email }}</td>
                  <td class="p-4 text-sm text-[#d8e3fb]">{{ user.country || 'N/A' }}</td>
                  <td class="p-4 text-sm text-[#d8e3fb]">
                    <span class="px-2 py-1 bg-[#4fdbc8]/10 text-[#4fdbc8] rounded text-xs border border-[#4fdbc8]/20">
                      {{ user.pythonExperience }}
                    </span>
                  </td>
                  <td class="p-4 text-sm text-[#d8e3fb]">{{ user.dateJoined | date:'shortDate' }}</td>
                  <td class="p-4 text-sm">
                    @if (user.newsletterConfirmed) {
                      <mat-icon class="text-[#a0d0c6] h-5 w-5">check_circle</mat-icon>
                    } @else {
                      <mat-icon class="text-[#ffb4ab] h-5 w-5">pending</mat-icon>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="p-8 text-center text-[#859490]">
                    <mat-icon class="h-12 w-12 mb-2 opacity-50">group_off</mat-icon>
                    <p>No subscribers found.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class AdminPortalComponent implements OnInit {
  authService = inject(AuthService);
  router = inject(Router);
  subscribers = signal<UserProfile[]>([]);

  async ngOnInit() {
    if (this.authService.userProfile()?.email !== 'schoedelb@gmail.com') {
      this.router.navigate(['/dashboard/learn']);
      return;
    }
    await this.loadSubscribers();
  }

  async loadSubscribers() {
    try {
      const q = query(collection(db, 'users'), where('newsletterOptIn', '==', true));
      const querySnapshot = await getDocs(q);
      const users: UserProfile[] = [];
      querySnapshot.forEach((doc) => {
        users.push(doc.data() as UserProfile);
      });
      this.subscribers.set(users);
    } catch (error) {
      console.error('Error loading subscribers:', error);
    }
  }
}

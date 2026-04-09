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
        <h2 class="text-2xl font-bold text-[#e3e3e3] mb-2">Admin Portal</h2>
        <p class="text-[#8e918f]">Manage newsletter subscribers and application settings.</p>
      </div>

      <div class="bg-[#1e1f20] border border-[#444746] rounded-2xl overflow-hidden flex-1 flex flex-col">
        <div class="p-4 border-b border-[#444746] bg-[#282a2c] flex justify-between items-center shrink-0">
          <div class="flex items-center gap-2">
            <mat-icon class="text-[#8ab4f8]">mark_email_read</mat-icon>
            <h3 class="font-medium text-[#e3e3e3]">Newsletter Subscribers</h3>
          </div>
          <button class="bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#131314] text-sm font-medium py-1.5 px-4 rounded-lg transition-colors flex items-center gap-2">
            <mat-icon class="h-4 w-4 text-[16px]">api</mat-icon> Connect to Mailchimp
          </button>
        </div>

        <div class="flex-1 overflow-auto">
          <table class="w-full text-left border-collapse">
            <thead class="bg-[#131314] sticky top-0 z-10 border-b border-[#444746]">
              <tr>
                <th class="p-4 text-sm font-medium text-[#8e918f]">Name</th>
                <th class="p-4 text-sm font-medium text-[#8e918f]">Email</th>
                <th class="p-4 text-sm font-medium text-[#8e918f]">Country</th>
                <th class="p-4 text-sm font-medium text-[#8e918f]">Experience</th>
                <th class="p-4 text-sm font-medium text-[#8e918f]">Joined</th>
                <th class="p-4 text-sm font-medium text-[#8e918f]">Confirmed</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#444746]">
              @for (user of subscribers(); track user.uid) {
                <tr class="hover:bg-[#282a2c] transition-colors">
                  <td class="p-4 text-sm text-[#e3e3e3]">{{ user.firstName }}</td>
                  <td class="p-4 text-sm text-[#e3e3e3]">{{ user.email }}</td>
                  <td class="p-4 text-sm text-[#e3e3e3]">{{ user.country || 'N/A' }}</td>
                  <td class="p-4 text-sm text-[#e3e3e3]">
                    <span class="px-2 py-1 bg-[#8ab4f8]/10 text-[#8ab4f8] rounded text-xs border border-[#8ab4f8]/20">
                      {{ user.pythonExperience }}
                    </span>
                  </td>
                  <td class="p-4 text-sm text-[#e3e3e3]">{{ user.dateJoined | date:'shortDate' }}</td>
                  <td class="p-4 text-sm">
                    @if (user.newsletterConfirmed) {
                      <mat-icon class="text-[#81c995] h-5 w-5">check_circle</mat-icon>
                    } @else {
                      <mat-icon class="text-[#f28b82] h-5 w-5">pending</mat-icon>
                    }
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="p-8 text-center text-[#8e918f]">
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

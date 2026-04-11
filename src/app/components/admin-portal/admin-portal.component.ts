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
    <div class="mx-auto flex h-full max-w-7xl flex-col gap-6 px-4 py-6 text-[#d8e3fb] md:px-8">
      <section class="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div class="sanctuary-card rounded-[2rem] px-6 py-7 md:px-8 md:py-9">
          <p class="text-[0.72rem] uppercase tracking-[0.3em] text-[#859490]">Admin portal</p>
          <h1 class="mt-3 text-4xl font-bold">A calmer overview of subscriber health and engagement.</h1>
          <p class="mt-5 max-w-2xl text-base leading-8 text-[#bbcac6]">
            Review who opted in, how experienced they are, and which segments may still need confirmation without falling back to noisy admin tables first.
          </p>

          <div class="mt-10 grid gap-4 md:grid-cols-3">
            <div class="rounded-[1.5rem] bg-[#111c2d] px-5 py-4">
              <p class="text-xs uppercase tracking-[0.18em] text-[#859490]">Subscribers</p>
              <p class="mt-2 text-3xl font-bold">{{ subscribers().length }}</p>
            </div>
            <div class="rounded-[1.5rem] bg-[#111c2d] px-5 py-4">
              <p class="text-xs uppercase tracking-[0.18em] text-[#859490]">Confirmed</p>
              <p class="mt-2 text-3xl font-bold">{{ confirmedCount() }}</p>
            </div>
            <div class="rounded-[1.5rem] bg-[#111c2d] px-5 py-4">
              <p class="text-xs uppercase tracking-[0.18em] text-[#859490]">Pending</p>
              <p class="mt-2 text-3xl font-bold">{{ subscribers().length - confirmedCount() }}</p>
            </div>
          </div>
        </div>

        <div class="sanctuary-card rounded-[2rem] px-6 py-7 md:px-8 md:py-9">
          <div class="flex items-start justify-between gap-4">
            <div>
              <p class="text-[0.72rem] uppercase tracking-[0.3em] text-[#859490]">Integration</p>
              <h2 class="mt-2 text-3xl font-bold">Outbound sync</h2>
            </div>
            <button class="sanctuary-button rounded-[1.2rem] px-4 py-3 text-sm font-semibold">
              Connect to Mailchimp
            </button>
          </div>

          <div class="mt-8 space-y-4">
            <div class="rounded-[1.5rem] bg-[#111c2d] px-5 py-4">
              <p class="text-xs uppercase tracking-[0.18em] text-[#859490]">Segment focus</p>
              <p class="mt-2 text-sm leading-7 text-[#bbcac6]">Use confirmed learners as the clean export set, then follow up with pending contacts inside the product.</p>
            </div>
            <div class="rounded-[1.5rem] bg-[#111c2d] px-5 py-4">
              <p class="text-xs uppercase tracking-[0.18em] text-[#859490]">Most common country</p>
              <p class="mt-2 text-lg font-semibold">{{ topCountry() }}</p>
            </div>
          </div>
        </div>
      </section>

      <section class="sanctuary-card flex min-h-0 flex-1 flex-col rounded-[2rem] px-6 py-7 md:px-8 md:py-9">
        <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p class="text-[0.72rem] uppercase tracking-[0.3em] text-[#859490]">Subscribers</p>
            <h2 class="mt-2 text-3xl font-bold">Newsletter roster</h2>
          </div>
          <div class="rounded-full bg-[#111c2d] px-4 py-2 text-sm text-[#bbcac6]">{{ subscribers().length }} total rows</div>
        </div>

        <div class="grid gap-4 overflow-auto">
          @for (user of subscribers(); track user.uid) {
            <article class="rounded-[1.6rem] bg-[#111c2d] px-5 py-5">
              <div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h3 class="text-xl font-semibold">{{ user.firstName }}</h3>
                  <p class="mt-1 text-sm text-[#859490]">{{ user.email }}</p>
                </div>

                <div class="flex flex-wrap gap-3 text-sm text-[#bbcac6]">
                  <span class="rounded-full bg-[#081425] px-4 py-2">{{ user.country || 'N/A' }}</span>
                  <span class="rounded-full bg-[#081425] px-4 py-2 text-[#4fdbc8]">{{ user.pythonExperience }}</span>
                  <span class="rounded-full bg-[#081425] px-4 py-2">{{ user.dateJoined | date:'shortDate' }}</span>
                  <span class="rounded-full px-4 py-2" [class.bg-[#a0d0c6]/12]="user.newsletterConfirmed" [class.text-[#a0d0c6]]="user.newsletterConfirmed" [class.bg-[#ffb4ab]/12]="!user.newsletterConfirmed" [class.text-[#ffb4ab]]="!user.newsletterConfirmed">
                    {{ user.newsletterConfirmed ? 'Confirmed' : 'Pending' }}
                  </span>
                </div>
              </div>
            </article>
          } @empty {
            <div class="rounded-[1.6rem] bg-[#111c2d] px-8 py-16 text-center text-[#859490]">
              <mat-icon class="h-12 w-12 text-[48px] opacity-50">group_off</mat-icon>
              <p class="mt-4 text-sm">No subscribers found.</p>
            </div>
          }
        </div>
      </section>
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

  confirmedCount(): number {
    return this.subscribers().filter(user => user.newsletterConfirmed).length;
  }

  topCountry(): string {
    const counts = new Map<string, number>();
    for (const user of this.subscribers()) {
      const country = user.country || 'Not set';
      counts.set(country, (counts.get(country) || 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'No data';
  }
}

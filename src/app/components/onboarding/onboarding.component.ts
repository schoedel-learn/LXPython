import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, ADMIN_EMAIL } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { auth } from '../../../firebase';

const COUNTRIES = [
  'United States', 'Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Argentina', 'Armenia', 'Australia', 'Austria',
  'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia',
  'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cabo Verde',
  'Cambodia', 'Cameroon', 'Canada', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros',
  'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica',
  'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini',
  'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada',
  'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia',
  'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati',
  'Korea, North', 'Korea, South', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho',
  'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives',
  'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco',
  'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands',
  'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau',
  'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar',
  'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Saint Vincent and the Grenadines',
  'Samoa', 'San Marino', 'Sao Tome and Principe', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone',
  'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Sudan', 'Spain',
  'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand',
  'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda',
  'Ukraine', 'United Arab Emirates', 'United Kingdom', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City',
  'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

const PROJECT_INTERESTS = [
  'AI & Machine Learning',
  'Automation & Scripting',
  'Backend Development',
  'CLI Tools',
  'Computer Vision',
  'Data Analysis',
  'Data Science',
  'DevOps',
  'Game Development',
  'GUI Applications',
  'Natural Language Processing',
  'Network Programming',
  'Robotics',
  'Web Development',
  'Web Scraping'
];

const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
const DAYS = Array.from({length: 31}, (_, i) => (i + 1).toString().padStart(2, '0'));

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [ReactiveFormsModule, MatIconModule],
  template: `
    <div class="min-h-[100dvh] bg-[#081425] px-4 py-6 text-[#d8e3fb] md:px-8">
      <div class="mx-auto grid min-h-[calc(100dvh-3rem)] max-w-7xl gap-6 lg:grid-cols-[0.95fr_1.25fr]">
        <section class="sanctuary-card flex flex-col justify-between rounded-[2rem] px-6 py-7 md:px-8 md:py-9">
          <div>
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-4">
                <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1f2a3c] text-[#4fdbc8]">
                  <mat-icon>terminal</mat-icon>
                </div>
                <div>
                  <p class="text-[0.68rem] uppercase tracking-[0.28em] text-[#859490]">Onboarding</p>
                  <h1 class="text-3xl font-bold">Set your learning rhythm</h1>
                </div>
              </div>
              <button (click)="logout()" class="rounded-full bg-[#111c2d] p-3 text-[#859490] transition-colors hover:text-[#d8e3fb]" aria-label="Sign out">
                <mat-icon>logout</mat-icon>
              </button>
            </div>

            <p class="mt-8 max-w-lg text-base leading-8 text-[#bbcac6]">
              The workspace adapts to your level, interests, and pace. This profile helps LXPython shape lessons, community prompts, and practice loops around how you learn best.
            </p>

            <div class="mt-10 space-y-4">
              <div class="rounded-[1.5rem] bg-[#111c2d] px-5 py-4">
                <p class="text-[0.68rem] uppercase tracking-[0.26em] text-[#859490]">Step 01</p>
                <div class="mt-2 flex items-center justify-between">
                  <span class="text-lg font-semibold">Verify identity</span>
                  <span class="rounded-full bg-[#1f2a3c] px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em]" [class.text-[#a0d0c6]]="isEmailVerified()" [class.text-[#ffb4ab]]="!isEmailVerified()">
                    {{ isEmailVerified() ? 'Complete' : 'Pending' }}
                  </span>
                </div>
              </div>
              <div class="rounded-[1.5rem] bg-[#111c2d] px-5 py-4">
                <p class="text-[0.68rem] uppercase tracking-[0.26em] text-[#859490]">Step 02</p>
                <div class="mt-2 flex items-center justify-between">
                  <span class="text-lg font-semibold">Profile tuning</span>
                  <span class="rounded-full bg-[#1f2a3c] px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-[#4fdbc8]">Adaptive</span>
                </div>
              </div>
              <div class="rounded-[1.5rem] bg-[#111c2d] px-5 py-4">
                <p class="text-[0.68rem] uppercase tracking-[0.26em] text-[#859490]">Workspace ID</p>
                <p class="mt-2 font-mono text-sm text-[#d8e3fb]">{{ authService.userProfile()?.customId }}</p>
              </div>
            </div>
          </div>

          <div class="mt-8 rounded-[1.5rem] bg-[#111c2d] px-5 py-4">
            <p class="text-[0.68rem] uppercase tracking-[0.26em] text-[#859490]">What changes</p>
            <ul class="mt-3 space-y-3 text-sm leading-7 text-[#bbcac6]">
              <li>• Lesson difficulty and pacing</li>
              <li>• Suggested project tracks</li>
              <li>• Community prompts and support</li>
            </ul>
          </div>
        </section>

        <section class="sanctuary-card flex min-h-0 flex-col rounded-[2rem] px-6 py-7 md:px-8 md:py-9">
          @if (!isEmailVerified()) {
            <div class="mx-auto flex max-w-xl flex-1 flex-col items-center justify-center text-center">
              <div class="flex h-20 w-20 items-center justify-center rounded-full bg-[#ffb4ab]/12 text-[#ffb4ab]">
                <mat-icon class="h-10 w-10 text-[40px]">mark_email_unread</mat-icon>
              </div>
              <p class="mt-8 text-[0.72rem] uppercase tracking-[0.32em] text-[#859490]">Verification required</p>
              <h2 class="mt-3 text-4xl font-bold">Confirm your email before entering the studio.</h2>
              <p class="mt-5 text-base leading-8 text-[#bbcac6]">
                We sent access to <span class="text-[#d8e3fb]">{{ authService.currentUser()?.email }}</span>. Confirm it, then return here to finish shaping your workspace.
              </p>
              <div class="mt-8 flex w-full max-w-sm flex-col gap-3">
                <button (click)="sendVerification()" [disabled]="verificationSent()"
                  class="rounded-[1.25rem] bg-[#111c2d] px-5 py-4 text-sm font-medium text-[#d8e3fb] transition-colors hover:bg-[#1f2a3c] disabled:opacity-50">
                  {{ verificationSent() ? 'Verification email sent' : 'Send verification email' }}
                </button>
                <button (click)="checkVerification()"
                  class="sanctuary-button rounded-[1.25rem] px-5 py-4 text-sm font-semibold">
                  I have verified my email
                </button>
              </div>
            </div>
          } @else {
            <div class="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p class="text-[0.72rem] uppercase tracking-[0.32em] text-[#859490]">Profile tuning</p>
                <h2 class="mt-2 text-4xl font-bold">Tell us how you want to learn.</h2>
              </div>
              <div class="rounded-[1.25rem] bg-[#111c2d] px-4 py-3 text-sm text-[#bbcac6]">
                Editing for <span class="text-[#d8e3fb]">{{ authService.currentUser()?.email }}</span>
              </div>
            </div>

            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="flex min-h-0 flex-1 flex-col gap-8 overflow-y-auto pr-1">
              <div class="grid gap-8 xl:grid-cols-[1fr_0.85fr]">
                <div class="space-y-6">
                  <div class="rounded-[1.5rem] bg-[#111c2d] p-5">
                    <p class="text-[0.68rem] uppercase tracking-[0.26em] text-[#859490]">Identity</p>
                    <div class="mt-4 grid gap-4 md:grid-cols-2">
                      <label class="block">
                        <span class="mb-2 block text-xs uppercase tracking-[0.18em] text-[#859490]">First name</span>
                        <input type="text" id="firstName" formControlName="firstName" class="sanctuary-input w-full px-4 py-3 text-sm focus:outline-none">
                      </label>
                      <label class="block">
                        <span class="mb-2 block text-xs uppercase tracking-[0.18em] text-[#859490]">Email</span>
                        <input type="email" id="email" [value]="authService.currentUser()?.email" disabled class="sanctuary-input w-full cursor-not-allowed px-4 py-3 text-sm opacity-70">
                      </label>
                    </div>
                  </div>

                  <div class="rounded-[1.5rem] bg-[#111c2d] p-5">
                    <p class="text-[0.68rem] uppercase tracking-[0.26em] text-[#859490]">Location & birthday</p>
                    <div class="mt-4 grid gap-4 md:grid-cols-[1fr_0.8fr]">
                      <label class="block">
                        <span class="mb-2 block text-xs uppercase tracking-[0.18em] text-[#859490]">Country</span>
                        <select id="country" formControlName="country" class="sanctuary-input w-full appearance-none px-4 py-3 text-sm focus:outline-none">
                          @for (country of countries; track country) {
                            <option [value]="country">{{ country }}</option>
                          }
                        </select>
                      </label>
                      <div>
                        <span class="mb-2 block text-xs uppercase tracking-[0.18em] text-[#859490]">Birthday</span>
                        <div class="grid grid-cols-2 gap-3">
                          <select formControlName="birthMonth" aria-label="Birth Month" class="sanctuary-input w-full appearance-none px-4 py-3 text-sm focus:outline-none">
                            <option value="">Month</option>
                            @for (m of months; track m) { <option [value]="m">{{ m }}</option> }
                          </select>
                          <select formControlName="birthDay" aria-label="Birth Day" class="sanctuary-input w-full appearance-none px-4 py-3 text-sm focus:outline-none">
                            <option value="">Day</option>
                            @for (d of days; track d) { <option [value]="d">{{ d }}</option> }
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="rounded-[1.5rem] bg-[#111c2d] p-5">
                    <p id="pythonExperienceLabel" class="text-[0.68rem] uppercase tracking-[0.26em] text-[#859490]">Python confidence</p>
                    <div class="mt-4 grid gap-3 md:grid-cols-2" aria-labelledby="pythonExperienceLabel">
                      @for (level of ['Beginner', 'Intermediate', 'Advanced', 'Expert']; track level) {
                        <label [for]="'exp-' + level" class="cursor-pointer rounded-[1.25rem] p-4 transition-colors"
                          [class.bg-[#1f2a3c]]="profileForm.get('pythonExperience')?.value === level"
                          [class.text-[#d8e3fb]]="profileForm.get('pythonExperience')?.value === level"
                          [class.bg-[#081425]]="profileForm.get('pythonExperience')?.value !== level"
                          [class.text-[#bbcac6]]="profileForm.get('pythonExperience')?.value !== level">
                          <input type="radio" [id]="'exp-' + level" formControlName="pythonExperience" [value]="level" class="hidden">
                          <div class="flex items-center justify-between">
                            <span class="text-base font-semibold">{{ level }}</span>
                            @if (profileForm.get('pythonExperience')?.value === level) {
                              <mat-icon class="text-[#4fdbc8]">check_circle</mat-icon>
                            }
                          </div>
                          <p class="mt-2 text-sm leading-7 text-[#859490]">
                            {{ level === 'Beginner' ? 'Need guided practice and slower pacing.' : level === 'Intermediate' ? 'Comfortable with syntax and ready for deeper problems.' : level === 'Advanced' ? 'Want faster projects and fewer hand-holding steps.' : 'Prefer challenge-focused prompts and open-ended work.' }}
                          </p>
                        </label>
                      }
                    </div>
                  </div>
                </div>

                <div class="space-y-6">
                  <div class="rounded-[1.5rem] bg-[#111c2d] p-5">
                    <p id="projectInterestsLabel" class="text-[0.68rem] uppercase tracking-[0.26em] text-[#859490]">Project interests</p>
                    <button type="button" (click)="isInterestsOpen.set(!isInterestsOpen())" aria-labelledby="projectInterestsLabel"
                      class="mt-4 flex w-full items-center justify-between rounded-[1.25rem] bg-[#081425] px-4 py-3 text-left text-sm text-[#d8e3fb]">
                      <span class="truncate">{{ selectedInterests().length ? selectedInterests().join(', ') : 'Select focus areas for future projects' }}</span>
                      <mat-icon class="text-[#859490]">expand_more</mat-icon>
                    </button>
                    @if (isInterestsOpen()) {
                      <div class="mt-4 grid max-h-72 gap-2 overflow-y-auto rounded-[1.25rem] bg-[#081425] p-3">
                        @for (interest of projectInterestsList; track interest) {
                          <label [for]="'interest-' + interest" class="flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 transition-colors hover:bg-[#1f2a3c]">
                            <span class="text-sm text-[#d8e3fb]">{{ interest }}</span>
                            <input type="checkbox" [id]="'interest-' + interest" [checked]="selectedInterests().includes(interest)" (change)="toggleInterest(interest)"
                              class="h-4 w-4 rounded border-[#3c4947] bg-[#081425] text-[#4fdbc8]">
                          </label>
                        }
                      </div>
                    }
                  </div>

                  <div class="rounded-[1.5rem] bg-[#111c2d] p-5">
                    <p class="text-[0.68rem] uppercase tracking-[0.26em] text-[#859490]">Updates</p>
                    <label for="newsletterOptIn" class="mt-4 flex cursor-pointer gap-3 rounded-[1.25rem] bg-[#081425] p-4">
                      <input type="checkbox" id="newsletterOptIn" formControlName="newsletterOptIn"
                        class="mt-1 h-4 w-4 rounded border-[#3c4947] bg-[#081425] text-[#4fdbc8] focus:ring-[#4fdbc8] focus:ring-offset-[#081425]">
                      <div>
                        <span class="block text-sm font-semibold text-[#d8e3fb]">Opt in to LXPython communications</span>
                        <span class="mt-2 block text-sm leading-7 text-[#859490]">Receive occasional updates, workflow improvements, and launch notes. Email confirmation is still required.</span>
                      </div>
                    </label>
                  </div>

                  <div class="rounded-[1.5rem] bg-[#111c2d] p-5">
                    <p class="text-[0.68rem] uppercase tracking-[0.26em] text-[#859490]">Ready</p>
                    <p class="mt-3 text-sm leading-7 text-[#bbcac6]">
                      Once saved, you’ll move directly into the redesigned learning workspace with these preferences applied.
                    </p>
                    <button type="submit" [disabled]="profileForm.invalid || isSaving()"
                      class="sanctuary-button mt-6 flex w-full items-center justify-center gap-2 rounded-[1.4rem] px-5 py-4 text-sm font-semibold disabled:opacity-50">
                      @if (isSaving()) {
                        <mat-icon class="h-4 w-4 animate-spin text-[16px]">autorenew</mat-icon> Saving your workspace
                      } @else {
                        Complete registration <mat-icon class="h-4 w-4 text-[16px]">arrow_forward</mat-icon>
                      }
                    </button>
                  </div>
                </div>
              </div>
            </form>
          }
        </section>
      </div>
    </div>
  `
})
export class OnboardingComponent implements OnInit {
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  router = inject(Router);

  countries = COUNTRIES;
  projectInterestsList = PROJECT_INTERESTS;
  months = MONTHS;
  days = DAYS;
  
  profileForm: FormGroup;
  isSaving = signal(false);
  verificationSent = signal(false);
  isInterestsOpen = signal(false);
  selectedInterests = signal<string[]>([]);

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      country: ['United States'],
      birthMonth: [''],
      birthDay: [''],
      pythonExperience: ['Beginner', Validators.required],
      newsletterOptIn: [false]
    });
  }

  ngOnInit() {
    const profile = this.authService.userProfile();
    if (profile) {
      const birthdayParts = profile.birthday ? profile.birthday.split('/') : ['', ''];
      this.profileForm.patchValue({
        firstName: profile.firstName,
        country: profile.country || 'United States',
        birthMonth: birthdayParts[0] || '',
        birthDay: birthdayParts[1] || '',
        pythonExperience: profile.pythonExperience || 'Beginner',
        newsletterOptIn: profile.newsletterOptIn || false
      });
      if (profile.projectInterests) {
        this.selectedInterests.set(profile.projectInterests);
      }
    }
  }

  toggleInterest(interest: string) {
    const current = this.selectedInterests();
    if (current.includes(interest)) {
      this.selectedInterests.set(current.filter(i => i !== interest));
    } else {
      this.selectedInterests.set([...current, interest]);
    }
  }

  isEmailVerified(): boolean {
    const user = this.authService.currentUser();
    if (!user) return false;
    // Admin bypasses email verification
    if (user.email === ADMIN_EMAIL) return true;
    return user.emailVerified;
  }

  async sendVerification() {
    try {
      await this.authService.sendVerificationEmail();
      this.verificationSent.set(true);
    } catch (error) {
      console.error('Error sending verification email', error);
    }
  }

  async checkVerification() {
    const user = auth.currentUser;
    if (user) {
      await user.reload();
      // Trigger change detection by updating the signal
      this.authService.currentUser.set({ ...user } as unknown as import('firebase/auth').User); 
      // Actually, reloading mutates the user object, but we might need to re-fetch it
      this.authService.currentUser.set(auth.currentUser);
    }
  }

  async logout() {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }

  async onSubmit() {
    if (this.profileForm.invalid || !this.isEmailVerified()) return;
    
    this.isSaving.set(true);
    try {
      const formValue = this.profileForm.value;
      const birthMonth = formValue.birthMonth;
      const birthDay = formValue.birthDay;
      const birthday = (birthMonth && birthDay) ? `${birthMonth}/${birthDay}` : '';

      await this.authService.updateProfile({
        firstName: formValue.firstName,
        country: formValue.country,
        birthday: birthday,
        pythonExperience: formValue.pythonExperience,
        projectInterests: this.selectedInterests(),
        newsletterOptIn: formValue.newsletterOptIn,
        newsletterConfirmed: false, // They must confirm via email later
        registrationComplete: true
      });

      this.router.navigate(['/dashboard/learn']);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      this.isSaving.set(false);
    }
  }
}

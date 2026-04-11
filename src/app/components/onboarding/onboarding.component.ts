import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
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
    <div class="min-h-[100dvh] bg-[#081425] text-[#d8e3fb] flex flex-col items-center justify-center p-2">
      <div class="w-full max-w-md bg-[#152031] border border-[#3c4947] rounded-xl overflow-hidden shadow-2xl flex flex-col max-h-[95dvh]">
        
        <div class="p-3 border-b border-[#3c4947] flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 bg-[#4fdbc8] rounded-lg flex items-center justify-center">
              <mat-icon class="text-[#081425] h-5 w-5 text-xl">terminal</mat-icon>
            </div>
            <div>
              <h1 class="text-lg font-bold font-sans tracking-tight leading-tight">Complete Registration</h1>
              <p class="text-[10px] text-[#859490] font-mono">ID: {{ authService.userProfile()?.customId }}</p>
            </div>
          </div>
          <button (click)="logout()" class="text-[#859490] hover:text-[#d8e3fb] p-1.5 rounded-md hover:bg-[#3c4947] transition-colors" aria-label="Sign out">
            <mat-icon class="h-5 w-5 text-[20px]">logout</mat-icon>
          </button>
        </div>

        <div class="p-4 overflow-y-auto flex-1">
          @if (!isEmailVerified()) {
            <div class="bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 rounded-xl p-4 text-center">
              <mat-icon class="text-[#ffb4ab] h-8 w-8 mb-2 text-3xl">mark_email_unread</mat-icon>
              <h3 class="text-base font-bold text-[#ffb4ab] mb-1">Verify Your Email</h3>
              <p class="text-xs text-[#d8e3fb] mb-4">
                We need to verify {{ authService.currentUser()?.email }} before you can continue.
              </p>
              <div class="flex flex-col gap-2">
                <button (click)="sendVerification()" [disabled]="verificationSent()"
                  class="bg-[#1f2a3c] hover:bg-[#3c4947] text-[#d8e3fb] text-sm font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50">
                  {{ verificationSent() ? 'Email Sent!' : 'Send Verification Email' }}
                </button>
                <button (click)="checkVerification()"
                  class="bg-[#4fdbc8] hover:bg-[#71f8e4] text-[#081425] text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                  I've Verified It
                </button>
              </div>
            </div>
          } @else {
            <form [formGroup]="profileForm" (ngSubmit)="onSubmit()" class="flex flex-col gap-3">
              
              <!-- Row 1: Name & Email -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="firstName" class="block text-[11px] font-medium text-[#859490] mb-1">First Name</label>
                  <input type="text" id="firstName" formControlName="firstName"
                    class="w-full bg-[#081425] border border-[#3c4947] rounded-md px-2 py-1.5 text-xs text-[#d8e3fb] focus:outline-none focus:border-[#4fdbc8]">
                </div>
                <div>
                  <label for="email" class="block text-[11px] font-medium text-[#859490] mb-1">Email</label>
                  <input type="email" id="email" [value]="authService.currentUser()?.email" disabled
                    class="w-full bg-[#081425]/50 border border-[#3c4947]/50 rounded-md px-2 py-1.5 text-xs text-[#859490] cursor-not-allowed">
                </div>
              </div>

              <!-- Row 2: Country & Birthday -->
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label for="country" class="block text-[11px] font-medium text-[#859490] mb-1">Country</label>
                  <select id="country" formControlName="country"
                    class="w-full bg-[#081425] border border-[#3c4947] rounded-md px-2 py-1.5 text-xs text-[#d8e3fb] focus:outline-none focus:border-[#4fdbc8] appearance-none">
                    @for (country of countries; track country) {
                      <option [value]="country">{{ country }}</option>
                    }
                  </select>
                </div>
                <div>
                  <div class="block text-[11px] font-medium text-[#859490] mb-1">Birthday (Optional)</div>
                  <div class="flex gap-2">
                    <select formControlName="birthMonth" aria-label="Birth Month" class="w-full bg-[#081425] border border-[#3c4947] rounded-md px-2 py-1.5 text-xs text-[#d8e3fb] focus:outline-none focus:border-[#4fdbc8] appearance-none">
                      <option value="">MM</option>
                      @for (m of months; track m) { <option [value]="m">{{ m }}</option> }
                    </select>
                    <select formControlName="birthDay" aria-label="Birth Day" class="w-full bg-[#081425] border border-[#3c4947] rounded-md px-2 py-1.5 text-xs text-[#d8e3fb] focus:outline-none focus:border-[#4fdbc8] appearance-none">
                      <option value="">DD</option>
                      @for (d of days; track d) { <option [value]="d">{{ d }}</option> }
                    </select>
                  </div>
                </div>
              </div>

              <!-- Row 3: Experience -->
              <div>
                <div id="pythonExperienceLabel" class="block text-[11px] font-medium text-[#859490] mb-1">Python Experience</div>
                <div class="flex gap-1.5" aria-labelledby="pythonExperienceLabel">
                  @for (level of ['Beginner', 'Intermediate', 'Advanced', 'Expert']; track level) {
                    <label [for]="'exp-' + level" class="flex-1 text-center p-1.5 rounded-md border cursor-pointer transition-colors"
                      [class.border-[#4fdbc8]]="profileForm.get('pythonExperience')?.value === level"
                      [class.bg-[#4fdbc8]/10]="profileForm.get('pythonExperience')?.value === level"
                      [class.border-[#3c4947]]="profileForm.get('pythonExperience')?.value !== level"
                      [class.bg-[#081425]]="profileForm.get('pythonExperience')?.value !== level">
                      <input type="radio" [id]="'exp-' + level" formControlName="pythonExperience" [value]="level" class="hidden">
                      <span class="text-[10px] font-medium" [class.text-[#4fdbc8]]="profileForm.get('pythonExperience')?.value === level">{{ level }}</span>
                    </label>
                  }
                </div>
              </div>

              <!-- Row 4: Interests (Multi-select) -->
              <div class="relative">
                <div id="projectInterestsLabel" class="block text-[11px] font-medium text-[#859490] mb-1">Project Interests (Optional)</div>
                <button type="button" (click)="isInterestsOpen.set(!isInterestsOpen())" aria-labelledby="projectInterestsLabel"
                  class="w-full bg-[#081425] border border-[#3c4947] rounded-md px-2 py-1.5 text-xs text-left flex items-center justify-between focus:outline-none focus:border-[#4fdbc8]">
                  <span class="truncate text-[#d8e3fb]">
                    {{ selectedInterests().length ? selectedInterests().join(', ') : 'Select interests...' }}
                  </span>
                  <mat-icon class="text-[16px] h-4 w-4 text-[#859490]">expand_more</mat-icon>
                </button>
                
                @if (isInterestsOpen()) {
                  <div class="absolute z-10 w-full mt-1 bg-[#1f2a3c] border border-[#3c4947] rounded-md shadow-xl max-h-32 overflow-y-auto">
                    @for (interest of projectInterestsList; track interest) {
                      <label [for]="'interest-' + interest" class="flex items-center gap-2 px-3 py-1.5 hover:bg-[#3c4947] cursor-pointer">
                        <input type="checkbox" [id]="'interest-' + interest" [checked]="selectedInterests().includes(interest)" (change)="toggleInterest(interest)"
                          class="w-3 h-3 rounded border-[#3c4947] bg-[#081425] text-[#4fdbc8]">
                        <span class="text-xs text-[#d8e3fb]">{{ interest }}</span>
                      </label>
                    }
                  </div>
                }
              </div>

              <!-- Row 5: Newsletter -->
              <div class="bg-[#1f2a3c] rounded-md p-2 border border-[#3c4947]">
                <label for="newsletterOptIn" class="flex items-start gap-2 cursor-pointer">
                  <div class="mt-0.5">
                    <input type="checkbox" id="newsletterOptIn" formControlName="newsletterOptIn"
                      class="w-3.5 h-3.5 rounded border-[#3c4947] bg-[#081425] text-[#4fdbc8] focus:ring-[#4fdbc8] focus:ring-offset-[#081425]">
                  </div>
                  <div>
                    <span class="block text-xs font-medium text-[#d8e3fb]">Opt-in to LXPython Communications</span>
                    <span class="block text-[10px] text-[#859490] leading-tight mt-0.5">
                      Receive infrequent updates. Requires email confirmation.
                    </span>
                  </div>
                </label>
              </div>

              <button type="submit" [disabled]="profileForm.invalid || isSaving()"
                class="w-full bg-[#4fdbc8] hover:bg-[#71f8e4] text-[#081425] font-bold py-2 px-4 rounded-md text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-1 mt-1">
                @if (isSaving()) {
                  <mat-icon class="animate-spin h-4 w-4 text-[16px]">autorenew</mat-icon> Saving...
                } @else {
                  Complete Registration <mat-icon class="h-4 w-4 text-[16px]">arrow_forward</mat-icon>
                }
              </button>
            </form>
          }
        </div>
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
    if (user.email === 'schoedelb@gmail.com') return true;
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

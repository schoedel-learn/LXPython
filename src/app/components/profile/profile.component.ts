import { Component, inject, OnInit } from '@angular/core';
import { AuthService, ADMIN_EMAIL } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

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

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule],
  template: `
    <div class="h-full overflow-y-auto bg-[#081425] px-4 py-6 md:px-8">
      <div class="mx-auto max-w-7xl space-y-6 text-[#d8e3fb]">
        <section class="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div class="sanctuary-card rounded-[2rem] px-6 py-7 md:px-8 md:py-9">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[0.72rem] uppercase tracking-[0.3em] text-[#859490]">Profile studio</p>
                <h1 class="mt-3 text-4xl font-bold">Your learning identity</h1>
              </div>
              <div class="rounded-full bg-[#111c2d] px-4 py-2 font-mono text-xs text-[#859490]">
                {{ authService.userProfile()?.customId }}
              </div>
            </div>

            <div class="mt-8 rounded-[1.8rem] bg-[#111c2d] p-6">
              <div class="flex items-center gap-4">
                <div class="flex h-16 w-16 items-center justify-center rounded-full bg-[#1f2a3c] text-2xl font-semibold text-[#4fdbc8]">
                  {{ authService.userProfile()?.firstName?.charAt(0) || 'U' }}
                </div>
                <div>
                  <h2 class="text-2xl font-bold">{{ profileForm.get('firstName')?.value || 'Learner' }}</h2>
                  <p class="mt-1 text-sm text-[#859490]">{{ profileForm.get('email')?.value }}</p>
                </div>
              </div>

              <div class="mt-6 grid gap-3 sm:grid-cols-2">
                <div class="rounded-[1.25rem] bg-[#081425] px-4 py-4">
                  <p class="text-xs uppercase tracking-[0.18em] text-[#859490]">Experience</p>
                  <p class="mt-2 text-lg font-semibold">{{ profileForm.get('pythonExperience')?.value }}</p>
                </div>
                <div class="rounded-[1.25rem] bg-[#081425] px-4 py-4">
                  <p class="text-xs uppercase tracking-[0.18em] text-[#859490]">Location</p>
                  <p class="mt-2 text-lg font-semibold">{{ profileForm.get('country')?.value || 'Not set' }}</p>
                </div>
              </div>
            </div>

            <div class="mt-6 space-y-4">
              <div class="rounded-[1.5rem] bg-[#111c2d] px-5 py-4">
                <p class="text-xs uppercase tracking-[0.18em] text-[#859490]">What this influences</p>
                <ul class="mt-3 space-y-2 text-sm leading-7 text-[#bbcac6]">
                  <li>• Lesson complexity and pace</li>
                  <li>• Project recommendations</li>
                  <li>• Community prompts and guidance</li>
                </ul>
              </div>
              <div class="rounded-[1.5rem] bg-[#111c2d] px-5 py-4">
                <p class="text-xs uppercase tracking-[0.18em] text-[#859490]">Selected interests</p>
                <p class="mt-3 text-sm leading-7 text-[#bbcac6]">
                  {{ selectedInterests.length ? selectedInterests.join(', ') : 'No project interests selected yet.' }}
                </p>
              </div>
            </div>
          </div>

          <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="sanctuary-card space-y-6 rounded-[2rem] px-6 py-7 md:px-8 md:py-9">
            <div>
              <p class="text-[0.72rem] uppercase tracking-[0.3em] text-[#859490]">Edit details</p>
              <h2 class="mt-2 text-3xl font-bold">Refine your workspace settings</h2>
            </div>

            <div class="grid gap-5 md:grid-cols-2">
              <label class="block">
                <span class="mb-2 block text-xs uppercase tracking-[0.18em] text-[#859490]">First name</span>
                <input type="text" id="firstName" formControlName="firstName" class="sanctuary-input w-full px-4 py-3 text-sm focus:outline-none">
              </label>

              <label class="block">
                <span class="mb-2 block text-xs uppercase tracking-[0.18em] text-[#859490]">Email</span>
                <input type="email" id="email" formControlName="email" readonly class="sanctuary-input w-full cursor-not-allowed px-4 py-3 text-sm opacity-70">
              </label>

              <label class="block">
                <span class="mb-2 block text-xs uppercase tracking-[0.18em] text-[#859490]">Phone number</span>
                <input type="tel" id="phoneNumber" formControlName="phoneNumber" class="sanctuary-input w-full px-4 py-3 text-sm focus:outline-none">
              </label>

              <label class="block">
                <span class="mb-2 block text-xs uppercase tracking-[0.18em] text-[#859490]">Country</span>
                <select id="country" formControlName="country" class="sanctuary-input w-full appearance-none px-4 py-3 text-sm focus:outline-none">
                  <option value="">Select a country</option>
                  @for (country of countries; track country) {
                    <option [value]="country">{{ country }}</option>
                  }
                </select>
              </label>

              <label class="block">
                <span class="mb-2 block text-xs uppercase tracking-[0.18em] text-[#859490]">Birthday</span>
                <input type="text" id="birthday" formControlName="birthday" placeholder="01/25" class="sanctuary-input w-full px-4 py-3 text-sm focus:outline-none">
              </label>

              <label class="block">
                <span class="mb-2 block text-xs uppercase tracking-[0.18em] text-[#859490]">Python experience</span>
                <select id="pythonExperience" formControlName="pythonExperience" class="sanctuary-input w-full appearance-none px-4 py-3 text-sm focus:outline-none">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Expert">Expert</option>
                </select>
              </label>
            </div>

            <div class="rounded-[1.6rem] bg-[#111c2d] p-5">
              <p class="text-xs uppercase tracking-[0.18em] text-[#859490]">Project interests</p>
              <div class="mt-4 flex flex-wrap gap-2">
                @for (interest of availableInterests; track interest) {
                  <button type="button"
                    (click)="toggleInterest(interest)"
                    [class.bg-[#4fdbc8]]="hasInterest(interest)"
                    [class.text-[#081425]]="hasInterest(interest)"
                    [class.bg-[#081425]]="!hasInterest(interest)"
                    [class.text-[#bbcac6]]="!hasInterest(interest)"
                    class="rounded-full px-4 py-2 text-sm font-medium transition-colors">
                    {{ interest }}
                  </button>
                }
              </div>
            </div>

            <div class="rounded-[1.6rem] bg-[#111c2d] p-5">
              <label class="flex items-start gap-3">
                <input type="checkbox" formControlName="newsletterOptIn"
                  class="mt-1 h-5 w-5 rounded border-[#3c4947] bg-[#081425] text-[#4fdbc8] focus:ring-[#4fdbc8] focus:ring-offset-[#081425]">
                <div class="flex-1">
                  <span class="block font-medium text-[#d8e3fb]">Opt in to LXPython communications</span>
                  <span class="mt-2 block text-sm leading-7 text-[#859490]">Receive infrequent updates, tips, and product notes.</span>
                </div>
              </label>

              @if (profileForm.get('newsletterOptIn')?.value && !authService.userProfile()?.newsletterConfirmed && authService.userProfile()?.email !== ADMIN_EMAIL) {
                <div class="mt-4 flex flex-col gap-3 rounded-[1.25rem] bg-[#081425] p-4 md:flex-row md:items-center md:justify-between">
                  <span class="text-sm text-[#4fdbc8]">Your subscription still needs confirmation.</span>
                  <button type="button" (click)="confirmNewsletter()" class="sanctuary-button rounded-[1rem] px-4 py-2 text-xs font-semibold">
                    Simulate confirmation
                  </button>
                </div>
              } @else if (profileForm.get('newsletterOptIn')?.value && authService.userProfile()?.newsletterConfirmed) {
                <div class="mt-4 flex items-center gap-2 text-sm text-[#a0d0c6]">
                  <mat-icon class="h-4 w-4 text-[16px]">check_circle</mat-icon> Subscription confirmed
                </div>
              }
            </div>

            <div class="flex justify-end pt-2">
              <button type="submit" [disabled]="profileForm.invalid || isSaving"
                class="sanctuary-button flex items-center gap-2 rounded-[1.4rem] px-6 py-4 text-sm font-semibold disabled:opacity-50">
                @if (isSaving) {
                  <mat-icon class="h-5 w-5 animate-spin">refresh</mat-icon>
                  Saving profile
                } @else {
                  <mat-icon class="h-5 w-5">save</mat-icon>
                  Save profile
                }
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  fb = inject(FormBuilder);

  /** Exposed so the template can reference the constant without a pipe. */
  protected readonly ADMIN_EMAIL = ADMIN_EMAIL;

  countries = COUNTRIES;
  profileForm: FormGroup;
  isSaving = false;
  
  availableInterests = [
    'Web Applications', 'Websites', 'Data Science', 'Data Analysis', 
    'Statistics and Research', 'Learning Applications', 'eCommerce', 
    'Machine Learning', 'LLMs', 'Automations'
  ];

  selectedInterests: string[] = [];

  constructor() {
    this.profileForm = this.fb.group({
      firstName: ['', Validators.required],
      email: [''],
      phoneNumber: [''],
      country: [''],
      birthday: ['', [Validators.pattern(/^(0[1-9]|1[0-2])\/(0[1-9]|[12]\d|3[01])$/)]],
      pythonExperience: ['Beginner', Validators.required],
      newsletterOptIn: [false]
    });
  }

  ngOnInit() {
    const profile = this.authService.userProfile();
    this.selectedInterests = profile?.projectInterests || [];
    
    if (profile) {
      this.profileForm.patchValue({
        firstName: profile.firstName || '',
        email: profile.email || '',
        phoneNumber: profile.phoneNumber || '',
        country: profile.country || '',
        birthday: profile.birthday || '',
        pythonExperience: profile.pythonExperience || 'Beginner',
        newsletterOptIn: profile.newsletterOptIn || false
      });
    }
  }

  hasInterest(interest: string): boolean {
    return this.selectedInterests.includes(interest);
  }

  toggleInterest(interest: string) {
    if (this.hasInterest(interest)) {
      this.selectedInterests = this.selectedInterests.filter(i => i !== interest);
    } else {
      this.selectedInterests.push(interest);
    }
  }

  async confirmNewsletter() {
    await this.authService.updateProfile({ newsletterConfirmed: true });
  }

  async saveProfile() {
    if (this.profileForm.invalid) return;
    
    this.isSaving = true;
    try {
      const formValue = this.profileForm.value;
      
      const currentProfile = this.authService.userProfile();
      let confirmed = currentProfile?.newsletterConfirmed || false;
      
      if (formValue.newsletterOptIn && !currentProfile?.newsletterOptIn) {
        confirmed = currentProfile?.email === ADMIN_EMAIL;
      }

      await this.authService.updateProfile({
        firstName: formValue.firstName,
        phoneNumber: formValue.phoneNumber,
        country: formValue.country,
        birthday: formValue.birthday,
        pythonExperience: formValue.pythonExperience,
        projectInterests: this.selectedInterests,
        newsletterOptIn: formValue.newsletterOptIn,
        newsletterConfirmed: confirmed
      });
    } catch (error) {
      console.error('Error saving profile', error);
    } finally {
      this.isSaving = false;
    }
  }
}

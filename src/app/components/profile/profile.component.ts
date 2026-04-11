import { Component, inject, OnInit } from '@angular/core';
import { AuthService } from '../../services/auth.service';
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
    <div class="h-full overflow-y-auto p-6">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center justify-between mb-8">
          <h2 class="text-2xl font-bold text-[#d8e3fb]">Your Profile</h2>
          <div class="text-sm font-mono text-[#859490] bg-[#152031] px-3 py-1 rounded-lg border border-[#3c4947]">
            ID: {{ authService.userProfile()?.customId }}
          </div>
        </div>

        <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-6 bg-[#152031] p-6 rounded-2xl border border-[#3c4947]">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label for="firstName" class="block text-sm font-medium text-[#bbcac6] mb-2">First Name</label>
              <input type="text" id="firstName" formControlName="firstName" 
                class="w-full bg-[#081425] border border-[#3c4947] rounded-xl px-4 py-2.5 text-[#d8e3fb] focus:outline-none focus:border-[#4fdbc8] transition-colors">
            </div>
            
            <div>
              <label for="email" class="block text-sm font-medium text-[#bbcac6] mb-2">Email</label>
              <input type="email" id="email" formControlName="email" readonly
                class="w-full bg-[#081425] border border-[#3c4947] rounded-xl px-4 py-2.5 text-[#859490] cursor-not-allowed opacity-70">
            </div>

            <div>
              <label for="phoneNumber" class="block text-sm font-medium text-[#bbcac6] mb-2">Phone Number</label>
              <input type="tel" id="phoneNumber" formControlName="phoneNumber" 
                class="w-full bg-[#081425] border border-[#3c4947] rounded-xl px-4 py-2.5 text-[#d8e3fb] focus:outline-none focus:border-[#4fdbc8] transition-colors">
            </div>

            <div>
              <label for="country" class="block text-sm font-medium text-[#bbcac6] mb-2">Country</label>
              <select id="country" formControlName="country" 
                class="w-full bg-[#081425] border border-[#3c4947] rounded-xl px-4 py-2.5 text-[#d8e3fb] focus:outline-none focus:border-[#4fdbc8] transition-colors appearance-none">
                <option value="">Select a country</option>
                @for (country of countries; track country) {
                  <option [value]="country">{{ country }}</option>
                }
              </select>
            </div>

            <div>
              <label for="birthday" class="block text-sm font-medium text-[#bbcac6] mb-2">Birthday (MM/DD)</label>
              <input type="text" id="birthday" formControlName="birthday" placeholder="01/25"
                class="w-full bg-[#081425] border border-[#3c4947] rounded-xl px-4 py-2.5 text-[#d8e3fb] focus:outline-none focus:border-[#4fdbc8] transition-colors">
            </div>

            <div>
              <label for="pythonExperience" class="block text-sm font-medium text-[#bbcac6] mb-2">Python Experience</label>
              <select id="pythonExperience" formControlName="pythonExperience" 
                class="w-full bg-[#081425] border border-[#3c4947] rounded-xl px-4 py-2.5 text-[#d8e3fb] focus:outline-none focus:border-[#4fdbc8] transition-colors appearance-none">
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
              </select>
            </div>
          </div>

          <div>
            <div class="block text-sm font-medium text-[#bbcac6] mb-2">Project Interests</div>
            <div class="flex flex-wrap gap-2">
              @for (interest of availableInterests; track interest) {
                <button type="button" 
                  (click)="toggleInterest(interest)"
                  [class]="hasInterest(interest) ? 'bg-[#4fdbc8] text-[#081425] border-[#4fdbc8]' : 'bg-[#081425] text-[#bbcac6] border-[#3c4947] hover:border-[#4fdbc8]'"
                  class="px-4 py-2 rounded-full border text-sm font-medium transition-colors duration-200">
                  {{ interest }}
                </button>
              }
            </div>
          </div>

          <!-- Newsletter Opt-in -->
          <div class="bg-[#1f2a3c] rounded-xl p-4 border border-[#3c4947]">
            <label class="flex items-start gap-3 cursor-pointer">
              <div class="mt-1">
                <input type="checkbox" formControlName="newsletterOptIn"
                  class="w-5 h-5 rounded border-[#3c4947] bg-[#081425] text-[#4fdbc8] focus:ring-[#4fdbc8] focus:ring-offset-[#081425]">
              </div>
              <div class="flex-1">
                <span class="block font-medium text-[#d8e3fb]">Opt-in to LXPython Communications</span>
                <span class="block text-sm text-[#859490] mt-1">
                  Receive infrequent updates, tips, and news.
                </span>
              </div>
            </label>
            
            @if (profileForm.get('newsletterOptIn')?.value && !authService.userProfile()?.newsletterConfirmed && authService.userProfile()?.email !== 'schoedelb@gmail.com') {
              <div class="mt-4 ml-8 p-3 bg-[#4fdbc8]/10 border border-[#4fdbc8]/30 rounded-lg flex items-center justify-between">
                <span class="text-sm text-[#4fdbc8]">Please confirm your subscription.</span>
                <button type="button" (click)="confirmNewsletter()"
                  class="bg-[#4fdbc8] hover:bg-[#71f8e4] text-[#081425] text-xs font-bold py-1.5 px-3 rounded-md transition-colors">
                  Simulate Confirmation
                </button>
              </div>
            } @else if (profileForm.get('newsletterOptIn')?.value && authService.userProfile()?.newsletterConfirmed) {
              <div class="mt-4 ml-8 flex items-center gap-2 text-sm text-[#a0d0c6]">
                <mat-icon class="h-4 w-4 text-[16px]">check_circle</mat-icon> Subscription Confirmed
              </div>
            }
          </div>

          <div class="pt-4 flex justify-end">
            <button type="submit" [disabled]="profileForm.invalid || isSaving"
              class="bg-[#4fdbc8] hover:bg-[#71f8e4] text-[#081425] font-medium py-2.5 px-6 rounded-xl transition-colors duration-200 disabled:opacity-50 flex items-center gap-2">
              @if (isSaving) {
                <mat-icon class="animate-spin h-5 w-5">refresh</mat-icon>
                Saving...
              } @else {
                <mat-icon class="h-5 w-5">save</mat-icon>
                Save Profile
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProfileComponent implements OnInit {
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  
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
        confirmed = currentProfile?.email === 'schoedelb@gmail.com';
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

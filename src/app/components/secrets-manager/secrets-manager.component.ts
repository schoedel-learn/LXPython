import { Component, inject, OnInit, signal } from '@angular/core';
import { SecretsService } from '../../services/secrets.service';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { auth } from '../../../firebase';

@Component({
  selector: 'app-secrets-manager',
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule, DatePipe],
  template: `
    <div class="p-6 max-w-4xl mx-auto">
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-[#e3e3e3] mb-2">Environment Variables</h2>
        <p class="text-[#8e918f]">Securely store API keys and passwords for your Python projects.</p>
      </div>

      @if (!isVerified()) {
        <div class="bg-[#1e1f20] border border-[#444746] rounded-2xl p-8 text-center max-w-md mx-auto mt-12">
          <mat-icon class="text-[#8ab4f8] h-12 w-12 mb-4">security</mat-icon>
          <h3 class="text-xl font-bold text-[#e3e3e3] mb-2">Admin Verification Required</h3>
          <p class="text-[#8e918f] mb-6 text-sm">Please re-authenticate to access your environment variables.</p>
          <button (click)="verifyAdmin()"
            class="bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#131314] font-medium py-2.5 px-6 rounded-xl transition-colors flex items-center gap-2 mx-auto">
            <mat-icon class="h-5 w-5">lock_open</mat-icon> Verify Identity
          </button>
        </div>
      } @else {
        <div class="bg-[#1e1f20] border border-[#444746] rounded-2xl overflow-hidden mb-8">
          <div class="p-4 border-b border-[#444746] bg-[#282a2c] flex justify-between items-center">
            <h3 class="font-medium text-[#e3e3e3]">Your Secrets</h3>
            @if (!isAdding()) {
              <button (click)="isAdding.set(true)"
                class="bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#131314] text-sm font-medium py-1.5 px-4 rounded-lg transition-colors flex items-center gap-1">
                <mat-icon class="h-4 w-4 text-[16px]">add</mat-icon> Add Secret
              </button>
            }
          </div>

          @if (isAdding()) {
            <form [formGroup]="secretForm" (ngSubmit)="saveSecret()" class="p-4 border-b border-[#444746] bg-[#131314]">
              <div class="flex gap-4 items-start">
                <div class="flex-1">
                  <input type="text" formControlName="key" placeholder="e.g. OPENAI_API_KEY"
                    class="w-full bg-[#1e1f20] border border-[#444746] rounded-lg px-3 py-2 text-[#e3e3e3] focus:outline-none focus:border-[#8ab4f8] font-mono text-sm">
                </div>
                <div class="flex-1">
                  <input type="password" formControlName="value" placeholder="Value"
                    class="w-full bg-[#1e1f20] border border-[#444746] rounded-lg px-3 py-2 text-[#e3e3e3] focus:outline-none focus:border-[#8ab4f8] font-mono text-sm">
                </div>
                <div class="flex gap-2">
                  <button type="submit" [disabled]="secretForm.invalid"
                    class="bg-[#81c995] hover:bg-[#a8dab5] text-[#131314] p-2 rounded-lg transition-colors disabled:opacity-50">
                    <mat-icon class="h-5 w-5">check</mat-icon>
                  </button>
                  <button type="button" (click)="cancelAdd()"
                    class="bg-[#444746] hover:bg-[#5f6368] text-[#e3e3e3] p-2 rounded-lg transition-colors">
                    <mat-icon class="h-5 w-5">close</mat-icon>
                  </button>
                </div>
              </div>
            </form>
          }

          <div class="divide-y divide-[#444746]">
            @for (secret of secretsService.secrets(); track secret.id) {
              <div class="p-4 flex items-center justify-between hover:bg-[#282a2c] transition-colors">
                <div class="flex items-center gap-4">
                  <div class="bg-[#131314] border border-[#444746] rounded p-2">
                    <mat-icon class="text-[#8ab4f8] h-5 w-5">vpn_key</mat-icon>
                  </div>
                  <div>
                    <div class="font-mono text-sm text-[#e3e3e3]">{{ secret.key }}</div>
                    <div class="text-xs text-[#8e918f]">Updated: {{ secret.updatedAt | date:'short' }}</div>
                  </div>
                </div>
                <div class="flex items-center gap-4">
                  <div class="font-mono text-sm text-[#8e918f] bg-[#131314] px-3 py-1 rounded border border-[#444746]">
                    ••••••••••••••••
                  </div>
                  <button (click)="deleteSecret(secret.id)"
                    class="text-[#f28b82] hover:bg-[#f28b82]/10 p-2 rounded-lg transition-colors">
                    <mat-icon class="h-5 w-5">delete</mat-icon>
                  </button>
                </div>
              </div>
            } @empty {
              <div class="p-8 text-center text-[#8e918f]">
                <mat-icon class="h-12 w-12 mb-2 opacity-50">lock_outline</mat-icon>
                <p>No secrets stored yet.</p>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class SecretsManagerComponent implements OnInit {
  secretsService = inject(SecretsService);
  authService = inject(AuthService);
  fb = inject(FormBuilder);
  router = inject(Router);

  isAdding = signal(false);
  isVerified = signal(false);
  secretForm: FormGroup;

  constructor() {
    this.secretForm = this.fb.group({
      key: ['', [Validators.required, Validators.pattern(/^[A-Z0-9_]+$/)]],
      value: ['', Validators.required]
    });
  }

  async ngOnInit() {
    // Only allow admin
    if (this.authService.userProfile()?.email !== 'schoedelb@gmail.com') {
      this.router.navigate(['/dashboard/learn']);
      return;
    }
  }

  async verifyAdmin() {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user');
      
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, provider);
      
      this.isVerified.set(true);
      await this.secretsService.loadSecrets(user.uid);
    } catch (error) {
      console.error('Verification failed', error);
      // Optional: show error message
    }
  }

  async saveSecret() {
    if (this.secretForm.invalid) return;
    
    const user = this.authService.currentUser();
    if (!user) return;

    const { key, value } = this.secretForm.value;
    try {
      await this.secretsService.saveSecret(user.uid, key, value);
      this.cancelAdd();
    } catch (error) {
      console.error('Error saving secret', error);
    }
  }

  cancelAdd() {
    this.isAdding.set(false);
    this.secretForm.reset();
  }

  async deleteSecret(secretId: string) {
    const user = this.authService.currentUser();
    if (!user) return;

    if (confirm('Are you sure you want to delete this secret?')) {
      try {
        await this.secretsService.deleteSecret(user.uid, secretId);
      } catch (error) {
        console.error('Error deleting secret', error);
      }
    }
  }
}

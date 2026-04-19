import { Component, inject, OnInit, signal } from '@angular/core';
import { SecretsService } from '../../services/secrets.service';
import { AuthService, ADMIN_EMAIL } from '../../services/auth.service';
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
    <div class="mx-auto max-w-7xl space-y-6 px-4 py-6 text-[#d8e3fb] md:px-8">
      <section class="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div class="sanctuary-card rounded-[2rem] px-6 py-7 md:px-8 md:py-9">
          <p class="text-[0.72rem] uppercase tracking-[0.3em] text-[#859490]">Secrets vault</p>
          <h1 class="mt-3 text-4xl font-bold">Store project credentials in a quieter admin workspace.</h1>
          <p class="mt-5 max-w-2xl text-base leading-8 text-[#bbcac6]">
            Keep sensitive environment variables separate from lessons and forum content, with re-authentication before access.
          </p>

          <div class="mt-10 grid gap-4 md:grid-cols-3">
            <div class="rounded-[1.5rem] bg-[#111c2d] px-5 py-4">
              <p class="text-xs uppercase tracking-[0.18em] text-[#859490]">Verification</p>
              <p class="mt-2 text-lg font-semibold">{{ isVerified() ? 'Verified' : 'Locked' }}</p>
            </div>
            <div class="rounded-[1.5rem] bg-[#111c2d] px-5 py-4">
              <p class="text-xs uppercase tracking-[0.18em] text-[#859490]">Stored secrets</p>
              <p class="mt-2 text-lg font-semibold">{{ secretsService.secrets().length }}</p>
            </div>
            <div class="rounded-[1.5rem] bg-[#111c2d] px-5 py-4">
              <p class="text-xs uppercase tracking-[0.18em] text-[#859490]">Access pattern</p>
              <p class="mt-2 text-sm leading-7 text-[#bbcac6]">Re-authenticate before editing or revealing admin credentials.</p>
            </div>
          </div>
        </div>

        @if (!isVerified()) {
          <div class="sanctuary-card flex flex-col justify-center rounded-[2rem] px-6 py-7 text-center md:px-8 md:py-9">
            <div class="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#1f2a3c] text-[#4fdbc8]">
              <mat-icon class="h-10 w-10 text-[40px]">security</mat-icon>
            </div>
            <h2 class="mt-8 text-3xl font-bold">Admin verification required</h2>
            <p class="mx-auto mt-4 max-w-md text-sm leading-8 text-[#bbcac6]">Re-authenticate to unlock the vault and manage environment variables for the application.</p>
            <button (click)="verifyAdmin()"
              class="sanctuary-button mx-auto mt-8 flex items-center gap-2 rounded-[1.3rem] px-6 py-4 text-sm font-semibold">
              <mat-icon class="h-5 w-5">lock_open</mat-icon> Verify identity
            </button>
          </div>
        } @else {
          <div class="sanctuary-card rounded-[2rem] px-6 py-7 md:px-8 md:py-9">
            <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p class="text-[0.72rem] uppercase tracking-[0.3em] text-[#859490]">Active vault</p>
                <h2 class="mt-2 text-3xl font-bold">Manage secure keys</h2>
              </div>
              @if (!isAdding()) {
                <button (click)="isAdding.set(true)" class="sanctuary-button rounded-[1.2rem] px-5 py-3 text-sm font-semibold">
                  Add secret
                </button>
              }
            </div>

            @if (isAdding()) {
              <form [formGroup]="secretForm" (ngSubmit)="saveSecret()" class="mt-6 rounded-[1.6rem] bg-[#111c2d] p-5">
                <div class="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
                  <input type="text" formControlName="key" placeholder="e.g. OPENAI_API_KEY"
                    class="sanctuary-input w-full px-4 py-3 font-mono text-sm focus:outline-none">
                  <input type="password" formControlName="value" placeholder="Value"
                    class="sanctuary-input w-full px-4 py-3 font-mono text-sm focus:outline-none">
                  <div class="flex gap-2">
                    <button type="submit" [disabled]="secretForm.invalid"
                      class="rounded-[1rem] bg-[#a0d0c6] px-4 py-3 text-[#081425] transition-colors hover:bg-[#bbece2] disabled:opacity-50">
                      <mat-icon class="h-5 w-5">check</mat-icon>
                    </button>
                    <button type="button" (click)="cancelAdd()"
                      class="rounded-[1rem] bg-[#081425] px-4 py-3 text-[#d8e3fb] transition-colors hover:bg-[#1f2a3c]">
                      <mat-icon class="h-5 w-5">close</mat-icon>
                    </button>
                  </div>
                </div>
              </form>
            }
          </div>
        }
      </section>

      @if (isVerified()) {
        <section class="sanctuary-card rounded-[2rem] px-6 py-7 md:px-8 md:py-9">
          <div class="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p class="text-[0.72rem] uppercase tracking-[0.3em] text-[#859490]">Saved entries</p>
              <h2 class="mt-2 text-3xl font-bold">Vault contents</h2>
            </div>
            <div class="rounded-full bg-[#111c2d] px-4 py-2 text-sm text-[#bbcac6]">{{ secretsService.secrets().length }} entries</div>
          </div>

          <div class="grid gap-4">
            @for (secret of secretsService.secrets(); track secret.id) {
              <article class="rounded-[1.6rem] bg-[#111c2d] px-5 py-5">
                <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div class="flex items-center gap-4">
                    <div class="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#081425] text-[#4fdbc8]">
                      <mat-icon>vpn_key</mat-icon>
                    </div>
                    <div>
                      <p class="font-mono text-sm text-[#d8e3fb]">{{ secret.key }}</p>
                      <p class="mt-1 text-xs uppercase tracking-[0.16em] text-[#859490]">Updated {{ secret.updatedAt | date:'short' }}</p>
                    </div>
                  </div>
                  <div class="flex items-center gap-3">
                    <div class="rounded-full bg-[#081425] px-4 py-2 font-mono text-xs text-[#859490]">••••••••••••••••</div>
                    <button (click)="deleteSecret(secret.id)"
                      class="rounded-full bg-[#ffb4ab]/10 p-3 text-[#ffb4ab] transition-colors hover:bg-[#ffb4ab]/20">
                      <mat-icon class="h-5 w-5">delete</mat-icon>
                    </button>
                  </div>
                </div>
              </article>
            } @empty {
              <div class="rounded-[1.6rem] bg-[#111c2d] px-8 py-16 text-center text-[#859490]">
                <mat-icon class="h-12 w-12 text-[48px] opacity-50">lock_outline</mat-icon>
                <p class="mt-4 text-sm">No secrets stored yet.</p>
              </div>
            }
          </div>
        </section>
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
    if (this.authService.userProfile()?.email !== ADMIN_EMAIL) {
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

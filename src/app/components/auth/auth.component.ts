import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <div class="min-h-[100dvh] bg-[#081425] text-[#d8e3fb] px-4 py-8 md:px-8">
      <div class="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-7xl flex-col justify-center gap-8 xl:grid xl:grid-cols-[1.1fr_0.9fr]">
        <section class="sanctuary-card overflow-hidden px-6 py-8 md:px-10 md:py-12 lg:px-12">
          <div class="mb-10 flex items-center gap-4">
            <div class="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1f2a3c] text-lg font-semibold text-[#4fdbc8] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
              &lt;/&gt;
            </div>
            <div>
              <p class="text-[0.7rem] uppercase tracking-[0.28em] text-[#859490]">Digital Sanctuary</p>
              <h1 class="text-3xl font-bold tracking-tight md:text-4xl">LXPython</h1>
            </div>
          </div>

          <div class="max-w-2xl space-y-6">
            <p class="text-[0.72rem] uppercase tracking-[0.3em] text-[#4fdbc8]/70">Quiet learning for curious builders</p>
            <h2 class="max-w-xl text-4xl font-bold leading-tight md:text-6xl">
              Learn Python in a calmer, more focused workspace.
            </h2>
            <p class="max-w-xl text-base leading-8 text-[#bbcac6] md:text-lg">
              Move from prompt to practice with AI guidance, structured exercises, and a code studio that keeps the next step visible without overwhelming the rest of the screen.
            </p>
          </div>

          <div class="mt-10 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
            <div class="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div class="rounded-[1.7rem] bg-[#111c2d] px-5 py-4">
                <p class="text-[0.7rem] uppercase tracking-[0.22em] text-[#859490]">Flow</p>
                <p class="mt-2 text-sm text-[#bbcac6]">One primary task per view, with generous spacing and fewer distractions.</p>
              </div>
              <div class="rounded-[1.7rem] bg-[#111c2d] px-5 py-4">
                <p class="text-[0.7rem] uppercase tracking-[0.22em] text-[#859490]">Support</p>
                <p class="mt-2 text-sm text-[#bbcac6]">Inline AI facilitation, documentation, and execution feedback in one rhythm.</p>
              </div>
              <div class="rounded-[1.7rem] bg-[#111c2d] px-5 py-4">
                <p class="text-[0.7rem] uppercase tracking-[0.22em] text-[#859490]">Practice</p>
                <p class="mt-2 text-sm text-[#bbcac6]">Experiment in a code editor tuned for steady progress instead of visual noise.</p>
              </div>
            </div>

            <div class="rounded-[2rem] bg-[#111c2d] p-5">
              <div class="flex items-center justify-between">
                <p class="text-[0.68rem] uppercase tracking-[0.22em] text-[#859490]">Workspace preview</p>
                <span class="rounded-full bg-[#1f2a3c] px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-[#4fdbc8]">Preview</span>
              </div>
              <div class="mt-4 grid gap-4">
                <div class="rounded-[1.5rem] bg-[#081425] p-4">
                  <div class="flex items-center justify-between">
                    <span class="text-xs uppercase tracking-[0.16em] text-[#859490]">Code studio</span>
                    <span class="text-xs text-[#4fdbc8]">Run-ready</span>
                  </div>
                  <div class="mt-3 rounded-[1.25rem] bg-[#040e1f] p-4 font-mono text-xs text-[#bbcac6]">
                  <div>def greet(name):</div>
                    <div class="pl-4 text-[#4fdbc8]">return f"Hello, &#123;name&#125;"</div>
                    <div class="mt-2">print(greet("LXPython"))</div>
                  </div>
                </div>
                <div class="grid gap-4 md:grid-cols-2">
                  <div class="rounded-[1.5rem] bg-[#081425] p-4">
                    <p class="text-xs uppercase tracking-[0.16em] text-[#859490]">Coach</p>
                    <p class="mt-3 rounded-[1rem] bg-[#111c2d] px-3 py-3 text-sm leading-7 text-[#bbcac6]">“Try explaining the loop in plain language before you rewrite it.”</p>
                  </div>
                  <div class="rounded-[1.5rem] bg-[#081425] p-4">
                    <p class="text-xs uppercase tracking-[0.16em] text-[#859490]">Reference</p>
                    <p class="mt-3 text-sm leading-7 text-[#bbcac6]">Lesson notes, examples, and next-step prompts remain visible while you code.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="grid gap-6">
          <div class="sanctuary-card flex flex-col justify-between gap-8 px-6 py-8 md:px-8 md:py-10">
            <div class="space-y-4">
              <p class="text-[0.72rem] uppercase tracking-[0.28em] text-[#859490]">Start session</p>
              <h3 class="text-3xl font-bold md:text-4xl">Continue with Google</h3>
              <p class="text-sm leading-7 text-[#bbcac6]">
                Sign in to resume your learning loop, preserve your code attempts, and keep your profile and community activity in sync.
              </p>
            </div>

            <div class="rounded-[1.5rem] bg-[#111c2d] p-4">
              <div class="mb-4 flex items-center justify-between rounded-[1.25rem] bg-[#081425] px-4 py-3 text-sm text-[#bbcac6]">
                <span>Registration + login</span>
                <span class="rounded-full bg-[#1f2a3c] px-3 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-[#4fdbc8]">Redesigned</span>
              </div>

              @if (loginError()) {
                <div class="mb-4 flex items-start gap-3 rounded-[1.25rem] bg-[#ffb4ab]/10 px-4 py-4">
                  <mat-icon class="mt-0.5 h-5 w-5 shrink-0 text-[20px] text-[#ffb4ab]">lock</mat-icon>
                  <div>
                    <p class="text-sm font-semibold text-[#ffb4ab]">Access restricted</p>
                    <p class="mt-1 text-xs leading-6 text-[#ffb4ab]/80">{{ loginError() }}</p>
                  </div>
                </div>
              }

              <button
                (click)="login()"
                [disabled]="isLoggingIn()"
                class="sanctuary-button flex w-full items-center justify-center gap-3 rounded-[1.5rem] px-5 py-4 text-base font-semibold transition-transform duration-200 active:scale-[0.99] disabled:opacity-60">
                @if (isLoggingIn()) {
                  <div class="h-5 w-5 animate-spin rounded-full border-2 border-[#003731] border-t-transparent"></div>
                  Signing in…
                } @else {
                  <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-base font-bold text-[#003731]">G</span>
                  Sign in with Google
                }
              </button>
              <p class="mt-4 text-center text-xs leading-6 text-[#859490]">
                New accounts are guided through a short onboarding flow before entering the workspace.
              </p>
            </div>

            <div class="grid gap-3 sm:grid-cols-2">
              <div class="rounded-[1.5rem] bg-[#111c2d] px-4 py-4 text-sm text-[#bbcac6]">
                <p class="text-[0.68rem] uppercase tracking-[0.18em] text-[#859490]">Arrival</p>
                <p class="mt-2 leading-7">Landing, login, and registration are now designed as a single editorial entry experience.</p>
              </div>
              <div class="rounded-[1.5rem] bg-[#111c2d] px-4 py-4 text-sm text-[#bbcac6]">
                <p class="text-[0.68rem] uppercase tracking-[0.18em] text-[#859490]">Continuity</p>
                <p class="mt-2 leading-7">Your profile, community activity, and practice history stay connected once you enter the app.</p>
              </div>
            </div>
          </div>

          <div class="sanctuary-card rounded-[2rem] px-6 py-6 md:px-8">
            <div class="flex items-center justify-between rounded-2xl bg-[#111c2d] px-4 py-3 text-sm text-[#bbcac6]">
              <span>Adaptive learning</span>
              <span class="rounded-full bg-[#1f2a3c] px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-[#4fdbc8]">Focused UX</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  `
})
export class AuthComponent {
  authService = inject(AuthService);
  isLoggingIn = signal(false);
  loginError = signal<string | null>(null);

  async login() {
    this.loginError.set(null);
    this.isLoggingIn.set(true);
    try {
      await this.authService.loginWithGoogle();
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'ACCESS_DENIED') {
        this.loginError.set('This workspace is currently private. Only authorised accounts may sign in.');
      } else {
        this.loginError.set('Sign-in failed. Please try again.');
        console.error('Failed to login', error);
      }
    } finally {
      this.isLoggingIn.set(false);
    }
  }
}

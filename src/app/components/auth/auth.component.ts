import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  template: `
    <div class="min-h-[100dvh] bg-[#081425] text-[#d8e3fb] px-4 py-8 md:px-8">
      <div class="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-6xl flex-col justify-center gap-8 lg:grid lg:grid-cols-[1.2fr_0.8fr]">
        <section class="sanctuary-card px-6 py-8 md:px-10 md:py-12 lg:min-h-[32rem] lg:px-12">
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

          <div class="mt-10 grid gap-4 md:grid-cols-3">
            <div class="rounded-2xl bg-[#111c2d] px-5 py-4">
              <p class="text-[0.7rem] uppercase tracking-[0.22em] text-[#859490]">Flow</p>
              <p class="mt-2 text-sm text-[#bbcac6]">One primary task per view, with generous spacing and fewer distractions.</p>
            </div>
            <div class="rounded-2xl bg-[#111c2d] px-5 py-4">
              <p class="text-[0.7rem] uppercase tracking-[0.22em] text-[#859490]">Support</p>
              <p class="mt-2 text-sm text-[#bbcac6]">Inline AI facilitation, documentation, and execution feedback in one rhythm.</p>
            </div>
            <div class="rounded-2xl bg-[#111c2d] px-5 py-4">
              <p class="text-[0.7rem] uppercase tracking-[0.22em] text-[#859490]">Practice</p>
              <p class="mt-2 text-sm text-[#bbcac6]">Experiment in a code editor tuned for steady progress instead of visual noise.</p>
            </div>
          </div>
        </section>

        <section class="sanctuary-card flex flex-col justify-between gap-8 px-6 py-8 md:px-8 md:py-10">
          <div class="space-y-4">
            <p class="text-[0.72rem] uppercase tracking-[0.28em] text-[#859490]">Start session</p>
            <h3 class="text-3xl font-bold md:text-4xl">Continue with Google</h3>
            <p class="text-sm leading-7 text-[#bbcac6]">
              Sign in to resume your learning loop, preserve your code attempts, and keep your profile and community activity in sync.
            </p>
          </div>

          <div class="rounded-[1.5rem] bg-[#111c2d] p-4">
            <button
              (click)="login()"
              class="sanctuary-button flex w-full items-center justify-center gap-3 rounded-[1.5rem] px-5 py-4 text-base font-semibold transition-transform duration-200 active:scale-[0.99]">
              <span class="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-base font-bold text-[#003731]">G</span>
              Sign in with Google
            </button>
            <p class="mt-4 text-center text-xs leading-6 text-[#859490]">
              New accounts are guided through a short onboarding flow before entering the workspace.
            </p>
          </div>

          <div class="flex items-center justify-between rounded-2xl bg-[#111c2d] px-4 py-3 text-sm text-[#bbcac6]">
            <span>Adaptive learning</span>
            <span class="rounded-full bg-[#1f2a3c] px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-[#4fdbc8]">Focused UX</span>
          </div>
        </section>
      </div>
    </div>
  `
})
export class AuthComponent {
  authService = inject(AuthService);

  async login() {
    try {
      await this.authService.loginWithGoogle();
    } catch (error) {
      console.error('Failed to login', error);
    }
  }
}

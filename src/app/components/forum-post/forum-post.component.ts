import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ForumService, ForumPost, ForumReply } from '../../services/forum.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forum-post',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule],
  template: `
    <div class="h-full w-full overflow-y-auto bg-[#081425] px-4 py-6 text-[#d8e3fb] md:px-8">
      <div class="mx-auto max-w-7xl space-y-6">
        <button routerLink="/dashboard/forum" class="inline-flex items-center gap-2 rounded-full bg-[#152031] px-4 py-2 text-sm font-medium text-[#4fdbc8] transition-colors hover:bg-[#1f2a3c]">
          <mat-icon class="h-[18px] w-[18px] text-[18px]">arrow_back</mat-icon> Back to forum
        </button>

        @if (isLoading()) {
          <div class="sanctuary-card flex justify-center rounded-[2rem] py-16">
            <mat-icon class="h-10 w-10 animate-spin text-[40px] text-[#4fdbc8]">refresh</mat-icon>
          </div>
        }

        @if (!isLoading() && !post()) {
          <div class="sanctuary-card rounded-[2rem] px-8 py-16 text-center">
            <mat-icon class="h-12 w-12 text-[48px] text-[#859490]">error_outline</mat-icon>
            <h3 class="mt-4 text-2xl font-semibold">Post not found</h3>
            <p class="mt-3 text-sm leading-7 text-[#859490]">This discussion may have been removed or the link may no longer be valid.</p>
          </div>
        }

        @if (post(); as p) {
          <div class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <section class="space-y-6">
              <article class="sanctuary-card rounded-[2rem] px-6 py-7 md:px-8 md:py-9">
                <div class="flex flex-wrap items-center gap-3">
                  <span class="rounded-full bg-[#1f2a3c] px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-[#4fdbc8]">{{ p.tags[0] }}</span>
                  <span class="text-xs uppercase tracking-[0.18em] text-[#859490]">{{ formatDate(p.createdAt) }}</span>
                </div>
                <h1 class="mt-5 max-w-3xl text-4xl font-bold leading-tight">{{ p.title }}</h1>
                <div class="mt-6 flex flex-wrap items-center gap-4 text-sm text-[#bbcac6]">
                  <div class="flex items-center gap-2 rounded-full bg-[#111c2d] px-4 py-2">
                    <mat-icon class="h-4 w-4 text-[16px] text-[#4fdbc8]">person</mat-icon>
                    {{ p.authorName }}
                  </div>
                  <div class="flex items-center gap-2 rounded-full bg-[#111c2d] px-4 py-2">
                    <mat-icon class="h-4 w-4 text-[16px]">chat_bubble_outline</mat-icon>
                    {{ p.replyCount }} replies
                  </div>
                </div>
                <div class="mt-8 rounded-[1.6rem] bg-[#111c2d] p-5">
                  <p class="whitespace-pre-wrap text-base leading-8 text-[#d8e3fb]">{{ p.content }}</p>
                </div>
              </article>

              <section class="space-y-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-[0.72rem] uppercase tracking-[0.3em] text-[#859490]">Conversation</p>
                    <h2 class="mt-2 text-3xl font-bold">Replies</h2>
                  </div>
                  <div class="rounded-full bg-[#152031] px-4 py-2 text-sm text-[#bbcac6]">{{ replies().length }} messages</div>
                </div>

                @for (reply of replies(); track reply.id) {
                  <article class="sanctuary-card rounded-[1.8rem] px-5 py-5 md:px-6">
                    <div class="flex flex-wrap items-center justify-between gap-3">
                      <div class="flex items-center gap-3">
                        <div class="flex h-10 w-10 items-center justify-center rounded-full bg-[#111c2d] text-sm font-semibold text-[#4fdbc8]">
                          {{ reply.authorName.charAt(0).toUpperCase() }}
                        </div>
                        <div>
                          <p class="font-semibold text-[#d8e3fb]">{{ reply.authorName }}</p>
                          <p class="text-xs uppercase tracking-[0.16em] text-[#859490]">{{ formatDate(reply.createdAt) }}</p>
                        </div>
                      </div>
                    </div>
                    <p class="mt-4 whitespace-pre-wrap text-sm leading-8 text-[#bbcac6]">{{ reply.content }}</p>
                  </article>
                }
              </section>
            </section>

            <aside class="space-y-6">
              <div class="sanctuary-card rounded-[2rem] px-6 py-7 md:px-8">
                <p class="text-[0.72rem] uppercase tracking-[0.3em] text-[#859490]">Reply composer</p>
                <h3 class="mt-2 text-3xl font-bold">Add your perspective</h3>
                <p class="mt-3 text-sm leading-7 text-[#bbcac6]">Keep answers practical, specific, and easy for another learner to act on.</p>
                <textarea [(ngModel)]="newReplyContent" rows="8" placeholder="Write your response here..." aria-label="Reply content"
                  class="sanctuary-input mt-6 w-full resize-y px-4 py-4 text-sm focus:outline-none"></textarea>
                <button (click)="submitReply()" [disabled]="!newReplyContent.trim() || isSubmitting()"
                  class="sanctuary-button mt-5 flex w-full items-center justify-center gap-2 rounded-[1.3rem] px-5 py-4 text-sm font-semibold disabled:opacity-50">
                  @if (isSubmitting()) {
                    <mat-icon class="h-4 w-4 animate-spin">refresh</mat-icon>
                  }
                  Post reply
                </button>
              </div>

              <div class="sanctuary-card rounded-[2rem] px-6 py-7 md:px-8">
                <p class="text-[0.72rem] uppercase tracking-[0.3em] text-[#859490]">Thread cues</p>
                <div class="mt-5 space-y-4">
                  <div class="rounded-[1.4rem] bg-[#111c2d] px-4 py-4">
                    <p class="text-xs uppercase tracking-[0.16em] text-[#859490]">Best next step</p>
                    <p class="mt-2 text-sm leading-7 text-[#bbcac6]">Answer the exact issue first, then add any broader explanation after the learner can move again.</p>
                  </div>
                  <div class="rounded-[1.4rem] bg-[#111c2d] px-4 py-4">
                    <p class="text-xs uppercase tracking-[0.16em] text-[#859490]">Tone</p>
                    <p class="mt-2 text-sm leading-7 text-[#bbcac6]">Prefer clear, calm, reproducible guidance over broad debate.</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        }
      </div>
    </div>
  `
})
export class ForumPostComponent implements OnInit {
  route = inject(ActivatedRoute);
  forumService = inject(ForumService);
  authService = inject(AuthService);

  postId = signal<string | null>(null);
  post = signal<ForumPost | null>(null);
  replies = signal<ForumReply[]>([]);
  
  isLoading = signal(true);
  isSubmitting = signal(false);
  newReplyContent = '';

  async ngOnInit() {
    this.route.paramMap.subscribe(async params => {
      const id = params.get('id');
      if (id) {
        this.postId.set(id);
        await this.loadPostData(id);
      } else {
        this.isLoading.set(false);
      }
    });
  }

  async loadPostData(id: string) {
    this.isLoading.set(true);
    try {
      const fetchedPost = await this.forumService.getPost(id);
      this.post.set(fetchedPost);
      
      if (fetchedPost) {
        const fetchedReplies = await this.forumService.getReplies(id);
        this.replies.set(fetchedReplies);
      }
    } catch (error) {
      console.error('Error loading post data:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  async submitReply() {
    const pId = this.postId();
    if (!pId || !this.newReplyContent.trim()) return;
    
    this.isSubmitting.set(true);
    try {
      const profile = this.authService.userProfile();
      const authorName = profile?.firstName || 'Anonymous Learner';
      
      await this.forumService.createReply(pId, this.newReplyContent, authorName);
      this.newReplyContent = '';
      
      // Reload replies and update post reply count
      await this.loadPostData(pId);
    } catch (error) {
      console.error('Failed to submit reply', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
}

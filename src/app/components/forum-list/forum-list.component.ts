import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule, Router } from '@angular/router';
import { ForumService, ForumPost } from '../../services/forum.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forum-list',
  standalone: true,
  imports: [CommonModule, FormsModule, MatIconModule, RouterModule],
  template: `
    <div class="h-full w-full overflow-y-auto bg-[#081425] px-4 py-6 text-[#d8e3fb] md:px-8">
      <div class="mx-auto max-w-7xl space-y-6">
        <section class="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div class="sanctuary-card rounded-[2rem] px-6 py-7 md:px-8 md:py-9">
            <p class="text-[0.72rem] uppercase tracking-[0.3em] text-[#859490]">Community studio</p>
            <h1 class="mt-3 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">A slower, clearer discussion space for learners building in public.</h1>
            <p class="mt-5 max-w-2xl text-base leading-8 text-[#bbcac6]">
              Ask a focused question, share an experiment, or offer feedback without the clutter of a traditional forum timeline.
            </p>

            <div class="mt-10 grid gap-4 md:grid-cols-3">
              <div class="rounded-[1.5rem] bg-[#111c2d] px-5 py-4">
                <p class="text-[0.68rem] uppercase tracking-[0.24em] text-[#859490]">Open threads</p>
                <p class="mt-2 text-3xl font-bold">{{ posts().length }}</p>
              </div>
              <div class="rounded-[1.5rem] bg-[#111c2d] px-5 py-4">
                <p class="text-[0.68rem] uppercase tracking-[0.24em] text-[#859490]">Current filter</p>
                <p class="mt-2 text-lg font-semibold">{{ selectedFilterTag() || 'All posts' }}</p>
              </div>
              <div class="rounded-[1.5rem] bg-[#111c2d] px-5 py-4">
                <p class="text-[0.68rem] uppercase tracking-[0.24em] text-[#859490]">Best use</p>
                <p class="mt-2 text-sm leading-7 text-[#bbcac6]">Questions, project feedback, and pattern-sharing from the learning loop.</p>
              </div>
            </div>
          </div>

          <div class="sanctuary-card rounded-[2rem] px-6 py-7 md:px-8 md:py-9">
            <div class="flex items-start justify-between gap-4">
              <div>
                <p class="text-[0.72rem] uppercase tracking-[0.3em] text-[#859490]">Compose</p>
                <h2 class="mt-2 text-3xl font-bold">Start a new thread</h2>
              </div>
              @if (!isCreating()) {
                <button (click)="isCreating.set(true)" class="sanctuary-button rounded-[1.25rem] px-4 py-3 text-sm font-semibold">
                  New post
                </button>
              }
            </div>

            @if (isCreating()) {
              <div class="mt-6 space-y-4">
                <label class="block">
                  <span class="mb-2 block text-xs uppercase tracking-[0.18em] text-[#859490]">Title</span>
                  <input id="postTitle" type="text" [(ngModel)]="newPostTitle" placeholder="What's on your mind?"
                    class="sanctuary-input w-full px-4 py-3 text-sm focus:outline-none">
                </label>

                <label class="block">
                  <span class="mb-2 block text-xs uppercase tracking-[0.18em] text-[#859490]">Prompt</span>
                  <textarea id="postContent" [(ngModel)]="newPostContent" rows="5" placeholder="Describe your question or share your project details..."
                    class="sanctuary-input w-full resize-y px-4 py-3 text-sm focus:outline-none"></textarea>
                </label>

                <div>
                  <span class="mb-3 block text-xs uppercase tracking-[0.18em] text-[#859490]">Tag</span>
                  <div class="flex flex-wrap gap-2">
                    @for (tag of availableTags; track tag) {
                      <button
                        (click)="newPostTag.set(tag)"
                        [class.bg-[#4fdbc8]]="newPostTag() === tag"
                        [class.text-[#081425]]="newPostTag() === tag"
                        [class.bg-[#111c2d]]="newPostTag() !== tag"
                        [class.text-[#d8e3fb]]="newPostTag() !== tag"
                        class="rounded-full px-4 py-2 text-xs font-medium transition-colors">
                        {{ tag }}
                      </button>
                    }
                  </div>
                </div>

                <div class="flex justify-end gap-3 pt-2">
                  <button (click)="isCreating.set(false)" class="rounded-[1.1rem] bg-[#111c2d] px-4 py-3 text-sm font-medium text-[#d8e3fb] transition-colors hover:bg-[#1f2a3c]">
                    Cancel
                  </button>
                  <button (click)="submitPost()" [disabled]="!newPostTitle || !newPostContent || !newPostTag() || isSubmitting()"
                    class="sanctuary-button flex items-center gap-2 rounded-[1.1rem] px-5 py-3 text-sm font-semibold disabled:opacity-50">
                    @if (isSubmitting()) {
                      <mat-icon class="h-4 w-4 animate-spin">refresh</mat-icon>
                    }
                    Publish thread
                  </button>
                </div>
              </div>
            } @else {
              <div class="mt-8 rounded-[1.5rem] bg-[#111c2d] px-5 py-4">
                <p class="text-sm leading-7 text-[#bbcac6]">Use threads for practical learning moments: debugging help, architecture questions, project demos, or library recommendations.</p>
              </div>
            }
          </div>
        </section>

        <section class="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <aside class="sanctuary-card rounded-[2rem] px-6 py-7 md:px-8 md:py-9">
            <p class="text-[0.72rem] uppercase tracking-[0.3em] text-[#859490]">Browse by focus</p>
            <div class="mt-6 flex flex-wrap gap-3">
              <button (click)="filterByTag(null)"
                [class.bg-[#d8e3fb]]="!selectedFilterTag()"
                [class.text-[#081425]]="!selectedFilterTag()"
                [class.bg-[#111c2d]]="selectedFilterTag()"
                [class.text-[#bbcac6]]="selectedFilterTag()"
                class="rounded-full px-4 py-2 text-sm font-medium transition-colors">
                All posts
              </button>
              @for (tag of availableTags; track tag) {
                <button
                  (click)="filterByTag(tag)"
                  [class.bg-[#d8e3fb]]="selectedFilterTag() === tag"
                  [class.text-[#081425]]="selectedFilterTag() === tag"
                  [class.bg-[#111c2d]]="selectedFilterTag() !== tag"
                  [class.text-[#bbcac6]]="selectedFilterTag() !== tag"
                  class="rounded-full px-4 py-2 text-sm font-medium transition-colors">
                  {{ tag }}
                </button>
              }
            </div>

            <div class="mt-8 space-y-4">
              @for (tag of availableTags; track tag) {
                <div class="rounded-[1.4rem] bg-[#111c2d] px-4 py-4">
                  <p class="text-xs uppercase tracking-[0.18em] text-[#859490]">{{ tag }}</p>
                  <p class="mt-2 text-sm leading-7 text-[#bbcac6]">{{ selectedFilterTag() === tag ? 'Currently selected for a quieter, more focused reading view.' : 'Tap to narrow the room to this topic.' }}</p>
                </div>
              }
            </div>
          </aside>

          <div class="space-y-4">
            @if (isLoading()) {
              <div class="sanctuary-card flex justify-center rounded-[2rem] py-16">
                <mat-icon class="h-10 w-10 animate-spin text-[40px] text-[#4fdbc8]">refresh</mat-icon>
              </div>
            }

            @if (!isLoading() && posts().length === 0) {
              <div class="sanctuary-card rounded-[2rem] px-8 py-16 text-center">
                <mat-icon class="h-12 w-12 text-[48px] text-[#859490]">forum</mat-icon>
                <h3 class="mt-4 text-2xl font-semibold">No posts found</h3>
                <p class="mt-3 text-sm leading-7 text-[#859490]">Be the first to begin a calmer conversation in this space.</p>
              </div>
            }

            @for (post of posts(); track post.id; let i = $index) {
              <article (click)="viewPost(post.id!)" (keydown.enter)="viewPost(post.id!)" tabindex="0" role="button"
                class="sanctuary-card group cursor-pointer rounded-[2rem] px-6 py-6 transition-transform duration-200 hover:-translate-y-0.5 md:px-8">
                <div class="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div class="max-w-3xl">
                    <div class="flex flex-wrap items-center gap-3">
                      <span class="rounded-full bg-[#1f2a3c] px-3 py-1 text-[0.68rem] uppercase tracking-[0.18em] text-[#4fdbc8]">{{ post.tags[0] }}</span>
                      <span class="text-xs uppercase tracking-[0.16em] text-[#859490]">{{ formatDate(post.createdAt) }}</span>
                    </div>
                    <h3 class="mt-4 text-2xl font-bold transition-colors group-hover:text-[#4fdbc8]">{{ post.title }}</h3>
                    <p class="mt-4 line-clamp-3 max-w-2xl text-sm leading-8 text-[#bbcac6]">{{ post.content }}</p>
                  </div>

                  <div class="rounded-[1.4rem] bg-[#111c2d] px-4 py-4 text-sm text-[#bbcac6] md:min-w-52">
                    <p class="text-[0.68rem] uppercase tracking-[0.18em] text-[#859490]">Thread snapshot</p>
                    <div class="mt-3 flex items-center gap-2 text-[#d8e3fb]">
                      <mat-icon class="h-4 w-4 text-[16px] text-[#4fdbc8]">chat_bubble_outline</mat-icon>
                      {{ post.replyCount }} replies
                    </div>
                    <div class="mt-2 flex items-center gap-2">
                      <mat-icon class="h-4 w-4 text-[16px]">person</mat-icon>
                      {{ post.authorName }}
                    </div>
                  </div>
                </div>
              </article>
            }
          </div>
        </section>
      </div>
    </div>
  `
})
export class ForumListComponent implements OnInit {
  forumService = inject(ForumService);
  authService = inject(AuthService);
  router = inject(Router);

  posts = signal<ForumPost[]>([]);
  isLoading = signal(true);
  
  availableTags = ['Beginner Question', 'Project Feedback', 'Library Help', 'General Discussion'];
  selectedFilterTag = signal<string | null>(null);

  isCreating = signal(false);
  isSubmitting = signal(false);
  newPostTitle = '';
  newPostContent = '';
  newPostTag = signal<string>('Beginner Question');

  async ngOnInit() {
    await this.loadPosts();
  }

  async loadPosts() {
    this.isLoading.set(true);
    const fetchedPosts = await this.forumService.getPosts(this.selectedFilterTag() || undefined);
    this.posts.set(fetchedPosts);
    this.isLoading.set(false);
  }

  async filterByTag(tag: string | null) {
    this.selectedFilterTag.set(tag);
    await this.loadPosts();
  }

  async submitPost() {
    if (!this.newPostTitle || !this.newPostContent || !this.newPostTag()) return;
    
    this.isSubmitting.set(true);
    try {
      const profile = this.authService.userProfile();
      const authorName = profile?.firstName || 'Anonymous Learner';
      
      await this.forumService.createPost(
        this.newPostTitle,
        this.newPostContent,
        [this.newPostTag()],
        authorName
      );
      
      this.isCreating.set(false);
      this.newPostTitle = '';
      this.newPostContent = '';
      this.newPostTag.set('Beginner Question');
      
      await this.loadPosts();
    } catch (error) {
      console.error('Failed to create post', error);
    } finally {
      this.isSubmitting.set(false);
    }
  }

  viewPost(postId: string) {
    this.router.navigate(['/dashboard/forum', postId]);
  }

  formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  }
}

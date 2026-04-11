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
    <div class="h-full w-full flex flex-col bg-[#081425] text-[#d8e3fb] overflow-y-auto p-4 md:p-8">
      <div class="max-w-5xl mx-auto w-full">
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 class="text-2xl font-bold text-[#d8e3fb] flex items-center gap-2">
              <mat-icon class="text-[#4fdbc8]">forum</mat-icon> Community Forum
            </h1>
            <p class="text-[#859490] mt-1">Ask questions, share projects, and learn together.</p>
          </div>
          @if (!isCreating()) {
            <button (click)="isCreating.set(true)"
              class="bg-[#4fdbc8] hover:bg-[#71f8e4] text-[#081425] font-bold py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
              <mat-icon>add</mat-icon> New Post
            </button>
          }
        </div>

        <!-- Create Post Form -->
        @if (isCreating()) {
          <div class="bg-[#152031] border border-[#3c4947] rounded-xl p-6 mb-8 shadow-sm">
            <h2 class="text-lg font-bold text-[#d8e3fb] mb-4">Create a New Post</h2>
            
            <div class="mb-4">
              <label for="postTitle" class="block text-sm font-medium text-[#859490] mb-1">Title</label>
              <input id="postTitle" type="text" [(ngModel)]="newPostTitle" placeholder="What's on your mind?"
                class="w-full bg-[#081425] border border-[#3c4947] rounded-lg px-4 py-2 text-[#d8e3fb] focus:outline-none focus:border-[#4fdbc8] transition-colors">
            </div>
            
            <div class="mb-4">
              <label for="postContent" class="block text-sm font-medium text-[#859490] mb-1">Content</label>
              <textarea id="postContent" [(ngModel)]="newPostContent" rows="5" placeholder="Describe your question or share your project details..."
                class="w-full bg-[#081425] border border-[#3c4947] rounded-lg px-4 py-2 text-[#d8e3fb] focus:outline-none focus:border-[#4fdbc8] transition-colors resize-y"></textarea>
            </div>

            <div class="mb-6">
              <span class="block text-sm font-medium text-[#859490] mb-2">Tag</span>
              <div class="flex flex-wrap gap-2">
                @for (tag of availableTags; track tag) {
                  <button 
                    (click)="newPostTag.set(tag)"
                    [class.bg-[#4fdbc8]]="newPostTag() === tag"
                    [class.text-[#081425]]="newPostTag() === tag"
                    [class.bg-[#1f2a3c]]="newPostTag() !== tag"
                    [class.text-[#d8e3fb]]="newPostTag() !== tag"
                    class="px-3 py-1 rounded-full text-xs font-medium border border-[#3c4947] transition-colors">
                    {{ tag }}
                  </button>
                }
              </div>
            </div>

            <div class="flex justify-end gap-3">
              <button (click)="isCreating.set(false)" 
                class="px-4 py-2 rounded-lg text-sm font-medium text-[#d8e3fb] hover:bg-[#1f2a3c] transition-colors">
                Cancel
              </button>
              <button (click)="submitPost()" [disabled]="!newPostTitle || !newPostContent || !newPostTag() || isSubmitting()"
                class="bg-[#4fdbc8] hover:bg-[#71f8e4] text-[#081425] text-sm font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                @if (isSubmitting()) {
                  <mat-icon class="animate-spin h-4 w-4">refresh</mat-icon>
                }
                Post
              </button>
            </div>
          </div>
        }

        <!-- Filter Tags -->
        <div class="flex flex-wrap gap-2 mb-6">
          <button (click)="filterByTag(null)"
            [class.bg-[#d8e3fb]]="!selectedFilterTag()"
            [class.text-[#081425]]="!selectedFilterTag()"
            [class.bg-[#1f2a3c]]="selectedFilterTag()"
            [class.text-[#859490]]="selectedFilterTag()"
            class="px-4 py-1.5 rounded-full text-sm font-medium border border-[#3c4947] transition-colors">
            All Posts
          </button>
          @for (tag of availableTags; track tag) {
            <button 
              (click)="filterByTag(tag)"
              [class.bg-[#d8e3fb]]="selectedFilterTag() === tag"
              [class.text-[#081425]]="selectedFilterTag() === tag"
              [class.bg-[#1f2a3c]]="selectedFilterTag() !== tag"
              [class.text-[#859490]]="selectedFilterTag() !== tag"
              class="px-4 py-1.5 rounded-full text-sm font-medium border border-[#3c4947] transition-colors">
              {{ tag }}
            </button>
          }
        </div>

        <!-- Posts List -->
        <div class="flex flex-col gap-4">
          @if (isLoading()) {
            <div class="flex justify-center py-12">
              <mat-icon class="animate-spin text-[#4fdbc8] text-4xl h-10 w-10">refresh</mat-icon>
            </div>
          }
          
          @if (!isLoading() && posts().length === 0) {
            <div class="bg-[#152031] border border-[#3c4947] rounded-xl p-12 text-center">
              <mat-icon class="text-[#859490] text-5xl h-12 w-12 mb-4">forum</mat-icon>
              <h3 class="text-lg font-medium text-[#d8e3fb] mb-2">No posts found</h3>
              <p class="text-[#859490]">Be the first to start a discussion!</p>
            </div>
          }

          @for (post of posts(); track post.id) {
            <div (click)="viewPost(post.id!)" (keydown.enter)="viewPost(post.id!)" tabindex="0" role="button"
                 class="bg-[#152031] border border-[#3c4947] rounded-xl p-5 hover:border-[#4fdbc8] transition-colors cursor-pointer group shadow-sm">
              <div class="flex justify-between items-start mb-2">
                <h3 class="text-lg font-bold text-[#d8e3fb] group-hover:text-[#4fdbc8] transition-colors">{{ post.title }}</h3>
                <span class="bg-[#1f2a3c] text-[#859490] border border-[#3c4947] px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-4">
                  {{ post.tags[0] }}
                </span>
              </div>
              <p class="text-[#859490] text-sm line-clamp-2 mb-4">{{ post.content }}</p>
              <div class="flex items-center justify-between text-xs text-[#859490]">
                <div class="flex items-center gap-4">
                  <span class="flex items-center gap-1">
                    <mat-icon class="text-[16px] h-4 w-4">person</mat-icon> {{ post.authorName }}
                  </span>
                  <span class="flex items-center gap-1">
                    <mat-icon class="text-[16px] h-4 w-4">schedule</mat-icon> {{ formatDate(post.createdAt) }}
                  </span>
                </div>
                <span class="flex items-center gap-1 font-medium text-[#d8e3fb]">
                  <mat-icon class="text-[16px] h-4 w-4 text-[#4fdbc8]">chat_bubble_outline</mat-icon> {{ post.replyCount }} replies
                </span>
              </div>
            </div>
          }
        </div>

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

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
    <div class="h-full w-full flex flex-col bg-[#131314] text-[#e3e3e3] overflow-y-auto p-4 md:p-8">
      <div class="max-w-4xl mx-auto w-full">
        
        <button routerLink="/dashboard/forum" class="flex items-center gap-2 text-[#8ab4f8] hover:text-[#aecbfa] transition-colors mb-6 text-sm font-medium">
          <mat-icon class="text-[18px] h-[18px] w-[18px]">arrow_back</mat-icon> Back to Forum
        </button>

        @if (isLoading()) {
          <div class="flex justify-center py-12">
            <mat-icon class="animate-spin text-[#8ab4f8] text-4xl h-10 w-10">refresh</mat-icon>
          </div>
        }

        @if (!isLoading() && !post()) {
          <div class="bg-[#1e1f20] border border-[#444746] rounded-xl p-12 text-center">
            <mat-icon class="text-[#8e918f] text-5xl h-12 w-12 mb-4">error_outline</mat-icon>
            <h3 class="text-lg font-medium text-white mb-2">Post not found</h3>
            <p class="text-[#8e918f]">This post may have been deleted or doesn't exist.</p>
          </div>
        }

        @if (post(); as p) {
          <!-- Original Post -->
          <div class="bg-[#1e1f20] border border-[#444746] rounded-xl p-6 mb-8 shadow-sm">
            <div class="flex items-center gap-2 mb-4">
              <span class="bg-[#282a2c] text-[#8ab4f8] border border-[#444746] px-2.5 py-1 rounded-full text-xs font-medium">
                {{ p.tags[0] }}
              </span>
            </div>
            <h1 class="text-2xl font-bold text-white mb-4">{{ p.title }}</h1>
            <div class="flex items-center gap-4 text-sm text-[#8e918f] mb-6 pb-6 border-b border-[#444746]">
              <span class="flex items-center gap-1 font-medium text-[#e3e3e3]">
                <mat-icon class="text-[18px] h-[18px] w-[18px]">person</mat-icon> {{ p.authorName }}
              </span>
              <span class="flex items-center gap-1">
                <mat-icon class="text-[18px] h-[18px] w-[18px]">schedule</mat-icon> {{ formatDate(p.createdAt) }}
              </span>
            </div>
            <div class="prose prose-invert max-w-none">
              <p class="whitespace-pre-wrap text-[#e3e3e3] leading-relaxed">{{ p.content }}</p>
            </div>
          </div>

          <!-- Replies Section -->
          <h3 class="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <mat-icon class="text-[#8ab4f8]">chat</mat-icon> Replies ({{ p.replyCount }})
          </h3>

          <div class="flex flex-col gap-4 mb-8">
            @for (reply of replies(); track reply.id) {
              <div class="bg-[#1e1f20] border border-[#444746] rounded-xl p-5 shadow-sm">
                <div class="flex items-center justify-between mb-3">
                  <span class="flex items-center gap-2 font-medium text-[#e3e3e3] text-sm">
                    <div class="w-6 h-6 rounded-full bg-[#282a2c] flex items-center justify-center text-xs text-[#8ab4f8] border border-[#444746]">
                      {{ reply.authorName.charAt(0).toUpperCase() }}
                    </div>
                    {{ reply.authorName }}
                  </span>
                  <span class="text-xs text-[#8e918f]">{{ formatDate(reply.createdAt) }}</span>
                </div>
                <p class="whitespace-pre-wrap text-[#e3e3e3] text-sm leading-relaxed">{{ reply.content }}</p>
              </div>
            }
          </div>

          <!-- Add Reply Form -->
          <div class="bg-[#1e1f20] border border-[#444746] rounded-xl p-6 shadow-sm">
            <h4 class="text-base font-bold text-white mb-4">Add a Reply</h4>
            <textarea [(ngModel)]="newReplyContent" rows="4" placeholder="Write your response here..." aria-label="Reply content"
              class="w-full bg-[#131314] border border-[#444746] rounded-lg px-4 py-3 text-sm text-[#e3e3e3] focus:outline-none focus:border-[#8ab4f8] transition-colors resize-y mb-4"></textarea>
            <div class="flex justify-end">
              <button (click)="submitReply()" [disabled]="!newReplyContent.trim() || isSubmitting()"
                class="bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#131314] text-sm font-bold py-2 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2">
                @if (isSubmitting()) {
                  <mat-icon class="animate-spin h-4 w-4">refresh</mat-icon>
                }
                Reply
              </button>
            </div>
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

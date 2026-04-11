import { Component, inject, signal, OnInit } from '@angular/core';
import { LearningAgentService, ChatMessage } from '../../services/learning.service';
import { AuthService } from '../../services/auth.service';
import { PythonExecutionService, ExecutionResult } from '../../services/python-execution.service';
import { CodeAttemptService } from '../../services/code-attempt.service';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

@Component({
  selector: 'app-learning-module',
  standalone: true,
  imports: [FormsModule, MatIconModule, MonacoEditorModule],
  template: `
    <div class="flex h-full w-full flex-col overflow-hidden bg-[#081425] text-[#d8e3fb]">
      <!-- Main Content Area -->
      <div class="flex-1 flex flex-row overflow-hidden p-3 md:p-5">
        
        <!-- Chat Pane (Left 25%) -->
        <div class="sanctuary-card z-10 h-full w-full flex-col md:mr-4 md:w-[23%]"
             [class.flex]="activeMobileTab() === 'chat'"
             [class.hidden]="activeMobileTab() !== 'chat'"
             [class.md:flex]="true">
          <div class="shrink-0 px-5 py-5">
            <p class="text-[0.66rem] uppercase tracking-[0.26em] text-[#859490]">Facilitator</p>
            <h2 class="mt-2 text-2xl font-bold text-[#d8e3fb]">AI guidance</h2>
            <p class="mt-2 text-sm leading-7 text-[#bbcac6]">Ask for an explanation, a hint, or a fresh lesson path without leaving the editor flow.</p>
          </div>
          <div class="flex flex-1 flex-col gap-4 overflow-y-auto px-4 pb-4">
            @for (msg of chatMessages(); track msg.id || $index) {
              <div class="flex flex-col" [class.items-end]="msg.role === 'user'">
                <div class="max-w-[92%] rounded-[1.25rem] p-4 text-sm leading-7"
                     [class.bg-[#4fdbc8]]="msg.role === 'user'"
                     [class.text-[#003731]]="msg.role === 'user'"
                     [class.bg-[#111c2d]]="msg.role === 'model'"
                     [class.text-[#d8e3fb]]="msg.role === 'model'">
                  <div [innerHTML]="formatContent(msg.content)"></div>
                </div>
              </div>
            }
            @if (isLoading()) {
              <div class="flex flex-col items-start">
                <div class="flex max-w-[92%] items-center gap-2 rounded-[1.25rem] bg-[#111c2d] p-4 text-sm text-[#d8e3fb]">
                  <mat-icon class="h-4 w-4 animate-spin text-[16px] text-[#4fdbc8]">autorenew</mat-icon> Thinking...
                </div>
              </div>
            }
          </div>
          
          <div class="shrink-0 px-4 pb-4">
            <div class="flex items-center gap-2">
              <input type="text" [(ngModel)]="topic" (keyup.enter)="sendMessage()" placeholder="Ask a question or enter a topic..."
                class="sanctuary-input flex-1 px-4 py-3 text-sm focus:outline-none">
              <button (click)="sendMessage()" [disabled]="!topic || isLoading()"
                class="sanctuary-button flex items-center justify-center rounded-2xl p-3 transition-opacity disabled:opacity-50">
                <mat-icon class="h-5 w-5 text-[20px]">send</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Code Pane (Middle 50%) -->
        <div class="sanctuary-card relative mx-0 h-full w-full flex-col md:mx-0 md:w-[54%]"
             [class.flex]="activeMobileTab() === 'code'"
             [class.hidden]="activeMobileTab() !== 'code'"
             [class.md:flex]="true">
          <div class="shrink-0 px-6 pt-6">
            <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div class="space-y-2">
                <p class="text-[0.66rem] uppercase tracking-[0.26em] text-[#859490]">Module workspace</p>
                <div class="flex flex-wrap items-center gap-3">
                  <h2 class="text-3xl font-bold">Focused practice</h2>
                  <span class="rounded-full bg-[#1f2a3c] px-3 py-1 text-[0.68rem] uppercase tracking-[0.2em] text-[#4fdbc8]">
                    {{ pythonService.isReady() ? 'Python ready' : 'Preparing runtime' }}
                  </span>
                </div>
                <p class="max-w-2xl text-sm leading-7 text-[#bbcac6]">
                  Draft, run, and review your lesson in one calm surface. The editor stays central while guidance and references remain nearby.
                </p>
              </div>
              <button (click)="runCode()" [disabled]="isExecuting() || !pythonService.isReady()"
                class="sanctuary-button flex items-center justify-center gap-2 rounded-[1.5rem] px-5 py-4 text-sm font-bold transition-transform duration-200 disabled:opacity-50 md:min-w-40 md:self-start">
                @if (isExecuting()) {
                  <mat-icon class="h-4 w-4 animate-spin text-[16px]">refresh</mat-icon> Running
                } @else {
                  <mat-icon class="h-4 w-4 text-[16px]">play_arrow</mat-icon> Run Code
                }
              </button>
            </div>
          </div>

          <!-- Top Bar: View Toggle -->
          <div class="flex items-center justify-between px-6 py-4 shrink-0">
            <div class="flex rounded-full bg-[#111c2d] p-1">
              <button (click)="activeView.set('edit')" 
                [class.bg-[#1f2a3c]]="activeView() === 'edit'" 
                [class.text-[#d8e3fb]]="activeView() === 'edit'"
                [class.text-[#859490]]="activeView() !== 'edit'"
                class="rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] transition-colors">
                Edit
              </button>
              <button (click)="activeView.set('compiled')" 
                [class.bg-[#1f2a3c]]="activeView() === 'compiled'" 
                [class.text-[#d8e3fb]]="activeView() === 'compiled'"
                [class.text-[#859490]]="activeView() !== 'compiled'"
                class="rounded-full px-4 py-2 text-xs font-medium uppercase tracking-[0.16em] transition-colors">
                Output
              </button>
            </div>
            <span class="rounded-full bg-[#111c2d] px-3 py-2 text-[0.68rem] uppercase tracking-[0.2em] text-[#859490]">
              {{ activeView() === 'edit' ? 'Editor' : 'Console' }}
            </span>
          </div>

          <!-- Editor / Output Views -->
          <div class="relative flex-1 px-4 pb-4">
            <!-- Edit View -->
            <div [class.hidden]="activeView() !== 'edit'" class="absolute inset-0 flex flex-col rounded-[1.25rem] bg-[#040e1f] px-4 pb-4">
              <div class="flex items-center justify-between px-4 py-3 text-xs text-[#859490]">
                <div class="flex gap-1.5">
                  <div class="h-2.5 w-2.5 rounded-full bg-[#ffb4ab]/50"></div>
                  <div class="h-2.5 w-2.5 rounded-full bg-[#ffb59e]/50"></div>
                  <div class="h-2.5 w-2.5 rounded-full bg-[#4fdbc8]/50"></div>
                </div>
                <span class="font-mono">main.py</span>
              </div>
              <ngx-monaco-editor [options]="editorOptions" [(ngModel)]="code" class="h-full min-h-0 w-full flex-1"></ngx-monaco-editor>
            </div>

            <!-- Compiled View -->
            <div [class.hidden]="activeView() !== 'compiled'" class="absolute inset-0 flex flex-col rounded-[1.25rem] bg-[#111c2d]">
              <div class="flex shrink-0 items-center justify-between px-5 py-4">
                <div class="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.22em] text-[#859490]">
                  <mat-icon class="h-3 w-3 text-[12px]">terminal</mat-icon> Output
                </div>
                @if (outputResult()) {
                  <div class="flex items-center gap-3">
                    @if (outputResult()?.error) {
                      <span class="rounded-full bg-[#ffb4ab]/12 px-2.5 py-1 text-[10px] font-medium text-[#ffb4ab]">Failed</span>
                    } @else {
                      <span class="rounded-full bg-[#4fdbc8]/12 px-2.5 py-1 text-[10px] font-medium text-[#4fdbc8]">Success</span>
                    }
                    <div class="flex items-center gap-1 font-mono text-[10px] text-[#859490]">
                      <mat-icon class="h-3 w-3 text-[12px]">timer</mat-icon> {{ outputResult()?.duration }}ms
                    </div>
                  </div>
                }
              </div>
              
              <div class="flex-1 relative">
                @if (!pythonService.isReady()) {
                  <div class="flex items-center gap-2 p-4 font-mono text-xs text-[#ffb4ab]">
                    <mat-icon class="h-4 w-4 text-[16px] animate-spin">refresh</mat-icon> Initializing Python...
                  </div>
                } @else if (isExecuting()) {
                  <div class="flex items-center gap-2 p-4 font-mono text-xs text-[#4fdbc8]">
                    <mat-icon class="h-4 w-4 animate-spin text-[16px]">autorenew</mat-icon> Executing code...
                  </div>
                } @else if (outputResult()) {
                  @if (outputResult()?.error || outputResult()?.stderr) {
                    <div class="p-4 overflow-y-auto absolute inset-0 font-mono text-xs pb-8">
                      @if (outputResult()?.stdout) {
                        <div class="mb-4">
                          <div class="mb-1 text-[10px] uppercase tracking-[0.22em] text-[#859490]">Standard Output:</div>
                          <pre class="whitespace-pre-wrap text-[#d8e3fb]">{{ outputResult()?.stdout }}</pre>
                        </div>
                      }
                      @if (outputResult()?.stderr) {
                        <div class="mb-4">
                          <div class="mb-1 text-[10px] uppercase tracking-[0.22em] text-[#ffb59e]">Standard Error:</div>
                          <pre class="whitespace-pre-wrap text-[#ffb59e]">{{ outputResult()?.stderr }}</pre>
                        </div>
                      }
                      @if (outputResult()?.error) {
                        <div>
                          <div class="mb-1 text-[10px] uppercase tracking-[0.22em] text-[#ffb4ab]">Exception:</div>
                          <div class="rounded-[1rem] bg-[#081425] p-4">
                            <pre class="whitespace-pre-wrap text-[#ffb4ab]">{{ outputResult()?.error }}</pre>
                          </div>
                        </div>
                      }
                    </div>
                  } @else if (outputResult()?.stdout) {
                    <ngx-monaco-editor [options]="outputEditorOptions" [ngModel]="outputResult()?.stdout" class="absolute inset-0"></ngx-monaco-editor>
                  } @else {
                    <div class="p-4 font-mono text-xs italic text-[#859490]">Execution completed with no output.</div>
                  }
                } @else {
                  <div class="p-4 font-mono text-xs italic text-[#859490]">Run your code to see the output here...</div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Docs Pane (Right 25%) -->
        <div class="sanctuary-card z-10 h-full w-full flex-col md:ml-4 md:w-[23%]"
             [class.flex]="activeMobileTab() === 'docs'"
             [class.hidden]="activeMobileTab() !== 'docs'"
             [class.md:flex]="true">
          <div class="shrink-0 px-5 py-5">
            <p class="text-[0.66rem] uppercase tracking-[0.26em] text-[#859490]">Reference</p>
            <h2 class="mt-2 text-2xl font-bold text-[#d8e3fb]">Documentation</h2>
            <p class="mt-2 text-sm leading-7 text-[#bbcac6]">Keep lesson notes and examples close without covering the code.</p>
          </div>
          <div class="flex-1 overflow-y-auto px-4 pb-4">
            @if (moduleContent()) {
              <div class="prose prose-invert prose-sm max-w-none rounded-[1.25rem] bg-[#111c2d] p-5">
                <div [innerHTML]="formatContent(moduleContent())"></div>
              </div>
            } @else if (!isLoading()) {
              <div class="flex h-full flex-col items-center justify-center p-4 text-center opacity-70">
                <mat-icon class="mb-3 text-4xl text-[#859490]">library_books</mat-icon>
                <p class="text-xs leading-relaxed text-[#859490]">Reference materials and documentation will appear here once you start learning.</p>
              </div>
            }
          </div>
        </div>

      </div>

      <!-- Mobile Bottom Navigation -->
      <div class="md:hidden mx-3 mb-3 flex shrink-0 items-center justify-around rounded-[1.5rem] bg-[#152031] p-2 pb-safe">
        <button (click)="activeMobileTab.set('chat')"
          class="flex min-w-[72px] flex-col items-center gap-0.5 rounded-xl p-2 transition-colors"
          [class.bg-[#1f2a3c]]="activeMobileTab() === 'chat'"
          [class.text-[#4fdbc8]]="activeMobileTab() === 'chat'"
          [class.text-[#859490]]="activeMobileTab() !== 'chat'">
          <mat-icon class="h-6 w-6 text-[24px]">forum</mat-icon>
          <span class="text-[10px] font-medium">Chat</span>
        </button>
        <button (click)="activeMobileTab.set('code')"
          class="flex min-w-[72px] flex-col items-center gap-0.5 rounded-xl p-2 transition-colors"
          [class.bg-[#1f2a3c]]="activeMobileTab() === 'code'"
          [class.text-[#4fdbc8]]="activeMobileTab() === 'code'"
          [class.text-[#859490]]="activeMobileTab() !== 'code'">
          <mat-icon class="h-6 w-6 text-[24px]">terminal</mat-icon>
          <span class="text-[10px] font-medium">Code</span>
        </button>
        <button (click)="activeMobileTab.set('docs')"
          class="flex min-w-[72px] flex-col items-center gap-0.5 rounded-xl p-2 transition-colors"
          [class.bg-[#1f2a3c]]="activeMobileTab() === 'docs'"
          [class.text-[#4fdbc8]]="activeMobileTab() === 'docs'"
          [class.text-[#859490]]="activeMobileTab() !== 'docs'">
          <mat-icon class="h-6 w-6 text-[24px]">menu_book</mat-icon>
          <span class="text-[10px] font-medium">Docs</span>
        </button>
      </div>
    </div>
  `
})
export class LearningModuleComponent implements OnInit {
  learningService = inject(LearningAgentService);
  authService = inject(AuthService);
  pythonService = inject(PythonExecutionService);
  attemptService = inject(CodeAttemptService);
  
  topic = '';
  isLoading = signal(false);
  moduleContent = signal<string | null>(null);
  chatMessages = signal<ChatMessage[]>([]);

  // UI State
  activeView = signal<'edit' | 'compiled'>('edit');
  activeMobileTab = signal<'chat' | 'code' | 'docs'>('code');

  // Editor State
  code = '# Write your Python code here\nprint("Hello, LXPython!")\n';
  outputResult = signal<ExecutionResult | null>(null);
  isExecuting = signal(false);

  editorOptions = {
    theme: 'vs-dark',
    language: 'python',
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: "'JetBrains Mono', monospace",
    automaticLayout: true,
    padding: { top: 16, bottom: 16 }
  };

  outputEditorOptions = {
    theme: 'vs-dark',
    language: 'python',
    readOnly: true,
    minimap: { enabled: false },
    fontSize: 13,
    fontFamily: "'JetBrains Mono', monospace",
    automaticLayout: true,
    lineNumbers: 'off',
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    folding: false,
    renderLineHighlight: 'none',
    hideCursorInOverviewRuler: true,
    overviewRulerBorder: false,
    padding: { top: 16, bottom: 16 }
  };

  async ngOnInit() {
    await this.loadChatHistory();
  }

  async loadChatHistory() {
    try {
      const history = await this.learningService.getChatHistory();
      this.chatMessages.set(history);
      
      // If there's history, set the latest model response as module content
      const lastModelMsg = [...history].reverse().find(m => m.role === 'model');
      if (lastModelMsg) {
        this.moduleContent.set(lastModelMsg.content);
      }
    } catch (error) {
      console.error('Failed to load chat history', error);
    }
  }

  async sendMessage() {
    if (!this.topic.trim()) return;
    
    const userMessage = this.topic;
    this.topic = ''; // clear input
    
    // Optimistically add user message to UI
    this.chatMessages.update(msgs => [...msgs, {
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString()
    }]);

    this.isLoading.set(true);
    try {
      const profile = this.authService.userProfile();
      const responseText = await this.learningService.sendMessage(userMessage, profile);
      
      // Add model response to UI
      this.chatMessages.update(msgs => [...msgs, {
        role: 'model',
        content: responseText,
        timestamp: new Date().toISOString()
      }]);
      
      this.moduleContent.set(responseText);
      
      // Auto-switch to docs tab on mobile so they see the result
      if (window.innerWidth < 768) {
        this.activeMobileTab.set('docs');
      }
    } catch (error) {
      console.error('Error sending message', error);
      this.chatMessages.update(msgs => [...msgs, {
        role: 'model',
        content: 'Sorry, there was an error processing your request. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      this.isLoading.set(false);
    }
  }

  async runCode() {
    if (!this.pythonService.isReady()) return;

    this.isExecuting.set(true);
    this.outputResult.set(null);
    this.activeView.set('compiled'); // Auto-switch to compiled view

    try {
      const result = await this.pythonService.runCode(this.code);
      this.outputResult.set(result);
      
      const combinedOutput = [
        result.stdout ? `STDOUT:\n${result.stdout}` : '',
        result.stderr ? `STDERR:\n${result.stderr}` : '',
        result.error ? `ERROR:\n${result.error}` : ''
      ].filter(Boolean).join('\n\n');

      // Save the attempt
      if (this.topic) {
        await this.attemptService.saveAttempt(this.topic, this.code, combinedOutput || '(No output)');
      }

      // Send execution feedback to AI
      const profile = this.authService.userProfile();
      
      // Optimistically show a loading state in chat
      this.isLoading.set(true);
      
      const feedbackResponse = await this.learningService.sendExecutionFeedback(this.code, combinedOutput || '(No output)', profile);
      
      // Add model response to UI
      this.chatMessages.update(msgs => [...msgs, {
        role: 'model',
        content: feedbackResponse,
        timestamp: new Date().toISOString()
      }]);
      
      // Auto-switch to chat tab on mobile so they see the feedback
      if (window.innerWidth < 768) {
        this.activeMobileTab.set('chat');
      }

    } catch (error: unknown) {
      this.outputResult.set({
        stdout: '',
        stderr: '',
        error: error instanceof Error ? error.message : String(error),
        duration: 0
      });
    } finally {
      this.isExecuting.set(false);
    }
  }

  // Basic formatting for the markdown-like response
  formatContent(content: string | null): string {
    if (!content) return '';
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/```python([\s\S]*?)```/g, '<pre class="my-4 overflow-x-auto rounded-[1.25rem] bg-[#040e1f] p-4 font-mono text-xs text-[#d8e3fb]"><code>$1</code></pre>')
      .replace(/\n/g, '<br>');
  }
}

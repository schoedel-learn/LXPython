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
    <div class="h-full w-full flex flex-col bg-[#131314] text-[#e3e3e3] overflow-hidden">
      <!-- Main Content Area -->
      <div class="flex-1 flex flex-row overflow-hidden">
        
        <!-- Chat Pane (Left 25%) -->
        <div class="w-full md:w-1/4 h-full flex-col border-r border-[#444746] bg-[#1e1f20] z-10"
             [class.flex]="activeMobileTab() === 'chat'"
             [class.hidden]="activeMobileTab() !== 'chat'"
             [class.md:flex]="true">
          <div class="p-3 border-b border-[#444746] bg-[#282a2c] shrink-0">
            <h2 class="text-sm font-bold text-[#e3e3e3] flex items-center gap-2">
              <mat-icon class="text-[#8ab4f8] text-[18px] h-[18px] w-[18px]">forum</mat-icon> AI Facilitator
            </h2>
          </div>
          <div class="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            @for (msg of chatMessages(); track msg.id || $index) {
              <div class="flex flex-col" [class.items-end]="msg.role === 'user'">
                <div class="max-w-[90%] rounded-xl p-3 text-sm"
                     [class.bg-[#8ab4f8]]="msg.role === 'user'"
                     [class.text-[#131314]]="msg.role === 'user'"
                     [class.bg-[#282a2c]]="msg.role === 'model'"
                     [class.text-[#e3e3e3]]="msg.role === 'model'"
                     [class.border]="msg.role === 'model'"
                     [class.border-[#444746]]="msg.role === 'model'">
                  <div [innerHTML]="formatContent(msg.content)"></div>
                </div>
              </div>
            }
            @if (isLoading()) {
              <div class="flex flex-col items-start">
                <div class="max-w-[90%] rounded-xl p-3 text-sm bg-[#282a2c] text-[#e3e3e3] border border-[#444746] flex items-center gap-2">
                  <mat-icon class="animate-spin h-4 w-4 text-[16px] text-[#8ab4f8]">autorenew</mat-icon> Thinking...
                </div>
              </div>
            }
          </div>
          
          <div class="p-3 border-t border-[#444746] bg-[#282a2c] shrink-0">
            <div class="flex items-center gap-2">
              <input type="text" [(ngModel)]="topic" (keyup.enter)="sendMessage()" placeholder="Ask a question or enter a topic..."
                class="flex-1 bg-[#131314] border border-[#444746] rounded-lg px-3 py-2 text-sm text-[#e3e3e3] focus:outline-none focus:border-[#8ab4f8] transition-colors">
              <button (click)="sendMessage()" [disabled]="!topic || isLoading()"
                class="bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#131314] p-2 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center">
                <mat-icon class="h-5 w-5 text-[20px]">send</mat-icon>
              </button>
            </div>
          </div>
        </div>

        <!-- Code Pane (Middle 50%) -->
        <div class="w-full md:w-2/4 h-full flex-col relative bg-[#1e1f20]"
             [class.flex]="activeMobileTab() === 'code'"
             [class.hidden]="activeMobileTab() !== 'code'"
             [class.md:flex]="true">
          <!-- Top Bar: View Toggle & Run Button -->
          <div class="flex items-center justify-between p-2 bg-[#282a2c] border-b border-[#444746] shrink-0 shadow-sm">
            <div class="flex bg-[#131314] rounded-lg p-1">
              <button (click)="activeView.set('edit')" 
                [class.bg-[#444746]]="activeView() === 'edit'" 
                [class.text-white]="activeView() === 'edit'"
                [class.text-[#8e918f]]="activeView() !== 'edit'"
                class="px-3 py-1 rounded-md text-xs font-medium transition-colors">
                Edit
              </button>
              <button (click)="activeView.set('compiled')" 
                [class.bg-[#444746]]="activeView() === 'compiled'" 
                [class.text-white]="activeView() === 'compiled'"
                [class.text-[#8e918f]]="activeView() !== 'compiled'"
                class="px-3 py-1 rounded-md text-xs font-medium transition-colors">
                Output
              </button>
            </div>
            <button (click)="runCode()" [disabled]="isExecuting() || !pythonService.isReady()"
              class="bg-[#81c995] hover:bg-[#a8dab5] text-[#131314] text-xs font-bold py-1.5 px-3 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 shadow-sm">
              @if (isExecuting()) {
                <mat-icon class="animate-spin h-4 w-4 text-[16px]">refresh</mat-icon> Running
              } @else {
                <mat-icon class="h-4 w-4 text-[16px]">play_arrow</mat-icon> Run
              }
            </button>
          </div>

          <!-- Editor / Output Views -->
          <div class="flex-1 relative">
            <!-- Edit View -->
            <div [class.hidden]="activeView() !== 'edit'" class="absolute inset-0">
              <ngx-monaco-editor [options]="editorOptions" [(ngModel)]="code" class="h-full w-full"></ngx-monaco-editor>
            </div>

            <!-- Compiled View -->
            <div [class.hidden]="activeView() !== 'compiled'" class="absolute inset-0 bg-[#131314] flex flex-col">
              <div class="flex items-center justify-between px-4 py-2 bg-[#1e1f20] border-b border-[#444746] shrink-0">
                <div class="text-[#8e918f] uppercase text-[10px] font-bold tracking-wider flex items-center gap-1.5">
                  <mat-icon class="h-3 w-3 text-[12px]">terminal</mat-icon> Output
                </div>
                @if (outputResult()) {
                  <div class="flex items-center gap-3">
                    @if (outputResult()?.error) {
                      <span class="text-[10px] text-[#f28b82] bg-[#f28b82]/10 px-1.5 py-0.5 rounded border border-[#f28b82]/20 font-medium">Failed</span>
                    } @else {
                      <span class="text-[10px] text-[#81c995] bg-[#81c995]/10 px-1.5 py-0.5 rounded border border-[#81c995]/20 font-medium">Success</span>
                    }
                    <div class="text-[10px] text-[#8e918f] flex items-center gap-1 font-mono">
                      <mat-icon class="h-3 w-3 text-[12px]">timer</mat-icon> {{ outputResult()?.duration }}ms
                    </div>
                  </div>
                }
              </div>
              
              <div class="flex-1 relative">
                @if (!pythonService.isReady()) {
                  <div class="p-4 text-[#f28b82] flex items-center gap-2 font-mono text-xs">
                    <mat-icon class="h-4 w-4 text-[16px] animate-spin">refresh</mat-icon> Initializing Python...
                  </div>
                } @else if (isExecuting()) {
                  <div class="p-4 text-[#8ab4f8] flex items-center gap-2 font-mono text-xs">
                    <mat-icon class="h-4 w-4 text-[16px] animate-spin">autorenew</mat-icon> Executing code...
                  </div>
                } @else if (outputResult()) {
                  @if (outputResult()?.error || outputResult()?.stderr) {
                    <div class="p-4 overflow-y-auto absolute inset-0 font-mono text-xs pb-8">
                      @if (outputResult()?.stdout) {
                        <div class="mb-4">
                          <div class="text-[#8e918f] text-[10px] mb-1 uppercase tracking-wider">Standard Output:</div>
                          <pre class="text-[#e3e3e3] whitespace-pre-wrap">{{ outputResult()?.stdout }}</pre>
                        </div>
                      }
                      @if (outputResult()?.stderr) {
                        <div class="mb-4">
                          <div class="text-[#fbbc04] text-[10px] mb-1 uppercase tracking-wider">Standard Error:</div>
                          <pre class="text-[#fbbc04] whitespace-pre-wrap">{{ outputResult()?.stderr }}</pre>
                        </div>
                      }
                      @if (outputResult()?.error) {
                        <div>
                          <div class="text-[#f28b82] text-[10px] mb-1 uppercase tracking-wider">Exception:</div>
                          <div class="border-l-2 border-[#f28b82] pl-3">
                            <pre class="text-[#f28b82] whitespace-pre-wrap">{{ outputResult()?.error }}</pre>
                          </div>
                        </div>
                      }
                    </div>
                  } @else if (outputResult()?.stdout) {
                    <ngx-monaco-editor [options]="outputEditorOptions" [ngModel]="outputResult()?.stdout" class="absolute inset-0"></ngx-monaco-editor>
                  } @else {
                    <div class="p-4 text-[#444746] italic font-mono text-xs">Execution completed with no output.</div>
                  }
                } @else {
                  <div class="p-4 text-[#444746] italic font-mono text-xs">Run your code to see the output here...</div>
                }
              </div>
            </div>
          </div>
        </div>

        <!-- Docs Pane (Right 25%) -->
        <div class="w-full md:w-1/4 h-full flex-col border-l border-[#444746] bg-[#1e1f20] z-10"
             [class.flex]="activeMobileTab() === 'docs'"
             [class.hidden]="activeMobileTab() !== 'docs'"
             [class.md:flex]="true">
          <div class="p-3 border-b border-[#444746] bg-[#282a2c] shrink-0">
            <h2 class="text-sm font-bold text-[#e3e3e3] flex items-center gap-2">
              <mat-icon class="text-[#8ab4f8] text-[18px] h-[18px] w-[18px]">menu_book</mat-icon> Documentation
            </h2>
          </div>
          <div class="flex-1 overflow-y-auto p-4 bg-[#131314]">
            @if (moduleContent()) {
              <div class="prose prose-invert prose-sm max-w-none">
                <div [innerHTML]="formatContent(moduleContent())"></div>
              </div>
            } @else if (!isLoading()) {
              <div class="h-full flex flex-col items-center justify-center text-center opacity-50 p-4">
                <mat-icon class="text-4xl mb-3 text-[#8e918f]">library_books</mat-icon>
                <p class="text-xs text-[#8e918f] leading-relaxed">Reference materials and documentation will appear here once you start learning.</p>
              </div>
            }
          </div>
        </div>

      </div>

      <!-- Mobile Bottom Navigation -->
      <div class="md:hidden flex items-center justify-around bg-[#1e1f20] border-t border-[#444746] p-1 shrink-0 pb-safe">
        <button (click)="activeMobileTab.set('chat')"
          class="flex flex-col items-center gap-0.5 p-2 rounded-lg min-w-[72px] transition-colors"
          [class.text-[#8ab4f8]]="activeMobileTab() === 'chat'"
          [class.text-[#8e918f]]="activeMobileTab() !== 'chat'">
          <mat-icon class="h-6 w-6 text-[24px]">forum</mat-icon>
          <span class="text-[10px] font-medium">Chat</span>
        </button>
        <button (click)="activeMobileTab.set('code')"
          class="flex flex-col items-center gap-0.5 p-2 rounded-lg min-w-[72px] transition-colors"
          [class.text-[#8ab4f8]]="activeMobileTab() === 'code'"
          [class.text-[#8e918f]]="activeMobileTab() !== 'code'">
          <mat-icon class="h-6 w-6 text-[24px]">terminal</mat-icon>
          <span class="text-[10px] font-medium">Code</span>
        </button>
        <button (click)="activeMobileTab.set('docs')"
          class="flex flex-col items-center gap-0.5 p-2 rounded-lg min-w-[72px] transition-colors"
          [class.text-[#8ab4f8]]="activeMobileTab() === 'docs'"
          [class.text-[#8e918f]]="activeMobileTab() !== 'docs'">
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
      
      // Save the attempt
      if (this.topic) {
        const combinedOutput = [
          result.stdout ? `STDOUT:\n${result.stdout}` : '',
          result.stderr ? `STDERR:\n${result.stderr}` : '',
          result.error ? `ERROR:\n${result.error}` : ''
        ].filter(Boolean).join('\n\n');
        
        await this.attemptService.saveAttempt(this.topic, this.code, combinedOutput || '(No output)');
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
      .replace(/```python([\s\S]*?)```/g, '<pre class="bg-[#1e1f20] p-4 rounded-xl border border-[#444746] overflow-x-auto text-[#e3e3e3] font-mono text-xs my-4"><code>$1</code></pre>')
      .replace(/\n/g, '<br>');
  }
}


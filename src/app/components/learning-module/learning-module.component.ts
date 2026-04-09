import { Component, inject, signal } from '@angular/core';
import { LearningAgentService } from '../../services/learning.service';
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
    <div class="h-full w-full flex flex-col relative bg-[#1e1f20] overflow-hidden">
      
      <!-- Top Bar: View Toggle & Run Button -->
      <div class="flex items-center justify-between p-3 bg-[#282a2c] border-b border-[#444746] shrink-0 z-10 shadow-sm">
        <div class="flex bg-[#131314] rounded-lg p-1">
          <button (click)="activeView.set('edit')" 
            [class.bg-[#444746]]="activeView() === 'edit'" 
            [class.text-white]="activeView() === 'edit'"
            [class.text-[#8e918f]]="activeView() !== 'edit'"
            class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors">
            Edit
          </button>
          <button (click)="activeView.set('compiled')" 
            [class.bg-[#444746]]="activeView() === 'compiled'" 
            [class.text-white]="activeView() === 'compiled'"
            [class.text-[#8e918f]]="activeView() !== 'compiled'"
            class="px-4 py-1.5 rounded-md text-sm font-medium transition-colors">
            Compiled
          </button>
        </div>
        <button (click)="runCode()" [disabled]="isExecuting() || !pythonService.isReady()"
          class="bg-[#81c995] hover:bg-[#a8dab5] text-[#131314] text-sm font-medium py-1.5 px-4 rounded-lg transition-colors flex items-center gap-1 disabled:opacity-50 shadow-sm">
          @if (isExecuting()) {
            <mat-icon class="animate-spin h-4 w-4 text-[16px]">refresh</mat-icon> Running
          } @else {
            <mat-icon class="h-4 w-4 text-[16px]">play_arrow</mat-icon> Run
          }
        </button>
      </div>

      <!-- Base: Editor / Output Views -->
      <div class="flex-1 relative">
        
        <!-- Edit View -->
        <div [class.hidden]="activeView() !== 'edit'" class="absolute inset-0">
          <ngx-monaco-editor [options]="editorOptions" [(ngModel)]="code" class="h-full w-full"></ngx-monaco-editor>
        </div>

        <!-- Compiled View -->
        <div [class.hidden]="activeView() !== 'compiled'" class="absolute inset-0 bg-[#131314] flex flex-col">
          <div class="flex items-center justify-between px-4 py-2 bg-[#1e1f20] border-b border-[#444746] shrink-0">
            <div class="text-[#8e918f] uppercase text-xs font-bold tracking-wider flex items-center gap-2">
              <mat-icon class="h-4 w-4 text-[16px]">terminal</mat-icon> Output
            </div>
            @if (outputResult()) {
              <div class="flex items-center gap-3">
                @if (outputResult()?.error) {
                  <span class="text-xs text-[#f28b82] bg-[#f28b82]/10 px-2 py-0.5 rounded border border-[#f28b82]/20">Failed</span>
                } @else {
                  <span class="text-xs text-[#81c995] bg-[#81c995]/10 px-2 py-0.5 rounded border border-[#81c995]/20">Success</span>
                }
                <div class="text-xs text-[#8e918f] flex items-center gap-1">
                  <mat-icon class="h-3 w-3 text-[12px]">timer</mat-icon> {{ outputResult()?.duration }}ms
                </div>
              </div>
            }
          </div>
          
          <div class="flex-1 relative">
            @if (!pythonService.isReady()) {
              <div class="p-4 text-[#f28b82] flex items-center gap-2 font-mono text-sm">
                <mat-icon class="h-4 w-4 text-[16px] animate-spin">refresh</mat-icon> Initializing Python...
              </div>
            } @else if (isExecuting()) {
              <div class="p-4 text-[#8ab4f8] flex items-center gap-2 font-mono text-sm">
                <mat-icon class="h-4 w-4 text-[16px] animate-spin">autorenew</mat-icon> Executing code...
              </div>
            } @else if (outputResult()) {
              @if (outputResult()?.error || outputResult()?.stderr) {
                <div class="p-4 overflow-y-auto absolute inset-0 font-mono text-sm pb-24">
                  @if (outputResult()?.stdout) {
                    <div class="mb-4">
                      <div class="text-[#8e918f] text-xs mb-1">Standard Output:</div>
                      <pre class="text-[#e3e3e3] whitespace-pre-wrap">{{ outputResult()?.stdout }}</pre>
                    </div>
                  }
                  @if (outputResult()?.stderr) {
                    <div class="mb-4">
                      <div class="text-[#fbbc04] text-xs mb-1">Standard Error:</div>
                      <pre class="text-[#fbbc04] whitespace-pre-wrap">{{ outputResult()?.stderr }}</pre>
                    </div>
                  }
                  @if (outputResult()?.error) {
                    <div>
                      <div class="text-[#f28b82] text-xs mb-1">Exception:</div>
                      <div class="border-l-2 border-[#f28b82] pl-3">
                        <pre class="text-[#f28b82] whitespace-pre-wrap">{{ outputResult()?.error }}</pre>
                      </div>
                    </div>
                  }
                </div>
              } @else if (outputResult()?.stdout) {
                <ngx-monaco-editor [options]="outputEditorOptions" [ngModel]="outputResult()?.stdout" class="absolute inset-0 pb-20"></ngx-monaco-editor>
              } @else {
                <div class="p-4 text-[#444746] italic font-mono text-sm">Execution completed with no output.</div>
              }
            } @else {
              <div class="p-4 text-[#444746] italic font-mono text-sm">Run your code to see the output here...</div>
            }
          </div>
        </div>
      </div>

      <!-- Drawer Overlay (Adaptive Learning) -->
      <div class="absolute inset-y-0 right-0 w-full md:w-96 bg-[#1e1f20] border-l border-[#444746] shadow-2xl transition-transform duration-300 ease-in-out z-40 flex flex-col"
           [class.translate-x-full]="!isDrawerOpen()"
           [class.translate-x-0]="isDrawerOpen()">
        
        <div class="p-4 border-b border-[#444746] bg-[#282a2c] flex items-center justify-between shrink-0">
          <h2 class="text-lg font-bold text-[#e3e3e3] flex items-center gap-2">
            <mat-icon class="text-[#8ab4f8]">auto_awesome</mat-icon> Adaptive Learning
          </h2>
          <button (click)="isDrawerOpen.set(false)" class="text-[#8e918f] hover:text-[#e3e3e3] transition-colors p-1">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <div class="p-4 border-b border-[#444746] shrink-0 bg-[#1e1f20]">
          <p class="text-sm text-[#8e918f] mb-3">What would you like to learn about today?</p>
          <div class="flex flex-col gap-3">
            <input type="text" [(ngModel)]="topic" placeholder="e.g. For loops, APIs..."
              class="w-full bg-[#131314] border border-[#444746] rounded-xl px-4 py-2.5 text-sm text-[#e3e3e3] focus:outline-none focus:border-[#8ab4f8] transition-colors">
            <button (click)="generateModule()" [disabled]="!topic || isLoading()"
              class="w-full bg-[#8ab4f8] hover:bg-[#aecbfa] text-[#131314] text-sm font-medium py-2.5 px-4 rounded-xl transition-colors duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm">
              @if (isLoading()) {
                <mat-icon class="animate-spin h-4 w-4 text-[16px]">refresh</mat-icon> Generating...
              } @else {
                <mat-icon class="h-4 w-4 text-[16px]">school</mat-icon> Generate Lesson
              }
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-4 bg-[#131314]">
          @if (moduleContent()) {
            <div class="prose prose-invert prose-sm max-w-none pb-20">
              <div [innerHTML]="formatContent(moduleContent())"></div>
            </div>
          } @else if (!isLoading()) {
            <div class="h-full flex flex-col items-center justify-center text-center opacity-50">
              <mat-icon class="text-4xl mb-2 text-[#8e918f]">lightbulb</mat-icon>
              <p class="text-sm text-[#8e918f]">Enter a topic above to generate a personalized Python lesson.</p>
            </div>
          }
        </div>
      </div>

      <!-- Hamburger FAB (Lower Right) -->
      <button (click)="isDrawerOpen.set(!isDrawerOpen())" 
        class="absolute bottom-6 right-6 h-14 w-14 bg-[#8ab4f8] text-[#131314] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.5)] flex items-center justify-center z-50 hover:bg-[#aecbfa] hover:scale-105 active:scale-95 transition-all duration-200">
        <mat-icon>{{ isDrawerOpen() ? 'close' : 'menu' }}</mat-icon>
      </button>

    </div>
  `
})
export class LearningModuleComponent {
  learningService = inject(LearningAgentService);
  authService = inject(AuthService);
  pythonService = inject(PythonExecutionService);
  attemptService = inject(CodeAttemptService);
  
  topic = '';
  isLoading = signal(false);
  moduleContent = signal<string | null>(null);

  // UI State
  activeView = signal<'edit' | 'compiled'>('edit');
  isDrawerOpen = signal(true); // Start open so user knows it's there

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
    padding: { top: 16, bottom: 80 } // Extra padding for FAB
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
    padding: { top: 16, bottom: 80 } // Extra padding for FAB
  };

  async generateModule() {
    if (!this.topic) return;
    
    this.isLoading.set(true);
    try {
      const profile = this.authService.userProfile();
      const content = await this.learningService.generateLearningModule(this.topic, profile);
      this.moduleContent.set(content);
      // Reset editor for new topic
      this.code = '# Practice what you learned about ' + this.topic + '\n';
      this.outputResult.set(null);
      this.activeView.set('edit');
    } catch (error) {
      console.error('Error generating module', error);
      this.moduleContent.set('Sorry, there was an error generating your learning module. Please try again.');
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

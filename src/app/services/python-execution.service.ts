import { Injectable, signal } from '@angular/core';

declare const loadPyodide: unknown;

export interface ExecutionResult {
  stdout: string;
  stderr: string;
  error: string | null;
  duration: number;
}

interface PyodideInterface {
  runPythonAsync: (code: string) => Promise<string>;
}

@Injectable({
  providedIn: 'root'
})
export class PythonExecutionService {
  private pyodide: PyodideInterface | null = null;
  isReady = signal(false);

  constructor() {
    this.initPyodide();
  }

  async initPyodide() {
    try {
      const loadFn = loadPyodide as (config: { indexURL: string }) => Promise<PyodideInterface>;
      this.pyodide = await loadFn({
        indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.0/full/'
      });
      this.isReady.set(true);
    } catch (error) {
      console.error('Failed to load Pyodide:', error);
    }
  }

  async runCode(code: string): Promise<ExecutionResult> {
    const startTime = performance.now();
    if (!this.pyodide) {
      return { 
        stdout: '', 
        stderr: '', 
        error: 'Error: Python environment is not ready yet.',
        duration: 0
      };
    }

    const py = this.pyodide;

    try {
      // Redirect stdout and stderr to capture print statements and errors
      await py.runPythonAsync(`
import sys
import io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
      `);

      await py.runPythonAsync(code);

      // Get stdout and stderr content
      const stdout = await py.runPythonAsync(`sys.stdout.getvalue()`);
      const stderr = await py.runPythonAsync(`sys.stderr.getvalue()`);
      
      return { 
        stdout, 
        stderr, 
        error: null,
        duration: Math.round(performance.now() - startTime)
      };
    } catch (error: unknown) {
      const stdout = await py.runPythonAsync(`sys.stdout.getvalue()`);
      const stderr = await py.runPythonAsync(`sys.stderr.getvalue()`);
      return { 
        stdout, 
        stderr, 
        error: error instanceof Error ? error.message : String(error),
        duration: Math.round(performance.now() - startTime)
      };
    }
  }
}

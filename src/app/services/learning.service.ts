import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { UserProfile } from './auth.service';

// Using the global variable defined in globals.d.ts or .env
declare const GEMINI_API_KEY: string;

@Injectable({
  providedIn: 'root'
})
export class LearningAgentService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  async generateLearningModule(topic: string, userProfile: UserProfile | null) {
    const prompt = `
      You are an expert Python instructor in the LXPython platform, an evidence-based learning environment for practicing and growing in mastery of Python.
      Your goal is to create highly engaging, bite-sized, and interactive learning modules.
      
      Learner Profile:
      - Experience Level: ${userProfile?.pythonExperience || 'Beginner'}
      - Interests: ${userProfile?.projectInterests?.join(', ') || 'General Python'}
      
      Create a short, interactive learning module about: ${topic}.
      Keep it concise, highly structured, and easy to read. Use formatting (bolding, bullet points).
      Include:
      1. A brief, punchy explanation.
      2. A real-world analogy related to their interests.
      3. A small, practical code example that the user can try in their editor.
      4. A quick challenge or question to test understanding.
      
      Do NOT mention ADHD or neurodivergence. Focus purely on clear, evidence-based instructional design.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: prompt,
        config: {
          temperature: 0.7,
        }
      });
      return response.text || null;
    } catch (error) {
      console.error('Error generating learning module:', error);
      throw error;
    }
  }
}

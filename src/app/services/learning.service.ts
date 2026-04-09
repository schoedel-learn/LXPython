import { Injectable, inject } from '@angular/core';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { UserProfile } from './auth.service';
import { MemoryService } from './memory.service';
import { collection, doc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase';

// Using the global variable defined in globals.d.ts or .env
declare const GEMINI_API_KEY: string;
declare const DEFAULT_AI_MODEL: string | undefined;

export interface ChatMessage {
  id?: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class LearningAgentService {
  private ai: GoogleGenAI;
  private memoryService = inject(MemoryService);

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  async getChatHistory(): Promise<ChatMessage[]> {
    const user = auth.currentUser;
    if (!user) return [];

    try {
      const chatsRef = collection(db, `users/${user.uid}/chats`);
      const q = query(chatsRef, orderBy('timestamp', 'asc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ChatMessage));
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  async saveChatMessage(role: 'user' | 'model', content: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const chatsRef = collection(db, `users/${user.uid}/chats`);
      const newChatRef = doc(chatsRef);
      
      await setDoc(newChatRef, {
        role,
        content,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving chat message:', error);
    }
  }

  async sendMessage(message: string, userProfile: UserProfile | null): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // 1. Save user message
    await this.saveChatMessage('user', message);

    // 2. Fetch context
    const memories = await this.memoryService.getMemories();
    const memoryString = memories.length > 0 
      ? memories.map(m => `- [${m.category}] ${m.content}`).join('\n')
      : 'No memories recorded yet.';

    const systemInstruction = `
      You are an expert Python facilitator. You are teaching ${userProfile?.firstName || 'the user'}, 
      whose skill level is ${userProfile?.pythonExperience || 'Beginner'} and is interested in ${userProfile?.projectInterests?.join(', ') || 'General Python'}. 
      
      Here is their learning history and preferences:
      ${memoryString}

      Use this to perfectly calibrate your next response to their Zone of Proximal Development.
      
      Pedagogical Rules:
      1. Docs-First: When explaining a concept, quote or reference official Python/library documentation.
      2. Holistic Contextualization: Explain strengths, weaknesses, and how it compares to other tools/languages.
      3. ZPD: Keep challenges strictly calibrated to their skill level.
      4. Do NOT mention ADHD or neurodivergence. Focus purely on clear, evidence-based instructional design.
      5. Keep responses concise and highly structured. Use markdown formatting.
    `;

    const saveMemoryDeclaration: FunctionDeclaration = {
      name: 'save_learner_memory',
      description: 'Save an insight, preference, milestone, or struggle about the learner to their permanent memory log.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: 'The category of the memory: preference, milestone, struggle, or general.',
          },
          content: {
            type: Type.STRING,
            description: 'The content of the memory to save.',
          },
        },
        required: ['category', 'content'],
      },
    };

    // 3. Fetch previous chat history to build the session
    const history = await this.getChatHistory();
    // Exclude the message we just saved to avoid duplication in the prompt
    const previousHistory = history.slice(0, -1).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    const modelName = typeof DEFAULT_AI_MODEL !== 'undefined' ? DEFAULT_AI_MODEL : 'gemini-2.5-flash';

    try {
      const chat = this.ai.chats.create({
        model: modelName,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
          tools: [{ functionDeclarations: [saveMemoryDeclaration] }],
        },
        history: previousHistory
      });

      let response = await chat.sendMessage({ message });
      let finalResponseText = response.text || '';

      // Handle function calls
      if (response.functionCalls && response.functionCalls.length > 0) {
        for (const call of response.functionCalls) {
          if (call.name === 'save_learner_memory') {
            const args = call.args as Record<string, unknown>;
            if (typeof args['category'] === 'string' && typeof args['content'] === 'string') {
              const category = args['category'] as 'preference' | 'milestone' | 'struggle' | 'general';
              await this.memoryService.saveMemory(category, args['content']);
              
              // Send the result back to the model
              response = await chat.sendMessage({
                message: [{
                  functionResponse: {
                    name: 'save_learner_memory',
                    response: { status: 'success', message: 'Memory saved successfully.' }
                  }
                }]
              });
              finalResponseText = response.text || finalResponseText;
            }
          }
        }
      }

      // 4. Save AI response
      await this.saveChatMessage('model', finalResponseText);
      return finalResponseText;

    } catch (error) {
      console.error('Error in chat:', error);
      throw error;
    }
  }
}

import { Injectable, inject } from '@angular/core';
import { GoogleGenAI, Type, FunctionDeclaration, Content } from '@google/genai';
import { UserProfile } from './auth.service';
import { MemoryService } from './memory.service';
import { collection, doc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase';

declare const GEMINI_API_KEY: string;
declare const DEFAULT_AI_MODEL: string | undefined;

export interface ChatMessage {
  id?: string;
  role: 'user' | 'model' | 'system' | 'assistant';
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
    if (typeof GEMINI_API_KEY === 'undefined' || !GEMINI_API_KEY) {
      console.warn('GEMINI_API_KEY is not set. Chat functionality will not work.');
    }
    this.ai = new GoogleGenAI({ 
      apiKey: typeof GEMINI_API_KEY !== 'undefined' ? GEMINI_API_KEY : ''
    });
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

  async saveChatMessage(role: 'user' | 'model' | 'system' | 'assistant', content: string): Promise<void> {
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

  async sendExecutionFeedback(code: string, output: string, userProfile: UserProfile | null): Promise<string> {
    const message = `[System Context: I just executed the following code in my editor:\n\n\`\`\`python\n${code}\n\`\`\`\n\nExecution Result:\n${output}\n\nPlease provide brief, encouraging feedback or hints if there's an error. Do not write the full solution for me.]`;
    return this.sendMessage(message, userProfile, true);
  }

  async sendMessage(message: string, userProfile: UserProfile | null, isHiddenFromUI = false): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    // 1. Save user message (if it's not a hidden system context message)
    if (!isHiddenFromUI) {
      await this.saveChatMessage('user', message);
    }

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

    const saveLearnerMemoryDeclaration: FunctionDeclaration = {
      name: 'save_learner_memory',
      description: 'Save an insight, preference, milestone, or struggle about the learner to their permanent memory log.',
      parameters: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            description: 'The category of the memory. Must be one of: preference, milestone, struggle, general',
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
    
    // Map our DB roles to Gemini roles
    const messages: Content[] = [
      ...history.map(msg => ({
        role: (msg.role === 'assistant' || msg.role === 'model') ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }))
    ];

    // Add the current message
    messages.push({ role: 'user', parts: [{ text: message }] });

    let modelName = typeof DEFAULT_AI_MODEL !== 'undefined' ? DEFAULT_AI_MODEL : 'gemini-3.1-pro-preview';
    if (modelName.includes('gpt') || modelName.includes('claude')) {
      modelName = 'gemini-3.1-pro-preview';
    }

    try {
      const response = await this.ai.models.generateContent({
        model: modelName,
        contents: messages,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.7,
          tools: [{ functionDeclarations: [saveLearnerMemoryDeclaration] }],
        }
      });

      let finalResponseText = response.text || '';

      // Handle function calls
      const functionCalls = response.functionCalls;
      if (functionCalls && functionCalls.length > 0) {
        // Add the model's tool call to history
        messages.push({
          role: 'model',
          parts: response.candidates?.[0]?.content?.parts || []
        });
        
        const toolResponses = [];
        for (const toolCall of functionCalls) {
          if (toolCall.name === 'save_learner_memory') {
            try {
              const args = toolCall.args as Record<string, unknown>;
              if (typeof args['category'] === 'string' && typeof args['content'] === 'string') {
                const category = args['category'] as 'preference' | 'milestone' | 'struggle' | 'general';
                await this.memoryService.saveMemory(category, args['content']);
                
                toolResponses.push({
                  functionResponse: {
                    name: toolCall.name,
                    response: { status: 'success', message: 'Memory saved successfully.' }
                  }
                });
              }
            } catch (e) {
              console.error('Failed to parse tool call arguments:', e);
              toolResponses.push({
                functionResponse: {
                  name: toolCall.name,
                  response: { status: 'error', message: 'Invalid arguments' }
                }
              });
            }
          }
        }
        
        if (toolResponses.length > 0) {
          messages.push({
            role: 'user',
            parts: toolResponses
          });

          // Get the final response after tool execution
          const secondResponse = await this.ai.models.generateContent({
            model: modelName,
            contents: messages,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.7,
            }
          });
          
          finalResponseText = secondResponse.text || finalResponseText;
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


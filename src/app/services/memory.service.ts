import { Injectable } from '@angular/core';
import { collection, doc, setDoc, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export interface Memory {
  id?: string;
  category: 'preference' | 'milestone' | 'struggle' | 'general';
  content: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class MemoryService {
  
  async getMemories(): Promise<Memory[]> {
    const user = auth.currentUser;
    if (!user) return [];

    try {
      const memoriesRef = collection(db, `users/${user.uid}/memories`);
      const q = query(memoriesRef, orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Memory));
    } catch (error) {
      console.error('Error fetching memories:', error);
      return [];
    }
  }

  async saveMemory(category: Memory['category'], content: string): Promise<void> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      const memoriesRef = collection(db, `users/${user.uid}/memories`);
      const newMemoryRef = doc(memoriesRef);
      
      await setDoc(newMemoryRef, {
        category,
        content,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error saving memory:', error);
      throw error;
    }
  }
}

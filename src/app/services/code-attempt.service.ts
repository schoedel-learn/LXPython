import { Injectable, inject } from '@angular/core';
import { db } from '../../firebase';
import { collection, doc, setDoc } from 'firebase/firestore';
import { AuthService } from './auth.service';

export interface CodeAttempt {
  topic: string;
  code: string;
  output: string;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class CodeAttemptService {
  private authService = inject(AuthService);

  async saveAttempt(topic: string, code: string, output: string) {
    const user = this.authService.currentUser();
    if (!user) return;

    const attemptRef = doc(collection(db, 'users', user.uid, 'attempts'));
    const attemptData: CodeAttempt = {
      topic,
      code,
      output,
      timestamp: new Date().toISOString()
    };

    try {
      await setDoc(attemptRef, attemptData);
    } catch (error) {
      console.error('Error saving code attempt:', error);
    }
  }
}

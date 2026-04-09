import { Injectable, signal, effect, inject } from '@angular/core';
import { db } from '../../firebase';
import { collection, doc, setDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { AuthService } from './auth.service';

export interface UserSecret {
  id: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class SecretsService {
  secrets = signal<UserSecret[]>([]);
  private authService = inject(AuthService);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      if (user) {
        this.loadSecrets(user.uid);
      } else {
        this.secrets.set([]);
      }
    });
  }

  loadSecrets(userId: string) {
    const secretsRef = collection(db, 'users', userId, 'secrets');
    onSnapshot(secretsRef, (snapshot) => {
      const loadedSecrets = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as UserSecret[];
      this.secrets.set(loadedSecrets);
    }, (error) => {
      console.error('Error loading secrets:', error);
    });
  }

  async saveSecret(userId: string, key: string, value: string, secretId?: string) {
    const id = secretId || doc(collection(db, 'users', userId, 'secrets')).id;
    const secretRef = doc(db, 'users', userId, 'secrets', id);
    
    const now = new Date().toISOString();
    const secretData = {
      key,
      value,
      updatedAt: now,
      ...(secretId ? {} : { createdAt: now })
    };

    await setDoc(secretRef, secretData, { merge: true });
  }

  async deleteSecret(userId: string, secretId: string) {
    const secretRef = doc(db, 'users', userId, 'secrets', secretId);
    await deleteDoc(secretRef);
  }
}

import { Injectable, signal } from '@angular/core';
import { auth, db } from '../../firebase';
import { GoogleAuthProvider, signInWithPopup, signOut, User as FirebaseUser, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
import { customAlphabet } from 'nanoid';

/** Single source of truth for the privileged admin account. */
export const ADMIN_EMAIL = 'schoedelb@gmail.com';

const generateCustomId = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789*+_-!?', 8);

export interface UserProfile {
  uid: string;
  customId: string;
  firstName: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  dateJoined: string;
  birthday?: string;
  pythonExperience: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  projectInterests?: string[];
  newsletterOptIn?: boolean;
  newsletterConfirmed?: boolean;
  registrationComplete?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser = signal<FirebaseUser | null>(null);
  userProfile = signal<UserProfile | null>(null);
  isAuthReady = signal<boolean>(false);

  constructor() {
    auth.onAuthStateChanged(async (user) => {
      this.currentUser.set(user);
      if (user) {
        await this.loadUserProfile(user);
      } else {
        this.userProfile.set(null);
      }
      this.isAuthReady.set(true);
    });
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    let result;
    try {
      result = await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }

    if (result.user.email !== ADMIN_EMAIL) {
      // Sign the non-admin user out immediately so no session is created.
      await signOut(auth);
      throw new Error('ACCESS_DENIED');
    }

    await this.loadUserProfile(result.user);
  }

  async logout() {
    await signOut(auth);
  }

  private async loadUserProfile(user: FirebaseUser) {
    const docRef = doc(db, 'users', user.uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      this.userProfile.set(docSnap.data() as UserProfile);
    } else {
      // Create new profile
      const newProfile: UserProfile = {
        uid: user.uid,
        customId: generateCustomId(),
        firstName: user.displayName?.split(' ')[0] || 'Learner',
        email: user.email || '',
        dateJoined: new Date().toISOString(),
        pythonExperience: 'Beginner',
        registrationComplete: false,
        newsletterOptIn: true,
        newsletterConfirmed: true
      };
      await setDoc(docRef, newProfile);
      this.userProfile.set(newProfile);
    }
  }

  async updateProfile(updates: Partial<UserProfile>) {
    const user = this.currentUser();
    if (!user) return;

    const docRef = doc(db, 'users', user.uid);
    await updateDoc(docRef, updates);
    
    const currentProfile = this.userProfile();
    if (currentProfile) {
      this.userProfile.set({ ...currentProfile, ...updates });
    }
  }

  async sendVerificationEmail() {
    const user = this.currentUser();
    if (user && !user.emailVerified) {
      await sendEmailVerification(user);
    }
  }

  async deleteAccount() {
    const user = this.currentUser();
    if (!user) return;

    try {
      // Delete user profile document from Firestore
      const docRef = doc(db, 'users', user.uid);
      await deleteDoc(docRef);
      
      // Delete user from Firebase Auth
      await user.delete();
    } catch (error: unknown) {
      console.error('Error deleting account:', error);
      // If re-authentication is required
      if (error instanceof FirebaseError && error.code === 'auth/requires-recent-login') {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        
        // Try again
        const docRef = doc(db, 'users', user.uid);
        await deleteDoc(docRef);
        await user.delete();
      } else {
        throw error;
      }
    }
  }
}

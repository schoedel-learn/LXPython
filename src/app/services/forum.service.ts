import { Injectable } from '@angular/core';
import { collection, doc, setDoc, getDocs, getDoc, query, orderBy, where, updateDoc, increment } from 'firebase/firestore';
import { db, auth } from '../../firebase';

export interface ForumPost {
  id?: string;
  authorId: string;
  authorName: string;
  title: string;
  content: string;
  tags: string[];
  status: 'active' | 'flagged' | 'hidden';
  replyCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ForumReply {
  id?: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  status: 'active' | 'flagged' | 'hidden';
  createdAt: string;
  updatedAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class ForumService {

  async getPosts(tag?: string): Promise<ForumPost[]> {
    try {
      const postsRef = collection(db, 'forumPosts');
      let q = query(postsRef, where('status', '==', 'active'), orderBy('createdAt', 'desc'));
      
      if (tag) {
        q = query(postsRef, where('status', '==', 'active'), where('tags', 'array-contains', tag), orderBy('createdAt', 'desc'));
      }
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumPost));
    } catch (error) {
      console.error('Error fetching forum posts:', error);
      return [];
    }
  }

  async getPost(postId: string): Promise<ForumPost | null> {
    try {
      const postRef = doc(db, 'forumPosts', postId);
      const snapshot = await getDoc(postRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as ForumPost;
      }
      return null;
    } catch (error) {
      console.error('Error fetching forum post:', error);
      return null;
    }
  }

  async createPost(title: string, content: string, tags: string[], authorName: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      const postsRef = collection(db, 'forumPosts');
      const newPostRef = doc(postsRef);
      
      const now = new Date().toISOString();
      const postData: ForumPost = {
        authorId: user.uid,
        authorName,
        title,
        content,
        tags,
        status: 'active',
        replyCount: 0,
        createdAt: now,
        updatedAt: now
      };
      
      await setDoc(newPostRef, postData);
      return newPostRef.id;
    } catch (error) {
      console.error('Error creating forum post:', error);
      throw error;
    }
  }

  async getReplies(postId: string): Promise<ForumReply[]> {
    try {
      const repliesRef = collection(db, `forumPosts/${postId}/replies`);
      const q = query(repliesRef, where('status', '==', 'active'), orderBy('createdAt', 'asc'));
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ForumReply));
    } catch (error) {
      console.error('Error fetching forum replies:', error);
      return [];
    }
  }

  async createReply(postId: string, content: string, authorName: string): Promise<string> {
    const user = auth.currentUser;
    if (!user) throw new Error('User not authenticated');

    try {
      const repliesRef = collection(db, `forumPosts/${postId}/replies`);
      const newReplyRef = doc(repliesRef);
      
      const now = new Date().toISOString();
      const replyData: ForumReply = {
        postId,
        authorId: user.uid,
        authorName,
        content,
        status: 'active',
        createdAt: now,
        updatedAt: now
      };
      
      await setDoc(newReplyRef, replyData);
      
      // Update reply count on parent post
      const postRef = doc(db, 'forumPosts', postId);
      await updateDoc(postRef, {
        replyCount: increment(1),
        updatedAt: now
      });
      
      return newReplyRef.id;
    } catch (error) {
      console.error('Error creating forum reply:', error);
      throw error;
    }
  }
}

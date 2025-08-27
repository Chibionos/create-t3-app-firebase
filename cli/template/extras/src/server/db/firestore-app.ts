import 'server-only';

import { adminDb } from '~/server/firebase-admin';
import type { 
  DocumentData, 
  QueryDocumentSnapshot,
  Timestamp,
} from 'firebase-admin/firestore';

// Firestore converter helper
export const converter = <T>() => ({
  toFirestore: (data: T): DocumentData => data as DocumentData,
  fromFirestore: (snap: QueryDocumentSnapshot) => snap.data() as T,
});

// Collection references
export const collections = {
  users: adminDb.collection('users'),
  posts: adminDb.collection('posts'),
};

// Helper types
export interface FirestoreDocument {
  id?: string;
  createdAt?: Timestamp | Date;
  updatedAt?: Timestamp | Date;
}

// Helper functions
export const getDocument = async <T>(
  collection: string,
  id: string
): Promise<T | null> => {
  const doc = await adminDb.collection(collection).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() } as T;
};

export const getDocuments = async <T>(
  collection: string,
  limit?: number
): Promise<T[]> => {
  let query = adminDb.collection(collection);
  if (limit) {
    query = query.limit(limit) as any;
  }
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  })) as T[];
};

export const createDocument = async <T extends FirestoreDocument>(
  collection: string,
  data: T
): Promise<string> => {
  const docRef = await adminDb.collection(collection).add({
    ...data,
    createdAt: adminDb.FieldValue.serverTimestamp(),
    updatedAt: adminDb.FieldValue.serverTimestamp(),
  });
  return docRef.id;
};

export const updateDocument = async <T extends FirestoreDocument>(
  collection: string,
  id: string,
  data: Partial<T>
): Promise<void> => {
  await adminDb.collection(collection).doc(id).update({
    ...data,
    updatedAt: adminDb.FieldValue.serverTimestamp(),
  });
};

export const deleteDocument = async (
  collection: string,
  id: string
): Promise<void> => {
  await adminDb.collection(collection).doc(id).delete();
};

export { adminDb as db };
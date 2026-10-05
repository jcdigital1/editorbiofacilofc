import {
  collection,
  getDocs,
  doc,
  updateDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errors';
import { UserProfile } from './authContext';

/**
 * Fetches all registered users for the Admin Dashboard.
 */
export async function fetchAllUsers(): Promise<UserProfile[]> {
  const usersRef = collection(db, 'users');
  try {
    const q = query(usersRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const users: UserProfile[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as UserProfile;
      users.push({
        uid: docSnap.id,
        email: data.email || '',
        status: data.status || 'pending',
        role: data.role || 'user',
        createdAt: data.createdAt,
        approvedAt: data.approvedAt,
      });
    });
    return users;
  } catch (err) {
    // If order by createdAt fails due to index or missing field on old docs, fallback to simple getDocs
    try {
      const fallbackSnap = await getDocs(usersRef);
      const users: UserProfile[] = [];
      fallbackSnap.forEach((docSnap) => {
        const data = docSnap.data() as UserProfile;
        users.push({
          uid: docSnap.id,
          email: data.email || '',
          status: data.status || 'pending',
          role: data.role || 'user',
          createdAt: data.createdAt,
          approvedAt: data.approvedAt,
        });
      });
      return users;
    } catch (fallbackErr) {
      handleFirestoreError(fallbackErr, OperationType.LIST, 'users');
    }
  }
}

/**
 * Approves a pending user (pending -> approved).
 */
export async function approveUserAccount(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  try {
    await updateDoc(userRef, {
      status: 'approved',
      approvedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
  }
}

/**
 * Blocks an active user (approved -> blocked).
 */
export async function blockUserAccount(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  try {
    await updateDoc(userRef, {
      status: 'blocked',
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
  }
}

/**
 * Reactivates a blocked user (blocked -> approved).
 */
export async function reactivateUserAccount(uid: string): Promise<void> {
  const userRef = doc(db, 'users', uid);
  try {
    await updateDoc(userRef, {
      status: 'approved',
      approvedAt: serverTimestamp(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `users/${uid}`);
  }
}

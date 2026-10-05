import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import defaultConfig from '../../firebase-applet-config.json';

// Support VITE environment variables (for Vercel or custom projects) or default config
const firebaseConfig = {
  projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID as string) || defaultConfig.projectId,
  appId: (import.meta.env.VITE_FIREBASE_APP_ID as string) || defaultConfig.appId,
  apiKey: (import.meta.env.VITE_FIREBASE_API_KEY as string) || defaultConfig.apiKey,
  authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string) || defaultConfig.authDomain,
  firestoreDatabaseId: (import.meta.env.VITE_FIREBASE_FIRESTORE_DATABASE_ID as string) || defaultConfig.firestoreDatabaseId || '(default)',
  storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string) || defaultConfig.storageBucket,
  messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string) || defaultConfig.messagingSenderId,
};

// Initialize Firebase SDK
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore (supports custom named database or standard '(default)')
export const db =
  firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);

// Initialize Firebase Authentication with permanent local persistence
export const auth = getAuth(app);
setPersistence(auth, browserLocalPersistence).catch((err) => {
  console.warn('Persistência local do Firebase Auth:', err);
});

// Test Firestore server connection on startup as mandated by the skill
async function testFirestoreConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Verifique sua conexão ou configuração do Firebase.');
    }
  }
}

testFirestoreConnection();

import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAmNvETDdqrnFUzWtrlWrB8-11BF-n5bOk",
  authDomain: "test-case-manager-37d7a.firebaseapp.com",
  projectId: "test-case-manager-37d7a",
  storageBucket: "test-case-manager-37d7a.firebasestorage.app",
  messagingSenderId: "672080223135",
  appId: "1:672080223135:web:d2835716fcd2911e53bbaa",
  measurementId: "G-VET4XHPDMP"
};

// Prevent re-initialization of the app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);
export const auth = getAuth(app);
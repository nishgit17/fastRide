// firebaseConfig.ts
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAIJMo_y_nWPVEHicBUnTJn4J8LwPGvRZk",
  authDomain: "fastride-d8206.firebaseapp.com",
  projectId: "fastride-d8206",
  storageBucket: "fastride-d8206.appspot.com", 
  messagingSenderId: "1007936869171",
  appId: "1:1007936869171:web:6c689bd35f2f6c0c67a446",
  measurementId: "G-BK8RB54DX0"
};

// Avoid reinitializing if already initialized
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

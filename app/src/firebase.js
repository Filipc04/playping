import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBRm4HaWFQsuaB8Hw6ls9zKPTxyR_hH-fs",
  authDomain: "playping-app.firebaseapp.com",
  projectId: "playping-app",
  storageBucket: "playping-app.firebasestorage.app",
  messagingSenderId: "1086972665724",
  appId: "1:1086972665724:web:1cf12fc86749ecdd780ef9"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

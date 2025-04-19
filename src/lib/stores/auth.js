import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const user = writable(null);
export const loading = writable(true);

let auth;

if (browser) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };

  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  
  onAuthStateChanged(auth, (userData) => {
    user.set(userData);
    loading.set(false);
  });
}

export const signOut = async () => {
  if (browser && auth) {
    await auth.signOut();
    user.set(null);

    await fetch('/api/sessionLogout', {
      method: 'POST',
    });
  }
};
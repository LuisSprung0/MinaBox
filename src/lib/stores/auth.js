import { writable } from 'svelte/store';
import { browser } from '$app/environment';
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const user = writable(null);
export const loading = writable(true);

const firebaseConfig = {
  apiKey: "AIzaSyCJAGd9XpqG_ThCfmHbcElAuI6WjeCGx2s",
  authDomain: "mina-box.firebaseapp.com",
  projectId: "mina-box",
  storageBucket: "mina-box.firebasestorage.app",
  messagingSenderId: "77030387421",
  appId: "1:77030387421:web:94b7b0fac17f9d65573534"
};

let auth;

if (browser) {
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
  }
};
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { browser } from "$app/environment";
import { user, loading } from "$lib/stores/auth";


const firebaseConfig = {
  apiKey: "AIzaSyCJAGd9XpqG_ThCfmHbcElAuI6WjeCGx2s",
  authDomain: "mina-box.firebaseapp.com",
  projectId: "mina-box",
  storageBucket: "mina-box.firebasestorage.app",
  messagingSenderId: "77030387421",
  appId: "1:77030387421:web:94b7b0fac17f9d65573534"
};

let auth;
let db;

if (browser) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  
  onAuthStateChanged(auth, (userData) => {
    user.set(userData);
    loading.set(false);
  });
}


export const signUp = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    console.log("User created:", userCredential.user);
    await sendEmailVerification(userCredential.user);
    
    const uid = userCredential.user.uid;
    await setDoc(doc(db, "users", uid), {
      display_name: "",
      boards: []
    });
    console.log("User document created in Firestore");
    
    return userCredential.user;
  } catch (error) {
    console.error("Error signing up:", error.message);
    return null;
  }
};

export function isEmailVerified(user) {
  return user?.emailVerified || false;
}

export async function resendVerificationEmail(user) {
  if (user) {
    await sendEmailVerification(user);
    return true;
  }
  return false;
}

export const logIn = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("User logged in:", userCredential.user);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error.message);
    return null;
  }
};
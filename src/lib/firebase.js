import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { browser } from "$app/environment";
import { user, loading } from "$lib/stores/auth";

const ALLOWED_EMAIL_DOMAINS = ['ufl.edu'];
let auth;
let db;

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
  db = getFirestore(app);
  
  onAuthStateChanged(auth, (userData) => {
    user.set(userData);
    loading.set(false);
  });
}


export const signUp = async (email, password) => {
  try {
    const emailDomain = email.split('@')[1];
    if (!ALLOWED_EMAIL_DOMAINS.includes(emailDomain)) {
      throw new Error(`Email domain not allowed. Only ${ALLOWED_EMAIL_DOMAINS.join(', ')} domains are permitted.`);
    }

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
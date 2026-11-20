// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "aivora-ai-login.firebaseapp.com",
  projectId: "aivora-ai-login",
  storageBucket: "aivora-ai-login.firebasestorage.app",
  messagingSenderId: "396567317776",
  appId: "1:396567317776:web:eb0ae127864ed6f6c52995"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig)

export const auth=getAuth(app)
export const googleProvider=new GoogleAuthProvider()

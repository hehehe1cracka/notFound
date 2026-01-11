import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBWFMWqxmb9aNcj5dFY76RJHDPduaqmqzg",
  authDomain: "launchpad-363bd.firebaseapp.com",
  databaseURL: "https://launchpad-363bd-default-rtdb.firebaseio.com/",
  projectId: "launchpad-363bd",
  storageBucket: "launchpad-363bd.firebasestorage.app",
  messagingSenderId: "528418899698",
  appId: "1:528418899698:web:3a94c03075f8368699726b",
  measurementId: "G-WZTKG69GQ3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const database = getDatabase(app);

// Auth providers
export const googleProvider = new GoogleAuthProvider();
export const githubProvider = new GithubAuthProvider();

export default app;

// firebase-config.js

import { initializeApp } from
  "https://www.gstatic.com/firebasejs/13.1.0/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from
  "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment
} from
  "https://www.gstatic.com/firebasejs/13.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBB_jNBxrjJa3QUOTnckGsN1RgGrQM9_fY",
  authDomain: "sql-master-quiz.firebaseapp.com",
  projectId: "sql-master-quiz",
  storageBucket: "sql-master-quiz.firebasestorage.app",
  messagingSenderId: "580873780391",
  appId: "1:580873780391:web:dd004142fdfb97f6676f82"
};

const app = initializeApp(firebaseConfig);

// Firebase Authentication
const auth = getAuth(app);

// Fournisseur de connexion Google
const googleProvider = new GoogleAuthProvider();

// Firestore
const db = getFirestore(app);

export {
  app,
  auth,
  db,
  googleProvider,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  increment,
  signInWithPopup,
  signOut,
  onAuthStateChanged
};

// lib/firebase.js

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ✅ Corrected Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAunTNFMnY2-XKESXQcHhVxHO6IVLYMOBs",
  authDomain: "docreader-f0b46.firebaseapp.com",
  projectId: "docreader-f0b46",
  storageBucket: "docreader-f0b46.appspot.com", // ❗ FIXED: was `.app`, should be `.appspot.com`
  messagingSenderId: "542429355301",
  appId: "1:542429355301:web:1392753316952c484a8ecc",
};

// ✅ Prevent multiple initializations in dev mode
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };

import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDoncp5pGxC58NHmqjX9Vn_KvZ1NETKynU",
  authDomain: "cv-ai-consume.firebaseapp.com",
  projectId: "cv-ai-consume",
  storageBucket: "cv-ai-consume.firebasestorage.app",
  messagingSenderId: "339578498669",
  appId: "1:339578498669:web:137c82a933253e9ce6d964",
  measurementId: "G-SKZT36BHVT"
};

// Initialize Firebase only if it hasn't been initialized
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

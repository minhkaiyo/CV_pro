// Firebase configuration - Web Học Tập Platform
const firebaseConfig = {
    apiKey: "AIzaSyDXHssspkP9r3fb7ey3Sf8csJH9Y1xzEks",
    authDomain: "web-hoc-b44c2.firebaseapp.com",
    projectId: "web-hoc-b44c2",
    storageBucket: "web-hoc-b44c2.firebasestorage.app",
    messagingSenderId: "436660625882",
    appId: "1:436660625882:web:5d11f497fd0c05c9dae0e3",
    measurementId: "G-WDR3BET7Z7"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Firestore collections reference
const subjectsRef = db.collection('subjects');
const notesRef = db.collection('notes');
const examKeysRef = db.collection('examKeys');
const keyRequestsRef = db.collection('keyRequests');
const userKeyAccessRef = db.collection('userKeyAccess');

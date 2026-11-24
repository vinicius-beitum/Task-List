import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

export {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signInWithPopup,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    signOut,
    setPersistence,
    browserLocalPersistence,
    browserSessionPersistence,
    GoogleAuthProvider
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";

export {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    onSnapshot,
    writeBatch,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCJ-fmEj_oLiIH0-WvYlWiWsvOeLLuiSPs",
    authDomain: "task-list-8714f.firebaseapp.com",
    projectId: "task-list-8714f",
    storageBucket: "task-list-8714f.firebasestorage.app",
    messagingSenderId: "441811884875",
    appId: "1:441811884875:web:8a4e0590b94924533ce6ce"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
auth.languageCode = "pt-BR";

export const db = getFirestore(app);
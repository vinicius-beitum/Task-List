import {initializeApp} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {getAuth} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {getFirestore} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCJ-fmEj_oLiIH0-WvYlWiWsvOeLLuiSPs",
  authDomain: "task-list-8714f.firebaseapp.com",
  projectId: "task-list-8714f",
  storageBucket: "task-list-8714f.firebasestorage.app",
  messagingSenderId: "441811884875",
  appId: "1:441811884875:web:8a4e0590b94924533ce6ce",
  measurementId: "G-PFYH0C6WVT"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
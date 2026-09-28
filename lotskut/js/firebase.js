import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {getAuth,onAuthStateChanged} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {getFirestore} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

export const firebaseConfig = {
apiKey: "AIzaSyDUAXb6W-KTWz5fLMfbPrZqg0HaS_INTiw",
  authDomain: "lotskut.firebaseapp.com",
  projectId: "lotskut",
  storageBucket: "lotskut.firebasestorage.app",
  messagingSenderId: "970939233116",
  appId: "1:970939233116:web:d6a0579c7643ad11a20799",
  measurementId: "G-4PH062HSZN"
};

export const configured = true;
export let auth = null, db = null;
if (configured) { const a = initializeApp(firebaseConfig); auth = getAuth(a); db = getFirestore(a); }

export const whenUser = () => new Promise(res => {
  if (!auth) return res(null);
  const off = onAuthStateChanged(auth, u => { off(); res(u); });
});

export {createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile, sendPasswordResetEmail} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
export {collection, addDoc, getDocs, getDoc, doc, deleteDoc, updateDoc, query, orderBy, where, serverTimestamp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

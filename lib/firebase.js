import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBS3_h8LcUu6ZplxadGlRcPt68emfMBwC8",
    authDomain: "surveys-46863.firebaseapp.com",
    databaseURL: "https://surveys-46863-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "surveys-46863",
    storageBucket: "surveys-46863.appspot.com",
    messagingSenderId: "938303945625",
    appId: "1:938303945625:web:3e1480c224afc57221b108",
    measurementId: "G-LZ6P7J4KJT"
  };

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
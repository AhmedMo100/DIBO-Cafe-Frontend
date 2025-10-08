// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAjd8IjvAzEifj03dOdH1ZoVCNxKOAdQcA",
    authDomain: "dibo-cafe-b13d9.firebaseapp.com",
    projectId: "dibo-cafe-b13d9",
    storageBucket: "dibo-cafe-b13d9.firebasestorage.app",
    messagingSenderId: "280349018181",
    appId: "1:280349018181:web:4aaf649926afbf2a20bb2c",
    measurementId: "G-8TFET1ZP4V",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
export const auth = getAuth(app);
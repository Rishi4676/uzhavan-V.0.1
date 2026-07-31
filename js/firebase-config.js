import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCL6BEKQdiiZrYvdWAZG3ta6u9XDuGU2tI",
  authDomain: "agriculture-2a4cc.firebaseapp.com",
  projectId: "agriculture-2a4cc",
  storageBucket: "agriculture-2a4cc.firebasestorage.app",
  messagingSenderId: "169729155151",
  appId: "1:169729155151:web:72b4a15d677b8e2acc0a3a",
  measurementId: "G-76VG4V2691"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);

// Initialize Auth
export const auth = getAuth(app);

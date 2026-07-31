import { auth, db } from "./firebase-config.js";
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Utility for showing/hiding loader spinner
function toggleLoader(show) {
  const loader = document.getElementById("loader");
  if (loader) {
    loader.style.display = show ? "flex" : "none";
  }
}

/**
 * Helper to translate usernames to email addresses for Firebase Auth
 */
function getEmailFromUsername(username) {
  const cleanUsername = username.trim().toLowerCase();
  if (cleanUsername.includes("@")) {
    return cleanUsername;
  }
  // Generate a valid pseudo email for Firebase Auth from the username
  return `${cleanUsername}@agriculture-app.com`;
}

/**
 * Handle user registration. Saves the user credentials in Firebase Auth and profile details in Firestore.
 */
async function registerUser(event) {
  event.preventDefault();
  
  const name = document.getElementById("reg-name").value.trim();
  const username = document.getElementById("reg-username").value.trim();
  const phone = document.getElementById("reg-phone").value.trim();
  const village = document.getElementById("reg-village").value.trim();
  const password = document.getElementById("reg-password").value;

  toggleLoader(true);

  try {
    const email = getEmailFromUsername(username);

    // 1. Create User in Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Save additional profile information to Cloud Firestore under the user's uid
    try {
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        full_name: name,
        username: username,
        phone_number: phone,
        village_name: village,
        created_at: new Date().toISOString()
      });
      console.log("Profile successfully saved to Cloud Firestore database.");
    } catch (fsError) {
      console.warn("Cloud Firestore profile save failed (possibly due to security rules). Saving locally to localStorage:", fsError.message);
      
      // Local fallback for profile storage
      let localUsers = [];
      try {
        localUsers = JSON.parse(localStorage.getItem("agri_users")) || [];
      } catch (e) {
        localUsers = [];
      }
      localUsers.push({
        id: user.uid,
        uid: user.uid,
        full_name: name,
        username: username,
        phone_number: phone,
        village_name: village,
        created_at: new Date().toISOString()
      });
      localStorage.setItem("agri_users", JSON.stringify(localUsers));
    }

    alert("Registration successful! Redirecting to login page...");
    window.location.href = "login.html";
  } catch (error) {
    console.error("Error during Firebase registration:", error);
    let errorMsg = error.message;
    if (error.code === "auth/email-already-in-use") {
      errorMsg = "Username already exists. Please choose a different one.";
    } else if (error.code === "auth/weak-password") {
      errorMsg = "Password should be at least 6 characters.";
    }
    alert("Registration failed: " + errorMsg);
  } finally {
    toggleLoader(false);
  }
}

/**
 * Handle user login. Authenticates with Firebase Auth and retrieves profile details from Firestore.
 */
async function loginUser(event) {
  event.preventDefault();

  const username = document.getElementById("login-username").value.trim();
  const password = document.getElementById("login-password").value;

  toggleLoader(true);

  try {
    const email = getEmailFromUsername(username);

    // 1. Authenticate with Firebase Authentication
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Fetch the user's profile details from Cloud Firestore (with localStorage fallback)
    let userData;
    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        userData = {
          id: user.uid,
          ...userDoc.data()
        };
        console.log("Profile successfully loaded from Cloud Firestore database.");
      }
    } catch (fsError) {
      console.warn("Cloud Firestore profile fetch failed. Looking in localStorage:", fsError.message);
    }

    if (!userData) {
      // Look in localStorage
      let localUsers = [];
      try {
        localUsers = JSON.parse(localStorage.getItem("agri_users")) || [];
      } catch (e) {
        localUsers = [];
      }
      const localUser = localUsers.find(u => u.uid === user.uid || u.username === username);
      if (localUser) {
        userData = {
          id: user.uid,
          ...localUser
        };
        console.log("Profile loaded from local storage fallback.");
      } else {
        // Fallback if no profile is found anywhere
        userData = {
          id: user.uid,
          username: username,
          full_name: username
        };
      }
    }

    // Save session locally in the browser
    localStorage.setItem("user", JSON.stringify(userData));

    alert("Login successful! Welcome to Smart Farmer Assistant.");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error during Firebase login:", error);
    let errorMsg = error.message;
    if (error.code === "auth/invalid-credential" || error.code === "auth/user-not-found" || error.code === "auth/wrong-password") {
      errorMsg = "Invalid username or password.";
    }
    alert("Login failed: " + errorMsg);
  } finally {
    toggleLoader(false);
  }
}

// Bind functions to the window object to make them globally accessible by HTML form submission handlers
window.registerUser = registerUser;
window.loginUser = loginUser;

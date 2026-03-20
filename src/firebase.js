import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDF6L3RP5NT93Dupjmy6p9l6fsaXAzTDgY",
  authDomain: "settai-app.firebaseapp.com",
  projectId: "settai-app",
  storageBucket: "settai-app.firebasestorage.app",
  messagingSenderId: "10941343115",
  appId: "1:10941343115:web:925294a8a3471aa1c37b8e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

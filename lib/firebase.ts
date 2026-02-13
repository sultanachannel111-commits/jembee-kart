import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YAHAN_API_KEY",
  authDomain: "YAHAN_AUTH_DOMAIN",
  projectId: "YAHAN_PROJECT_ID",
  storageBucket: "YAHAN_STORAGE_BUCKET",
  messagingSenderId: "YAHAN_SENDER_ID",
  appId: "YAHAN_APP_ID",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

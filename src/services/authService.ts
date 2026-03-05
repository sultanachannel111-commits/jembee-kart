import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signOut,
} from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const googleProvider = new GoogleAuthProvider();

/* ---------------------------
REGISTER USER
----------------------------*/
export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    name,
    email,
    role: "customer",
    createdAt: new Date(),
  });

  return user;
};

/* ---------------------------
LOGIN USER
----------------------------*/
export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(
    auth,
    email,
    password
  );

  return userCredential.user;
};

/* ---------------------------
GOOGLE LOGIN
----------------------------*/
export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);

  const user = result.user;

  await setDoc(
    doc(db, "users", user.uid),
    {
      name: user.displayName,
      email: user.email,
      role: "customer",
      createdAt: new Date(),
    },
    { merge: true }
  );

  return user;
};

/* ---------------------------
RESET PASSWORD
----------------------------*/
export const resetPassword = async (email: string) => {
  await sendPasswordResetEmail(auth, email);
};

/* ---------------------------
LOGOUT
----------------------------*/
export const logoutUser = async () => {
  await signOut(auth);
};

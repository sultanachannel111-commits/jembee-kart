"use client";

import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInAnonymously,
  signOut,
  User,
} from "firebase/auth";

import { auth } from "@/lib/firebase";
import {
  doc,
  setDoc,
  onSnapshot
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

/* ================================
   TYPES
================================ */
interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/* ================================
   🔥 AUTO ROLE LOGIC
================================ */
const getAutoRole = (email: string | null) => {
  if (!email) return "customer";

  const lower = email.toLowerCase();

  if (lower.includes("admin")) return "admin";
  if (lower.includes("seller")) return "seller";

  return "customer";
};

/* ================================
   PROVIDER
================================ */
export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  /* ================================
     🔥 AUTH + REALTIME ROLE
  ================================= */
  useEffect(() => {

    let unsubscribeRole: any;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {

      setUser(currentUser);

      if (!currentUser) {
        setRole(null);
        setLoading(false);
        return;
      }

      const docRef = doc(db, "users", currentUser.uid);

      // 🔥 AUTO ROLE (EMAIL BASED)
      const autoRole = getAutoRole(currentUser.email);

      console.log("📧 EMAIL:", currentUser.email);
      console.log("⚡ AUTO ROLE:", autoRole);

      // 🔥 FORCE UPDATE (NO OLD DATA ISSUE)
      await setDoc(docRef, {
        role: autoRole,
        email: currentUser.email || "",
        updatedAt: new Date()
      }, { merge: true });

      // 🔥 REALTIME LISTENER
      unsubscribeRole = onSnapshot(docRef, (snap) => {

        const userRole = snap.data()?.role || autoRole;

        console.log("🔥 FINAL ROLE:", userRole);

        setRole(userRole);
        setLoading(false);
      });

    });

    return () => {
      if (unsubscribeRole) unsubscribeRole();
      unsubscribeAuth();
    };

  }, []);

  /* ================================
     🚀 AUTO REDIRECT (INSTANT)
  ================================= */
  useEffect(() => {

    if (!role) return;

    console.log("➡️ REDIRECT ROLE:", role);

    if (role === "admin") {
      window.location.replace("/admin");
    } 
    else if (role === "seller") {
      window.location.replace("/seller");
    } 
    else {
      window.location.replace("/");
    }

  }, [role]);

  /* ================================
     AUTH FUNCTIONS
  ================================= */

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const registerWithEmail = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const loginAsGuest = async () => {
    await signInAnonymously(auth);
  };

  const logout = async () => {
    await signOut(auth);
    setRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        loginWithGoogle,
        registerWithEmail,
        loginWithEmail,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ================================
   HOOK
================================ */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

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
  onSnapshot,
  getDoc
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

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

/* 🔥 AUTO ROLE DECIDER */
const getAutoRole = (email: string | null) => {
  if (!email) return "customer";

  if (email.includes("admin")) return "admin";
  if (email.includes("seller")) return "seller";

  return "customer";
};

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

      const snap = await getDoc(docRef);

      /* 🔥 AUTO ROLE SET */
      let autoRole = getAutoRole(currentUser.email);

      if (!snap.exists()) {
        await setDoc(docRef, {
          role: autoRole,
          email: currentUser.email || "",
          createdAt: new Date()
        });
      }

      /* 🔥 REALTIME ROLE LISTENER */
      unsubscribeRole = onSnapshot(docRef, (snap) => {

        const userRole = snap.data()?.role || autoRole;

        setRole(userRole);

        console.log("🔥 ROLE:", userRole);

        setLoading(false);
      });

    });

    return () => {
      if (unsubscribeRole) unsubscribeRole();
      unsubscribeAuth();
    };

  }, []);

  /* 🔥 AUTO REDIRECT */
  useEffect(() => {

    if (!role) return;

    if (role === "admin") {
      window.location.href = "/admin";
    } 
    else if (role === "seller") {
      window.location.href = "/seller";
    } 
    else {
      window.location.href = "/";
    }

  }, [role]);

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

/* 🔥 HOOK */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

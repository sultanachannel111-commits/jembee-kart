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

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  setRoleType: (role: string) => void;
  loginWithGoogle: () => Promise<void>;
  registerWithEmail: (email: string, password: string) => Promise<void>;
  loginWithEmail: (email: string, password: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("customer");
  const [loading, setLoading] = useState(true);

  // 🔥 REALTIME AUTH + ROLE SYSTEM
  useEffect(() => {

    let unsubscribeRole: any;

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {

      setUser(currentUser);

      if (!currentUser) {
        setRole(null);
        setLoading(false);
        return;
      }

      const docRef = doc(db, "users", currentUser.uid);

      // 🔥 LIVE ROLE LISTENER
      unsubscribeRole = onSnapshot(docRef, async (snap) => {

        let userRole = "customer";

        if (snap.exists()) {
          userRole = snap.data().role || "customer";
        } else {
          // 🆕 AUTO CREATE USER
          await setDoc(docRef, {
            role: "customer",
            email: currentUser.email || "",
            createdAt: new Date()
          });

          userRole = "customer";
        }

        setRole(userRole);

        console.log("🔥 LIVE ROLE:", userRole);

        setLoading(false);
      });

    });

    return () => {
      if (unsubscribeRole) unsubscribeRole();
      unsubscribeAuth();
    };

  }, []);

  // 🔥 AUTO REDIRECT (LIVE)
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

  // 🔥 SAVE ROLE FOR NEW USER
  const saveRoleIfNewUser = async (uid: string) => {
    const docRef = doc(db, "users", uid);

    await setDoc(docRef, {
      role: selectedRole,
      createdAt: new Date()
    }, { merge: true });

    setRole(selectedRole);
  };

  // 🔥 GOOGLE LOGIN
  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);

    await saveRoleIfNewUser(result.user.uid);
  };

  // 🔥 EMAIL REGISTER
  const registerWithEmail = async (email: string, password: string) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);

    await saveRoleIfNewUser(result.user.uid);
  };

  // 🔥 EMAIL LOGIN
  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // 🔥 GUEST LOGIN
  const loginAsGuest = async () => {
    const result = await signInAnonymously(auth);

    await saveRoleIfNewUser(result.user.uid);
  };

  // 🔥 LOGOUT
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
        setRoleType: setSelectedRole,
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

// 🔥 HOOK
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}

"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { auth, db } from "@/lib/firebase";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
  signOut,
  User,
} from "firebase/auth";

import { doc, getDoc } from "firebase/firestore";

type AuthType = {
  user: User | null;
  loading: boolean;
  role: string | null;
  loginWithEmail: (email: string, password: string) => Promise<any>;
  registerWithEmail: (email: string, password: string) => Promise<any>;
  loginWithGoogle: () => Promise<any>;
  loginAsGuest: () => Promise<any>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {

  const [user,setUser] = useState<User | null>(null);
  const [loading,setLoading] = useState(true);
  const [role,setRole] = useState<string | null>(null);

  useEffect(()=>{

    const unsubscribe = onAuthStateChanged(auth, async(currentUser)=>{

      setUser(currentUser);

      if(currentUser){

        try{

          const snap = await getDoc(doc(db,"users",currentUser.uid));

          if(snap.exists()){
            const data = snap.data();
            setRole(data.role || "customer");
          }else{
            setRole("customer");
          }

        }catch(e){
          console.log(e);
          setRole("customer");
        }

      }else{
        setRole(null);
      }

      setLoading(false);

    });

    return ()=>unsubscribe();

  },[]);

  const loginWithEmail = (email:string,password:string)=>{
    return signInWithEmailAndPassword(auth,email,password);
  };

  const registerWithEmail = (email:string,password:string)=>{
    return createUserWithEmailAndPassword(auth,email,password);
  };

  const loginWithGoogle = ()=>{
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth,provider);
  };

  const loginAsGuest = ()=>{
    return signInAnonymously(auth);
  };

  const logout = ()=>{
    return signOut(auth);
  };

  return(
    <AuthContext.Provider
      value={{
        user,
        loading,
        role,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = ()=>{
  const context = useContext(AuthContext);
  if(!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
};

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInAnonymously,
} from "firebase/auth";

import { doc, getDoc, setDoc } from "firebase/firestore";

export default function LoginPage() {

  const router = useRouter();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [message,setMessage] = useState("");
  const [loading,setLoading] = useState(false);



  // 🔥 EMAIL LOGIN
  const handleLogin = async () => {

    try{

      setLoading(true);
      setMessage("");

      const res = await signInWithEmailAndPassword(auth,email,password);

      const uid = res.user.uid;

      const snap = await getDoc(doc(db,"users",uid));

      if(snap.exists()){

        const data:any = snap.data();

        if(data.role === "seller"){
          router.replace("/seller");
        }

        else if(data.role === "admin"){
          router.replace("/admin");
        }

        else{
          router.replace("/");
        }

      }else{
        router.replace("/");
      }

    }catch(error:any){

      setMessage(error.message);

    }

    setLoading(false);

  };



  // 🔥 REGISTER
  const handleRegister = async () => {

    try{

      setLoading(true);
      setMessage("");

      const res = await createUserWithEmailAndPassword(auth,email,password);

      const uid = res.user.uid;

      await setDoc(doc(db,"users",uid),{
        email,
        role:"customer",
        createdAt: new Date()
      });

      router.replace("/");

    }catch(error:any){

      setMessage(error.message);

    }

    setLoading(false);

  };



  // 🔥 GOOGLE LOGIN
  const handleGoogle = async () => {

    try{

      const provider = new GoogleAuthProvider();

      const res = await signInWithPopup(auth,provider);

      const uid = res.user.uid;

      const snap = await getDoc(doc(db,"users",uid));

      if(!snap.exists()){

        await setDoc(doc(db,"users",uid),{
          email:res.user.email,
          role:"customer",
          createdAt:new Date()
        });

      }

      router.replace("/");

    }catch(error:any){

      setMessage(error.message);

    }

  };



  // 🔥 GUEST LOGIN
  const handleGuest = async () => {

    try{

      await signInAnonymously(auth);

      router.replace("/");

    }catch(error:any){

      setMessage(error.message);

    }

  };



  return (

    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

      <div className="bg-white p-8 rounded-xl shadow-md w-80 space-y-4">

        <h2 className="text-xl font-bold text-center">
          Login
        </h2>

        {message && (
          <div className="text-red-500 text-sm text-center">
            {message}
          </div>
        )}

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-black text-white py-2 rounded"
        >
          {loading ? "Please wait..." : "Login"}
        </button>

        <button
          onClick={handleRegister}
          className="w-full bg-gray-700 text-white py-2 rounded"
        >
          Register
        </button>

        <button
          onClick={handleGoogle}
          className="w-full bg-red-500 text-white py-2 rounded"
        >
          Login with Google
        </button>

        <button
          onClick={handleGuest}
          className="w-full bg-green-500 text-white py-2 rounded"
        >
          Continue as Guest
        </button>

      </div>

    </div>

  );

}

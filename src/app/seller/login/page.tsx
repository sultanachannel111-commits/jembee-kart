"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { setSellerCookie } from "@/lib/cookieAuth";

export default function SellerLogin() {

  const router = useRouter();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");

  const login = async(e:any)=>{

    e.preventDefault();
    setError("");
    setLoading(true);

    try{

      const res = await signInWithEmailAndPassword(auth,email,password);
      const uid = res.user.uid;

      const snap = await getDoc(doc(db,"users",uid));

      if(!snap.exists()){
        setError("User not found");
        setLoading(false);
        return;
      }

      const data = snap.data();

      if(data.role !== "seller"){
        setError("This account is not a seller");
        setLoading(false);
        return;
      }

      setSellerCookie();
      router.push("/seller/dashboard");

    }catch(err){
      setError("Login failed. Check email & password");
    }

    setLoading(false);
  };

  return(

  <div className="min-h-screen flex items-center justify-center bg-gray-100">

    <div className="bg-white p-8 rounded-xl shadow w-96">

      <h1 className="text-3xl font-bold text-center mb-2">
        JembeeKart
      </h1>

      <p className="text-center text-gray-500 mb-6">
        Seller Login
      </p>

      <form onSubmit={login} className="space-y-4">

        <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e)=>setEmail(e.target.value)}
        className="border w-full p-3 rounded-lg"
        />

        <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e)=>setPassword(e.target.value)}
        className="border w-full p-3 rounded-lg"
        />

        {error && (
          <p className="text-red-500 text-sm text-center">
            {error}
          </p>
        )}

        <button
        type="submit"
        className="bg-black text-white w-full py-3 rounded-lg"
        >
        {loading ? "Logging..." : "Login"}
        </button>

      </form>

      <p className="text-center text-sm mt-5">
        No seller account?

        <button
        onClick={()=>router.push("/seller/signup")}
        className="text-blue-600 ml-1"
        >
        Create account
        </button>

      </p>

    </div>

  </div>

  );

}

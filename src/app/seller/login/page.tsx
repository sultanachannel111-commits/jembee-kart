"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";

export default function SellerLoginPage() {

  const router = useRouter();

  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [show,setShow] = useState(false);
  const [loading,setLoading] = useState(false);

  const login = async (e:any)=>{

    e.preventDefault();
    setLoading(true);

    console.log("🚀 LOGIN START");

    try{

      const userCred = await signInWithEmailAndPassword(auth,email,password);

      console.log("✅ LOGIN SUCCESS:", userCred.user.uid);

      // 🔥 FIRESTORE ROLE CHECK
      console.log("📡 Fetching user role...");
      const snap = await getDoc(doc(db,"users",userCred.user.uid));

      if(!snap.exists()){
        console.log("❌ USER DOC NOT FOUND");
        toast.error("User data not found");
        setLoading(false);
        return;
      }

      const data = snap.data();
      console.log("🔥 USER DATA:", data);

      // ❌ NOT SELLER
      if(data.role !== "seller"){
        console.log("❌ NOT SELLER");
        toast.error("Not a seller account");
        setLoading(false);
        return;
      }

      console.log("✅ SELLER VERIFIED");

      // ✅ COOKIE SET
      document.cookie = "seller=true; path=/";
      console.log("🍪 Cookie set");

      toast.success("Seller login successful");

      // 🔥 IMPORTANT FIX (NO HARD RELOAD)
      console.log("➡️ Redirecting to dashboard...");

      setTimeout(()=>{
        router.replace("/seller/dashboard");
      },1000);

    }catch(err:any){

      console.log("💥 LOGIN ERROR:", err);
      toast.error("Invalid email or password");

    }

    setLoading(false);

  };

  return(

    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-500 via-purple-500 to-indigo-600 p-4">

      <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-sm">

        <h1 className="text-3xl font-bold text-center text-pink-600">
          JembeeKart
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Seller Login
        </p>

        <form onSubmit={login} className="space-y-4">

          {/* EMAIL */}
          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400" size={18}/>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e)=>setEmail(e.target.value)}
              className="w-full border rounded-xl pl-10 pr-4 py-3"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400" size={18}/>
            <input
              type={show ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e)=>setPassword(e.target.value)}
              className="w-full border rounded-xl pl-10 pr-10 py-3"
              required
            />

            <button
              type="button"
              onClick={()=>setShow(!show)}
              className="absolute right-3 top-3 text-gray-400"
            >
              {show ? <EyeOff size={18}/> : <Eye size={18}/>}
            </button>
          </div>

          {/* LOGIN BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

        </form>

      </div>

    </div>

  );

}

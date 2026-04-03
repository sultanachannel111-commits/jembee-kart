"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";

export default function SellerLayout({ children }: any){

  const router = useRouter();
  const pathname = usePathname();

  const [loading,setLoading] = useState(true);
  const [allowed,setAllowed] = useState(false);
  const [logouting,setLogouting] = useState(false);

  // 🔥 AUTH CHECK
  useEffect(()=>{

    const unsub = onAuthStateChanged(auth, async (user)=>{

      try{

        if(!user){
          setAllowed(false);
          setLoading(false);
          router.replace("/seller/login");
          return;
        }

        const snap = await getDoc(doc(db,"users",user.uid));

        if(!snap.exists()){
          setAllowed(false);
          setLoading(false);
          router.replace("/");
          return;
        }

        const data:any = snap.data();

        if(data.role !== "seller"){
          setAllowed(false);
          setLoading(false);
          router.replace("/");
          return;
        }

        setAllowed(true);
        setLoading(false);

      }catch(err){

        console.log("Seller check error:",err);
        setAllowed(false);
        setLoading(false);
        router.replace("/");

      }

    });

    return ()=>unsub();

  },[]);


  // 🔥 LOGIN PAGE PAR SIDEBAR NAHI
  if(pathname === "/seller/login" || pathname === "/seller/signup"){
    return <>{children}</>;
  }


  // 🔥 LOADING SCREEN
  if(loading){
    return(
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    )
  }


  // 🔥 NOT ALLOWED
  if(!allowed){
    return null;
  }


  // 🔥 LOGOUT
  const logout = async ()=>{

    setLogouting(true);

    setTimeout(async ()=>{

      await signOut(auth);

      router.replace("/seller/login");

    },500);

  };


  return(

    <div className={`min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white transition-all duration-500 ${logouting ? "opacity-0 translate-x-full" : ""}`}>

      {/* 🔥 TOP BAR */}
      <div className="flex justify-between items-center p-4 bg-white shadow sticky top-0 z-10">

        <h1 className="font-bold text-lg">
          Seller Dashboard 🚀
        </h1>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-1 rounded-lg text-sm"
        >
          Logout
        </button>

      </div>


      {/* 🔥 MAIN CONTENT */}
      <div className="p-4">

        {children}

      </div>

    </div>

  )

}

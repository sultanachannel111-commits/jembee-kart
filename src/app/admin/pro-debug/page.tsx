"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function ProDebugPage(){

  const router = useRouter();

  const [logs,setLogs] = useState<string[]>([]);
  const [info,setInfo] = useState<any>({});

  const log = (msg:any)=>{
    const text = typeof msg === "string" ? msg : JSON.stringify(msg);
    console.log("🔥", msg);
    setLogs(prev => [...prev, text]);
  };

  useEffect(()=>{

    log("🚀 PRO DEBUG START");

    // 🔐 AUTH TRACK
    const unsub = onAuthStateChanged(auth,(user)=>{
      log({
        type:"AUTH",
        user: user ? user.email : null,
        uid: user?.uid
      });
    });

    // 🌐 PATH TRACK
    log({
      type:"PATH",
      path: window.location.pathname,
      full: window.location.href
    });

    // 🍪 COOKIE TRACK
    log({
      type:"COOKIE",
      cookies: document.cookie
    });

    // 🚨 ROUTER PUSH TRACK
    const originalPush = router.push;

    router.push = (url:string)=>{
      log({
        type:"REDIRECT",
        to: url
      });
      return originalPush(url);
    };

    // ❌ GLOBAL ERROR
    window.onerror = function(msg,url,line,col,error){
      log({
        type:"ERROR",
        msg,
        url,
        line,
        col
      });
    };

    // ❌ PROMISE ERROR
    window.onunhandledrejection = function(e){
      log({
        type:"PROMISE_ERROR",
        reason: e.reason
      });
    };

    // 🔁 INTERVAL LIVE CHECK
    const interval = setInterval(()=>{
      setInfo({
        path: window.location.pathname,
        cookies: document.cookie,
        time: new Date().toLocaleTimeString()
      });
    },2000);

    return ()=>{
      unsub();
      clearInterval(interval);
    };

  },[]);

  const copyLogs = ()=>{
    navigator.clipboard.writeText(JSON.stringify(logs,null,2));
    alert("Logs Copied ✅");
  };

  return(

<div className="min-h-screen bg-black text-green-400 p-4">

<h1 className="text-xl mb-3">🔥 PRO DEBUG PANEL</h1>

<button
onClick={copyLogs}
className="bg-green-600 text-white px-4 py-2 rounded mb-4"
>
Copy Logs
</button>

{/* LIVE INFO */}
<div className="bg-gray-900 p-3 rounded text-xs mb-4">
<pre>{JSON.stringify(info,null,2)}</pre>
</div>

{/* LOGS */}
<div className="bg-gray-900 p-3 rounded text-xs max-h-[400px] overflow-auto">
{logs.map((l,i)=>(
  <div key={i} className="mb-1">{l}</div>
))}
</div>

</div>

  );
}

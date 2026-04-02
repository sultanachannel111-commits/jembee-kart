"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  onSnapshot,
  writeBatch,
  increment
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function ProfilePage(){

  const router = useRouter();

  const [user,setUser] = useState<any>(null);
  const [orders,setOrders] = useState<any[]>([]);
  const [loading,setLoading] = useState(true);

  const [name,setName] = useState("");
  const [phone,setPhone] = useState("");
  const [address,setAddress] = useState("");

  const [wallet,setWallet] = useState(0);
  const [referralCode,setReferralCode] = useState("");

  const [edit,setEdit] = useState(false);

  const steps = ["Placed","Shipped","Out for Delivery","Delivered"];

  /* 🔥 SAFE ADDRESS */
  const fixAddress = (addr:any)=>{
    try{
      if(typeof addr === "string") return addr;
      if(typeof addr === "object") return addr?.address || "";
      return "";
    }catch{
      return "";
    }
  };

  /* 🔐 AUTH + LOAD */
  useEffect(()=>{

    let unsubOrders:any;

    const unsubAuth = onAuthStateChanged(auth, async(u)=>{

      if(!u){
        router.push("/login");
        return;
      }

      setUser(u);

      const userRef = doc(db,"users",u.uid);
      const snap = await getDoc(userRef);

      // 🆕 FIRST TIME USER
      if(!snap.exists()){
        const code =
          (u.email?.slice(0,4) || "USER").toUpperCase() +
          Math.floor(1000 + Math.random()*9000);

        await setDoc(userRef,{
          name:"",
          phone:"",
          address:{
            firstName:"",
            phone:"",
            address:""
          },
          wallet:0,
          referralCode:code
        });

        setReferralCode(code);
      }

      // 🔄 REALTIME USER
      onSnapshot(userRef,(snap)=>{
        if(snap.exists()){
          const d:any = snap.data();

          if(typeof d.address === "object"){
            setName(d.address?.firstName || "");
            setPhone(d.address?.phone || "");
            setAddress(d.address?.address || "");
          }else{
            setName(d.name || "");
            setPhone(d.phone || "");
            setAddress(d.address || "");
          }

          setWallet(d.wallet || 0);
          setReferralCode(d.referralCode || "");
        }
      });

      // 🔄 REALTIME ORDERS
      const q = query(
        collection(db,"orders"),
        where("userId","==",u.uid)
      );

      unsubOrders = onSnapshot(q,(snap)=>{
        const arr:any[] = [];
        snap.forEach(doc=>{
          arr.push({ id:doc.id, ...doc.data() });
        });
        setOrders(arr);
        setLoading(false);
      });

    });

    return ()=>{
      unsubAuth();
      if(unsubOrders) unsubOrders();
    };

  },[]);

  /* 💾 SAVE PROFILE + ADDRESS */
  const saveProfile = async()=>{
    if(!user) return;

    await setDoc(doc(db,"users",user.uid),{
      address:{
        firstName:name,
        phone:phone,
        address:address
      }
    },{merge:true});

    setEdit(false);
    alert("Saved ✅");
  };

  /* ❌ CANCEL ORDER */
  const cancelOrder = async(id:string)=>{
    try{
      const ref = doc(db,"orders",id);
      const snap = await getDoc(ref);

      if(!snap.exists()) return;

      const data:any = snap.data();
      const batch = writeBatch(db);

      batch.update(ref,{status:"Cancelled"});

      for(const item of data?.items || []){
        const pRef = doc(db,"products",item.productId);
        batch.update(pRef,{
          stock: increment(item.quantity)
        });
      }

      await batch.commit();

    }catch(err){
      console.log("Cancel error", err);
    }
  };

  /* 📦 STEP */
  const getStep = (status:any)=>{
    const s = String(status || "").toLowerCase();
    if(s==="placed") return 0;
    if(s==="shipped") return 1;
    if(s==="out for delivery") return 2;
    if(s==="delivered") return 3;
    return 0;
  };

  /* 💰 PRICE */
  const getPrice = (order:any)=>{
    return Number(order?.total) || 0;
  };

  /* 📤 SHARE */
  const shareReferral = ()=>{
    const msg = `Join JembeeKart 💰 Use code: ${referralCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  if(loading) return <div className="p-5">Loading...</div>;

  return(
<div className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-50 to-white">

{/* 🔝 HEADER */}
<div className="bg-gradient-to-r from-purple-600 to-pink-500 text-white p-5 rounded-b-3xl shadow-lg">
  <h1 className="text-xl font-bold">My Account</h1>
</div>

<div className="p-4 space-y-4">

{/* 👤 PROFILE */}
<div className="bg-white/80 backdrop-blur p-4 rounded-2xl shadow flex items-center gap-3">
  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center">
    {user?.email?.charAt(0)?.toUpperCase()}
  </div>

  <div className="flex-1">
    <p className="font-semibold">{name || "User"}</p>
    <p className="text-xs text-gray-500">{user.email}</p>
  </div>

  <button onClick={()=>setEdit(!edit)}
    className="text-purple-600 text-sm">
    Edit
  </button>
</div>

{/* ✏️ EDIT */}
{edit && (
<div className="bg-white p-4 rounded-xl shadow space-y-2">
  <input value={name} onChange={(e)=>setName(e.target.value)}
    placeholder="Name" className="w-full border p-2 rounded"/>

  <input value={phone} onChange={(e)=>setPhone(e.target.value)}
    placeholder="Phone" className="w-full border p-2 rounded"/>

  <textarea value={address} onChange={(e)=>setAddress(e.target.value)}
    placeholder="Address" className="w-full border p-2 rounded"/>

  <button onClick={saveProfile}
    className="w-full bg-purple-600 text-white py-2 rounded">
    Save
  </button>
</div>
)}

{/* 🏠 ADDRESS */}
<div className="bg-white p-4 rounded-xl shadow">
  <p className="font-semibold">Delivery Address</p>
  <p className="text-sm text-gray-600">
    {fixAddress({address}) || "No address"}
  </p>
</div>

{/* 💰 WALLET */}
<div className="bg-white p-4 rounded-xl shadow flex justify-between">
  <p>Wallet</p>
  <p className="text-green-600 font-bold">₹{wallet}</p>
</div>

{/* 🎁 REFERRAL */}
<div className="bg-white p-4 rounded-xl shadow">
  <p className="text-sm">Referral Code</p>
  <p className="font-bold text-lg">{referralCode}</p>

  <div className="flex gap-3 mt-2">
    <button onClick={()=>navigator.clipboard.writeText(referralCode)}
      className="text-blue-600 text-sm">Copy</button>

    <button onClick={shareReferral}
      className="text-green-600 text-sm">WhatsApp</button>
  </div>
</div>

{/* 📦 ORDERS */}
<div>
<h3 className="font-semibold mb-2">My Orders</h3>

{orders.map(order=>(
<div key={order.id}
className="bg-white p-4 rounded-xl shadow mb-3">

<p className="text-xs text-gray-400">
#{order.id.slice(0,8)}
</p>

<div className="flex mt-2">
{steps.map((step,i)=>(
<div key={i} className="flex-1 text-center text-xs">
<div className={`h-2 rounded ${
getStep(order.status)>=i
? "bg-green-500"
: "bg-gray-300"
}`} />
<p>{step}</p>
</div>
))}
</div>

<p className="font-bold mt-2">₹{getPrice(order)}</p>

{order.status !== "Delivered" && (
<button
onClick={()=>cancelOrder(order.id)}
className="text-red-500 text-xs mt-2">
Cancel Order
</button>
)}

</div>
))}
</div>

{/* 🚪 LOGOUT */}
<button onClick={async()=>{
  await signOut(auth);
  router.push("/");
}}
className="w-full bg-red-500 text-white py-3 rounded-xl">
Logout
</button>

</div>
</div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import {
  collection,
  query,
  where,
  doc,
  setDoc,
  getDoc,
  writeBatch,
  increment,
  onSnapshot
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

  const [editProfile,setEditProfile] = useState(false);
  const [editAddress,setEditAddress] = useState(false);

  const steps = ["Placed","Shipped","Out for Delivery","Delivered"];

  /* 🔥 SAFE ADDRESS FIX */
  const fixAddress = (addr:any)=>{
    try{
      if(typeof addr === "string") return addr;
      if(typeof addr === "object") return Object.values(addr).join("");
      return "";
    }catch{
      return "";
    }
  };

  /* 🔐 AUTH + DATA */
  useEffect(()=>{
    let unsubOrders:any;

    const unsubAuth = onAuthStateChanged(auth, async(u)=>{
      try{
        if(!u){
          router.push("/login");
          return;
        }

        setUser(u);

        const userRef = doc(db,"users",u.uid);
        const snap = await getDoc(userRef);

        if(!snap.exists()){
          const code =
            (u.email?.slice(0,4) || "USER").toUpperCase() +
            Math.floor(1000 + Math.random()*9000);

          await setDoc(userRef,{
            name:"",
            phone:"",
            address:"",
            wallet:0,
            referralCode:code
          });

          setReferralCode(code);
        }

        // 🔄 REALTIME USER
        onSnapshot(userRef,(snap)=>{
          if(snap.exists()){
            const d:any = snap.data() || {};
            setName(d.name || "");
            setPhone(d.phone || "");
            setAddress(d.address || "");
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

      }catch(err){
        console.log("🔥 PROFILE ERROR:", err);
        alert("Profile load error");
      }
    });

    return ()=>{
      unsubAuth();
      if(unsubOrders) unsubOrders();
    };

  },[]);

  /* 🔴 CANCEL */
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
      console.log("🔥 CANCEL ERROR:", err);
    }
  };

  /* 💾 SAVE */
  const saveProfile = async()=>{
    await setDoc(doc(db,"users",user.uid),{name,phone},{merge:true});
    setEditProfile(false);
  };

  const saveAddress = async()=>{
    await setDoc(doc(db,"users",user.uid),{
      address:{
        firstName:name,
        phone:phone,
        address:address
      }
    },{merge:true});
    setEditAddress(false);
  };

  const logout = async()=>{
    await signOut(auth);
    router.push("/");
  };

  /* 📦 STATUS */
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
    try{
      if(order?.total) return order.total;
      if(order?.totalAmount) return order.totalAmount;

      if(Array.isArray(order?.items)){
        return order.items.reduce((sum:number,i:any)=>
          sum + (Number(i?.sellPrice)||Number(i?.price)||0)
        ,0);
      }
      return 0;
    }catch{
      return 0;
    }
  };

  /* 📤 SHARE */
  const shareReferral = ()=>{
    const msg = `Join JembeeKart 💰 Use code: ${referralCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  if(loading) return <div className="p-5">Loading...</div>;
  if(!user) return <div className="p-5">User not found</div>;

  return(
<div className="min-h-screen bg-gray-100">

{/* 🔝 HEADER */}
<div className="bg-pink-600 text-white p-4 text-lg font-semibold">
My Account
</div>

<div className="p-4 space-y-4">

{/* 👤 PROFILE */}
<div className="bg-white p-4 rounded-xl shadow flex items-center gap-3">
<div className="w-12 h-12 bg-pink-500 text-white rounded-full flex items-center justify-center">
{user?.email?.charAt(0)?.toUpperCase()}
</div>

<div className="flex-1">
<p className="font-semibold">{name || "User"}</p>
<p className="text-xs text-gray-500">{user.email}</p>
</div>

<button onClick={()=>setEditProfile(!editProfile)}
className="text-pink-600 text-sm">
Edit
</button>
</div>

{/* 🏠 ADDRESS */}
<div className="bg-white p-4 rounded-xl shadow">
<p className="font-semibold mb-2">Delivery Address</p>
<p className="text-sm">{fixAddress(address) || "No address"}</p>

<button onClick={()=>setEditAddress(!editAddress)}
className="text-pink-600 text-sm mt-2">
Edit
</button>
</div>

{/* 💰 WALLET */}
<div className="bg-white p-4 rounded-xl shadow flex justify-between">
<p>Wallet</p>
<p className="text-green-600 font-bold">₹{wallet}</p>
</div>

{/* 🎁 REFERRAL */}
<div className="bg-white p-4 rounded-xl shadow">
<p className="text-sm">Referral Code</p>
<p className="font-bold">{referralCode}</p>

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

<p className="text-xs text-gray-500">
#{order.id.slice(0,8)}
</p>

{/* TRACK BAR */}
<div className="flex mt-2">
{steps.map((step,i)=>(
<div key={i} className="flex-1 text-center text-xs">
<div className={`h-2 ${
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
Cancel
</button>
)}

</div>
))}
</div>

<button onClick={logout}
className="w-full bg-red-500 text-white py-3 rounded-xl">
Logout
</button>

</div>
</div>
);
}

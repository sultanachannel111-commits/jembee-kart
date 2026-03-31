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

  // 🔐 AUTH + LOAD
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

        // ✅ CREATE USER IF NOT EXIST
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

        // ✅ REALTIME USER
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

        // ✅ REALTIME ORDERS
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

  // 🔴 CANCEL ORDER
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

  // 💾 SAVE
  const saveProfile = async()=>{
    await setDoc(doc(db,"users",user.uid),{name,phone},{merge:true});
    setEditProfile(false);
  };

  const saveAddress = async()=>{
    await setDoc(doc(db,"users",user.uid),{address},{merge:true});
    setEditAddress(false);
  };

  const logout = async()=>{
    await signOut(auth);
    router.push("/");
  };

  // 📦 STATUS FIX
  const getStep = (status:any)=>{
    if(!status) return 0;

    const clean = status.toLowerCase();

    const map:any = {
      "placed":0,
      "shipped":1,
      "out for delivery":2,
      "delivered":3
    };

    return map[clean] ?? 0;
  };

  // 💰 PRICE FIX
  const getPrice = (order:any)=>{
    return (
      order?.total ||
      order?.totalAmount ||
      order?.items?.reduce((sum:any,i:any)=>
        sum + (i.sellPrice || i.price || 0)
      ,0) ||
      0
    );
  };

  // 📤 SHARE
  const shareReferral = ()=>{
    const msg = `Join JembeeKart 💰 Use my code: ${referralCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  if(loading) return <div className="p-5">Loading...</div>;

  return(
<div className="min-h-screen bg-gray-100 p-4 space-y-4">

{/* 👤 PROFILE */}
<div className="bg-white p-4 rounded-xl shadow">

<div className="flex gap-3 items-center">

<div className="w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center text-xl font-bold">
{user?.email?.charAt(0)?.toUpperCase() || "U"}
</div>

<div className="flex-1">

{editProfile ? (
<>
<input value={name} onChange={e=>setName(e.target.value)}
className="w-full border p-2 rounded mb-2" placeholder="Name"/>

<input value={phone} onChange={e=>setPhone(e.target.value)}
className="w-full border p-2 rounded" placeholder="Phone"/>

<button onClick={saveProfile}
className="mt-2 bg-purple-600 text-white px-4 py-2 rounded">
Save
</button>
</>
):(
<>
<p className="font-bold">{name || "Jembee User"}</p>
<p className="text-sm text-gray-500">{user?.email}</p>

<button onClick={()=>setEditProfile(true)}
className="text-sm text-purple-600 mt-1">
Edit Profile
</button>
</>
)}

</div>

</div>

<div className="flex justify-between mt-4 text-center">

<div>
<p className="font-bold">{orders.length}</p>
<p className="text-xs text-gray-500">Orders</p>
</div>

<div>
<p className="font-bold text-green-600">₹{wallet}</p>
<p className="text-xs text-gray-500">Wallet</p>
</div>

</div>

<button onClick={logout}
className="mt-3 text-red-500 font-semibold">
Logout
</button>

</div>

{/* 🏠 ADDRESS */}
<div className="bg-white p-4 rounded-xl shadow">

<h3 className="font-semibold mb-2">Address</h3>

{editAddress ? (
<>
<textarea value={address}
onChange={e=>setAddress(e.target.value)}
className="w-full border p-2 rounded"/>

<button onClick={saveAddress}
className="mt-2 bg-green-500 text-white px-4 py-2 rounded">
Save
</button>
</>
):(
<>
<p className="text-sm">{address || "No address added"}</p>
<button onClick={()=>setEditAddress(true)}
className="text-sm text-purple-600 mt-1">
Edit
</button>
</>
)}

</div>

{/* 💰 WALLET */}
<div className="bg-white p-4 rounded-xl shadow">
<p className="text-sm text-gray-500">Wallet Balance</p>
<p className="text-xl font-bold text-green-600">₹{wallet}</p>
</div>

{/* 🎁 REFERRAL */}
<div className="bg-white p-4 rounded-xl shadow">

<p className="text-sm text-gray-500">Referral Code</p>
<p className="font-bold">{referralCode}</p>

<div className="flex gap-3 mt-2">

<button onClick={()=>{
navigator.clipboard.writeText(referralCode);
alert("Copied!");
}}
className="text-blue-600 text-sm">
Copy
</button>

<button onClick={shareReferral}
className="text-green-600 text-sm">
WhatsApp Share
</button>

</div>

</div>

{/* 📦 ORDERS */}
<div>

<h3 className="font-semibold mb-2">Orders</h3>

{orders.length === 0 && (
<p className="text-sm text-gray-500">No orders yet</p>
)}

{orders.map(order=>(
<div key={order.id}
className="bg-white p-4 rounded-xl shadow mb-3">

<p className="text-xs text-gray-500">
#{order.id?.slice(0,8)}
</p>

{/* TRACK */}
<div className="flex justify-between mt-2 text-xs">
{steps.map((step,i)=>(
<div key={i} className="flex-1 text-center">
<div className={`h-2 rounded ${
getStep(order?.status) >= i
? "bg-green-500"
: "bg-gray-300"
}`} />
<p>{step}</p>
</div>
))}
</div>

<p className="font-bold mt-2">
₹{getPrice(order)}
</p>

{order.status !== "Delivered" &&
order.status !== "Cancelled" && (
<button
onClick={()=>cancelOrder(order.id)}
className="text-red-500 text-xs mt-2">
Cancel
</button>
)}

</div>
))}

</div>

</div>
);
}

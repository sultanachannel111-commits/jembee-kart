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
  onSnapshot,
  addDoc
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";

export default function ProfilePage() {

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

  /* 🔥 AUTH + REALTIME */
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth, async(u)=>{
      if(!u){
        router.push("/login");
        return;
      }

      setUser(u);

      const userRef = doc(db,"users",u.uid);

      // 🔥 REALTIME USER
      onSnapshot(userRef,(snap)=>{
        if(snap.exists()){
          const d = snap.data();
          setName(d.name || "");
          setPhone(d.phone || "");
          setAddress(d.address || "");
          setWallet(d.wallet || 0);
          setReferralCode(d.referralCode || "");
        }
      });

      // 🔥 REALTIME ORDERS
      const q = query(collection(db,"orders"), where("userId","==",u.uid));

      onSnapshot(q,(snap)=>{
        setOrders(
          snap.docs.map(doc=>({
            id:doc.id,
            ...doc.data()
          }))
        );
      });

      setLoading(false);
    });

    return ()=>unsub();
  },[]);

  /* 💰 WALLET RECHARGE (CASHFREE) */
  const rechargeWallet = async(amount:number)=>{

    const res = await fetch("/api/cashfree/create-order",{
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body:JSON.stringify({
        orderId:"wallet_"+Date.now(),
        amount,
        customer:{ phone, name }
      })
    });

    const data = await res.json();
    const cashfree = await load({ mode:"production" });

    await cashfree.checkout({
      paymentSessionId:data.payment_session_id,
      redirectTarget:"_self"
    });

    // ✅ after success add wallet
    await setDoc(doc(db,"users",user.uid),{
      wallet: increment(amount)
    },{merge:true});

    await addDoc(collection(db,"walletTransactions"),{
      userId:user.uid,
      amount,
      type:"credit",
      createdAt:new Date()
    });

    alert("Wallet recharged 🎉");
  };

  /* 🎁 WHATSAPP SHARE */
  const shareReferral = ()=>{
    const msg = `🔥 Join JembeeKart & earn money!\nUse my code: ${referralCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  /* 🔴 CANCEL ORDER */
  const cancelOrder = async(orderId:string)=>{
    const ref = doc(db,"orders",orderId);
    const snap = await getDoc(ref);
    if(!snap.exists()) return;

    const data = snap.data();
    const batch = writeBatch(db);

    batch.update(ref,{status:"Cancelled"});

    for(const item of data.items || []){
      batch.update(doc(db,"products",item.productId),{
        stock: increment(item.quantity)
      });
    }

    await batch.commit();
  };

  /* 💾 SAVE */
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

  /* 📦 TRACK */
  const getStep = (status:any)=>{
    const steps = ["Placed","Shipped","Out for Delivery","Delivered"];
    return steps.indexOf(status);
  };

  if(loading) return <div className="p-5">Loading...</div>;

  return(
<div className="min-h-screen bg-gray-100 p-4 space-y-4">

{/* PROFILE */}
<div className="bg-white p-4 rounded-xl shadow">

<div className="flex gap-3 items-center">

<div className="w-14 h-14 bg-purple-500 text-white flex items-center justify-center rounded-full text-xl">
{user?.email?.charAt(0).toUpperCase()}
</div>

<div className="flex-1">

{editProfile ? (
<>
<input value={name} onChange={(e)=>setName(e.target.value)}
className="w-full border p-2 rounded mb-2"/>

<input value={phone} onChange={(e)=>setPhone(e.target.value)}
className="w-full border p-2 rounded"/>

<button onClick={saveProfile}
className="mt-2 bg-purple-600 text-white px-4 py-2 rounded">
Save
</button>
</>
):(
<>
<p className="font-bold">{name || "User"}</p>
<p className="text-sm">{user.email}</p>

<button onClick={()=>setEditProfile(true)}
className="text-purple-600 text-sm">
Edit
</button>
</>
)}

</div>

</div>

<div className="flex justify-between mt-4">

<div>
<p className="font-bold">{orders.length}</p>
<p className="text-xs">Orders</p>
</div>

<div>
<p className="font-bold text-green-600">₹{wallet}</p>
<p className="text-xs">Wallet</p>
</div>

</div>

<button onClick={logout}
className="text-red-500 mt-3">
Logout
</button>

</div>

{/* WALLET */}
<div className="bg-white p-4 rounded-xl shadow">

<p className="font-semibold">Wallet ₹{wallet}</p>

<div className="flex gap-2 mt-3">
<button onClick={()=>rechargeWallet(100)} className="bg-green-500 text-white px-3 py-1 rounded">+100</button>
<button onClick={()=>rechargeWallet(500)} className="bg-green-500 text-white px-3 py-1 rounded">+500</button>
<button onClick={()=>rechargeWallet(1000)} className="bg-green-500 text-white px-3 py-1 rounded">+1000</button>
</div>

</div>

{/* REFERRAL */}
<div className="bg-white p-4 rounded-xl shadow">

<p className="text-sm">Referral Code</p>
<p className="font-bold">{referralCode}</p>

<div className="flex gap-3 mt-2">
<button onClick={shareReferral} className="text-green-600">Share WhatsApp</button>
<button onClick={()=>navigator.clipboard.writeText(referralCode)}>Copy</button>
</div>

</div>

{/* ADDRESS */}
<div className="bg-white p-4 rounded-xl shadow">

{editAddress ? (
<>
<textarea value={address} onChange={(e)=>setAddress(e.target.value)}
className="w-full border p-2"/>

<button onClick={saveAddress} className="bg-green-500 text-white px-3 py-1 mt-2 rounded">
Save
</button>
</>
):(
<>
<p>{address || "No address"}</p>
<button onClick={()=>setEditAddress(true)} className="text-blue-600 text-sm">Edit</button>
</>
)}

</div>

{/* ORDERS */}
<div>

<h3 className="font-bold mb-2">Orders</h3>

{orders.map(order=>(
<div key={order.id} className="bg-white p-4 rounded-xl shadow mb-3">

<p className="text-xs">#{order.id.slice(0,8)}</p>

{/* TRACK */}
<div className="flex text-xs mt-2">
{["Placed","Shipped","Out for Delivery","Delivered"].map((step,i)=>(
<div key={i} className="flex-1 text-center">
<div className={`h-2 ${getStep(order.status)>=i ? "bg-green-500":"bg-gray-300"}`} />
<p>{step}</p>
</div>
))}
</div>

<p className="font-bold mt-2">₹{order.total}</p>

{order.status !== "Delivered" && order.status !== "Cancelled" && (
<button onClick={()=>cancelOrder(order.id)} className="text-red-500 text-xs mt-2">
Cancel
</button>
)}

</div>
))}

</div>

</div>
);
}

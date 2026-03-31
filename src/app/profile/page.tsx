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

  /* 🔥 GLOBAL ERROR TRACK */
  useEffect(() => {
    window.onerror = function (msg, url, line, col, error) {
      console.log("🔥 GLOBAL ERROR:", { msg, url, line, col, error });
      alert("Error: " + msg);
    };

    window.onunhandledrejection = function (event) {
      console.log("🔥 PROMISE ERROR:", event.reason);
      alert("Promise Error: " + event.reason);
    };
  }, []);

  /* 🔐 AUTH + DATA */
  useEffect(()=>{
    let unsubOrders:any;

    const unsubAuth = onAuthStateChanged(auth, async(u)=>{
      try{

        console.log("👤 USER:", u);

        if(!u){
          router.push("/login");
          return;
        }

        setUser(u);

        const userRef = doc(db,"users",u.uid);
        const snap = await getDoc(userRef);

        console.log("📄 USER DOC:", snap.exists(), snap.data());

        // ✅ CREATE USER
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
            console.log("👤 REALTIME USER:", d);

            setName(d.name || "");
            setPhone(d.phone || "");
            setAddress(d.address || "");
            setWallet(d.wallet || 0);
            setReferralCode(d.referralCode || "");
          }
        });

        // ✅ ORDERS
        const q = query(
          collection(db,"orders"),
          where("userId","==",u.uid)
        );

        unsubOrders = onSnapshot(q,(snap)=>{
          const arr:any[] = [];

          snap.forEach(doc=>{
            arr.push({ id:doc.id, ...doc.data() });
          });

          console.log("📦 ORDERS:", arr);

          setOrders(arr);
          setLoading(false);
        });

      }catch(err){
        console.log("🔥 AUTH ERROR:", err);
        alert("Auth error");
      }
    });

    return ()=>{
      unsubAuth();
      if(unsubOrders) unsubOrders();
    };

  },[]);

  /* 🔴 CANCEL ORDER */
  const cancelOrder = async(id:string)=>{
    try{

      const ref = doc(db,"orders",id);
      const snap = await getDoc(ref);

      if(!snap.exists()) return;

      const data:any = snap.data();
      console.log("❌ CANCEL DATA:", data);

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
    await setDoc(doc(db,"users",user.uid),{address},{merge:true});
    setEditAddress(false);
  };

  const logout = async()=>{
    await signOut(auth);
    router.push("/");
  };

  /* 📦 STATUS */
  const steps = ["Placed","Shipped","Out for Delivery","Delivered"];
  const getStep = (status:any)=> steps.indexOf(status);

  const shareReferral = ()=>{
    const msg = `Join JembeeKart 💰 Code: ${referralCode}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`);
  };

  if(loading) return <div className="p-5">Loading...</div>;
  if(!user) return <div>Loading user...</div>;

  return(
<div className="min-h-screen bg-gray-100 p-4 space-y-4">

{/* PROFILE */}
<div className="bg-white p-4 rounded-xl shadow">

<div className="flex gap-3 items-center">

<div className="w-14 h-14 rounded-full bg-purple-600 text-white flex items-center justify-center text-xl font-bold">
{user?.email?.charAt(0)?.toUpperCase() || "U"}
</div>

<div className="flex-1">

<p className="font-bold">{name || "Jembee User"}</p>
<p className="text-sm text-gray-500">{user?.email}</p>

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

{/* ORDERS */}
<div>
<h3 className="font-semibold mb-2">Orders</h3>

{orders.map(order=>(
<div key={order.id}
className="bg-white p-4 rounded-xl shadow mb-3">

<p className="text-xs text-gray-500">
#{order.id?.slice(0,8)}
</p>

<div className="flex justify-between mt-2 text-xs">
{steps.map((step,i)=>(
<div key={i} className="flex-1 text-center">
<div className={`h-2 ${
getStep(order?.status) >= i
? "bg-green-500"
: "bg-gray-300"
}`} />
<p>{step}</p>
</div>
))}
</div>

<p className="font-bold mt-2">
₹{order?.total || order?.totalAmount || 0}
</p>

</div>
))}

</div>

{/* 🔥 DEBUG PANEL */}
<div style={{
position:"fixed",
bottom:0,
left:0,
right:0,
background:"black",
color:"white",
padding:"10px",
fontSize:"10px",
maxHeight:"200px",
overflow:"auto",
zIndex:9999
}}>
<pre>
{JSON.stringify({
user:user?.email,
orders:orders.length,
wallet,
referralCode,
firstOrder:orders[0] || null
},null,2)}
</pre>
</div>

</div>
);
}

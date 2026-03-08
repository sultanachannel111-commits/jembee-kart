"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

import Link from "next/link";
import {
LayoutDashboard,
Package,
ShoppingCart,
Box,
DollarSign,
Wallet,
Star,
BarChart,
MessageSquare,
Megaphone,
Tag,
Bell,
User,
Settings,
Trophy
} from "lucide-react";

export default function SellerLayout({ children }: any){

const router = useRouter();
const [loading,setLoading] = useState(true);

useEffect(()=>{

const unsub = onAuthStateChanged(auth, async (user)=>{

if(!user){
router.push("/seller/login");
return;
}

const snap = await getDoc(
doc(db,"users",user.uid)
);

if(!snap.exists()){
router.push("/");
return;
}

const data:any = snap.data();

if(data.role !== "seller"){
router.push("/");
return;
}

setLoading(false);

});

return ()=>unsub();

},[]);

if(loading){
return(
<div className="flex items-center justify-center h-screen">
<p className="text-gray-500">Checking seller login...</p>
</div>
)
}

return(

<div className="flex min-h-screen bg-gray-100">

{/* SIDEBAR */}

<div className="w-64 bg-white shadow-lg p-5 space-y-3">

<h2 className="text-2xl font-bold mb-6">
Seller Panel
</h2>

<Link href="/seller/dashboard" className="flex gap-2">
<LayoutDashboard size={18}/> Dashboard
</Link>

<Link href="/seller/add-product" className="flex gap-2">
<Package size={18}/> Add Product
</Link>

<Link href="/seller/products" className="flex gap-2">
<Box size={18}/> Products
</Link>

<Link href="/seller/orders" className="flex gap-2">
<ShoppingCart size={18}/> Orders
</Link>

<Link href="/seller/inventory" className="flex gap-2">
<Box size={18}/> Inventory
</Link>

<Link href="/seller/earnings" className="flex gap-2">
<DollarSign size={18}/> Earnings
</Link>

<Link href="/seller/withdraw" className="flex gap-2">
<Wallet size={18}/> Withdraw
</Link>

<Link href="/seller/reviews" className="flex gap-2">
<Star size={18}/> Reviews
</Link>

<Link href="/seller/analytics" className="flex gap-2">
<BarChart size={18}/> Analytics
</Link>

<Link href="/seller/messages" className="flex gap-2">
<MessageSquare size={18}/> Messages
</Link>

<Link href="/seller/promotions" className="flex gap-2">
<Megaphone size={18}/> Promotions
</Link>

<Link href="/seller/coupons" className="flex gap-2">
<Tag size={18}/> Coupons
</Link>

<Link href="/seller/notifications" className="flex gap-2">
<Bell size={18}/> Notifications
</Link>

<Link href="/seller/profile" className="flex gap-2">
<User size={18}/> Profile
</Link>

<Link href="/seller/settings" className="flex gap-2">
<Settings size={18}/> Settings
</Link>

<Link href="/seller/ranking" className="flex gap-2">
<Trophy size={18}/> Ranking
</Link>

</div>

{/* MAIN */}

<div className="flex-1 p-6">

{children}

</div>

</div>

);

}

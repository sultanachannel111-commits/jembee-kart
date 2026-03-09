"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Sidebar() {

const handleLogout = async () => {
await signOut(auth);
};

return (

<div className="w-64 bg-white h-screen p-4 border-r">

<h2 className="text-xl font-bold mb-6">
Seller Panel
</h2>

<ul className="space-y-3">

<li>
<Link href="/seller/dashboard">
Dashboard
</Link>
</li>

<li>
<Link href="/seller/add-product">
Add Product
</Link>
</li>

<li>
<Link href="/seller/products">
My Products
</Link>
</li>

<li>
<Link href="/seller/orders">
Orders
</Link>
</li>

<li>
<Link href="/seller/inventory">
Inventory
</Link>
</li>

<li>
<Link href="/seller/earnings">
Earnings
</Link>
</li>

<li>
<Link href="/seller/withdraw">
Withdraw
</Link>
</li>

<li>
<Link href="/seller/kyc">
KYC Verification
</Link>
</li>

<li>
<Link href="/seller/reviews">
Reviews
</Link>
</li>

<li>
<Link href="/seller/analytics">
Analytics
</Link>
</li>

<li>
<Link href="/seller/messages">
Messages
</Link>
</li>

<li>
<Link href="/seller/promotions">
Promotions
</Link>
</li>

<li>
<Link href="/seller/coupons">
Coupons
</Link>
</li>

<li>
<Link href="/seller/notifications">
Notifications
</Link>
</li>

<li>
<Link href="/seller/profile">
Profile
</Link>
</li>

<li>
<Link href="/seller/settings">
Settings
</Link>
</li>

<li>
<Link href="/seller/ranking">
Ranking
</Link>
</li>

<li>
<button
onClick={handleLogout}
className="text-red-500"
>
Logout
</button>
</li>

</ul>

</div>

);

}

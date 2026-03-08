"use client";

import Link from "next/link";
import {
Package,
ShoppingCart,
DollarSign,
BarChart,
MessageCircle,
Star
} from "lucide-react";

export default function SellerDashboard(){

return(

<div className="p-6">

<h1 className="text-3xl font-bold mb-8">
Seller Dashboard
</h1>

<div className="grid md:grid-cols-3 gap-6">

<Link href="/seller/add-product">

<div className="bg-white p-6 rounded-xl shadow">

<Package className="mb-2 text-purple-600"/>

<h3 className="font-bold">
Add Product
</h3>

</div>

</Link>


<Link href="/seller/my-products">

<div className="bg-white p-6 rounded-xl shadow">

<Package className="mb-2 text-blue-600"/>

<h3 className="font-bold">
My Products
</h3>

</div>

</Link>


<Link href="/seller/orders">

<div className="bg-white p-6 rounded-xl shadow">

<ShoppingCart className="mb-2 text-green-600"/>

<h3 className="font-bold">
Orders
</h3>

</div>

</Link>


<Link href="/seller/earnings">

<div className="bg-white p-6 rounded-xl shadow">

<DollarSign className="mb-2 text-green-700"/>

<h3 className="font-bold">
Earnings
</h3>

</div>

</Link>


<Link href="/seller/analytics">

<div className="bg-white p-6 rounded-xl shadow">

<BarChart className="mb-2 text-indigo-600"/>

<h3 className="font-bold">
Analytics
</h3>

</div>

</Link>


<Link href="/seller/messages">

<div className="bg-white p-6 rounded-xl shadow">

<MessageCircle className="mb-2 text-pink-600"/>

<h3 className="font-bold">
Messages
</h3>

</div>

</Link>


<Link href="/seller/reviews">

<div className="bg-white p-6 rounded-xl shadow">

<Star className="mb-2 text-yellow-500"/>

<h3 className="font-bold">
Reviews
</h3>

</div>

</Link>

</div>

</div>

);

}

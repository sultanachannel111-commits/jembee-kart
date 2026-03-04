"use client";

export default function SellerDashboard(){

return(

<div className="space-y-6"><h1 className="text-2xl font-bold">
Seller Dashboard
</h1><div className="grid grid-cols-2 gap-4"><div className="bg-white p-4 rounded shadow">
<p>Total Orders</p>
<h2 className="text-xl font-bold">0</h2>
</div><div className="bg-white p-4 rounded shadow">
<p>Revenue</p>
<h2 className="text-xl font-bold">₹0</h2>
</div><div className="bg-white p-4 rounded shadow">
<p>Products</p>
<h2 className="text-xl font-bold">0</h2>
</div><div className="bg-white p-4 rounded shadow">
<p>Pending Orders</p>
<h2 className="text-xl font-bold">0</h2>
</div></div></div>)

}

"use client";

export default function SellerDashboard(){

return(

<div>

<h1 className="text-3xl font-bold mb-6">
Seller Dashboard
</h1>

<div className="grid md:grid-cols-4 gap-4">

<div className="bg-white shadow rounded-xl p-4">
<p className="text-gray-500">Total Orders</p>
<h2 className="text-2xl font-bold">0</h2>
</div>

<div className="bg-white shadow rounded-xl p-4">
<p className="text-gray-500">Products</p>
<h2 className="text-2xl font-bold">0</h2>
</div>

<div className="bg-white shadow rounded-xl p-4">
<p className="text-gray-500">Revenue</p>
<h2 className="text-2xl font-bold">₹0</h2>
</div>

<div className="bg-white shadow rounded-xl p-4">
<p className="text-gray-500">Pending Orders</p>
<h2 className="text-2xl font-bold">0</h2>
</div>

</div>

</div>

)

}

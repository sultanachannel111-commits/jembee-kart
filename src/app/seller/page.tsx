"use client";

export default function SellerPage() {

return (

<div className="p-6"><h1 className="text-2xl font-bold mb-6">
Seller Dashboard
</h1><div className="grid grid-cols-2 gap-4"><div className="bg-white p-4 rounded shadow">
<p className="text-gray-500">Total Orders</p>
<h2 className="text-xl font-bold">0</h2>
</div><div className="bg-white p-4 rounded shadow">
<p className="text-gray-500">Revenue</p>
<h2 className="text-xl font-bold">₹0</h2>
</div><div className="bg-white p-4 rounded shadow">
<p className="text-gray-500">Products</p>
<h2 className="text-xl font-bold">0</h2>
</div><div className="bg-white p-4 rounded shadow">
<p className="text-gray-500">Pending Orders</p>
<h2 className="text-xl font-bold">0</h2>
</div></div></div>);

}

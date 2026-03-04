"use client";

import { useState } from "react";
import { Menu, Bell, User } from "lucide-react";

export default function SellerLayout({
children,
}: {
children: React.ReactNode;
}) {

const [open,setOpen] = useState(true);

return (

  <div className="flex min-h-screen bg-gray-100">{/* Sidebar */}

<div className={`bg-black text-white transition-all duration-300 
${open ? "w-64" : "w-16"} p-5`}>

  <button onClick={()=>setOpen(!open)} className="mb-6">
    <Menu/>
  </button>

  {open && (
    <h2 className="text-xl font-bold text-pink-500 mb-6">
      Seller Panel
    </h2>
  )}

  <nav className="flex flex-col space-y-4">

    <a href="/seller">Dashboard</a>
    <a href="/seller/add-product">Add Product</a>
    <a href="/seller/products">Products</a>
    <a href="/seller/orders">Orders</a>
    <a href="/seller/revenue">Revenue</a>
    <a href="/seller/account">Account</a>

  </nav>

</div>

{/* Main */}

<div className="flex-1 flex flex-col">

  {/* Top bar */}

  <div className="bg-white shadow p-4 flex justify-between items-center">

    <h1 className="font-bold text-lg">
      JembeeKart Seller
    </h1>

    <div className="flex gap-4 items-center">
      <Bell/>
      <User/>
    </div>

  </div>

  {/* Page Content */}

  <div className="p-6">
    {children}
  </div>

</div>

  </div>);
}

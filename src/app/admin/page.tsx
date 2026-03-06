"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Package, Users, ShoppingCart, Store } from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function AdminDashboard() {

  const [stats,setStats] = useState({
    products:0,
    orders:0,
    users:0,
    sellers:0
  });

  useEffect(()=>{
    loadStats();
  },[]);

  async function loadStats(){

    const productSnap = await getDocs(collection(db,"products"));
    const orderSnap = await getDocs(collection(db,"orders"));
    const userSnap = await getDocs(collection(db,"users"));

    let sellerCount = 0;

    userSnap.docs.forEach(doc=>{
      const d:any = doc.data();
      if(d.role==="seller"){
        sellerCount++;
      }
    });

    setStats({
      products:productSnap.size,
      orders:orderSnap.size,
      users:userSnap.size,
      sellers:sellerCount
    });

  }

  return (

    <div className="p-6 bg-gray-100 min-h-screen">

      {/* TITLE */}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">
          JembeeKart Admin
        </h1>
        <p className="text-gray-500">
          Manage your ecommerce store
        </p>
      </div>


      {/* STATS */}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">

        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <Package className="text-purple-600"/>
          <div>
            <p className="text-gray-500 text-sm">Products</p>
            <h2 className="text-xl font-bold">{stats.products}</h2>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <ShoppingCart className="text-green-600"/>
          <div>
            <p className="text-gray-500 text-sm">Orders</p>
            <h2 className="text-xl font-bold">{stats.orders}</h2>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <Users className="text-blue-600"/>
          <div>
            <p className="text-gray-500 text-sm">Users</p>
            <h2 className="text-xl font-bold">{stats.users}</h2>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 flex items-center gap-4">
          <Store className="text-orange-600"/>
          <div>
            <p className="text-gray-500 text-sm">Sellers</p>
            <h2 className="text-xl font-bold">{stats.sellers}</h2>
          </div>
        </div>

      </div>


      {/* QUICK ACTIONS */}

      <div className="grid md:grid-cols-3 gap-6">

        <Link
          href="/admin/products"
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition block"
        >
          <Package className="mb-3 text-purple-600"/>
          <h3 className="font-bold text-lg">Manage Products</h3>
          <p className="text-sm text-gray-500">
            Add, edit or delete products
          </p>
        </Link>

        <Link
          href="/admin/orders"
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition block"
        >
          <ShoppingCart className="mb-3 text-green-600"/>
          <h3 className="font-bold text-lg">Manage Orders</h3>
          <p className="text-sm text-gray-500">
            View and update order status
          </p>
        </Link>

        <Link
          href="/admin/categories"
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition block"
        >
          <Package className="mb-3 text-blue-600"/>
          <h3 className="font-bold text-lg">Manage Categories</h3>
          <p className="text-sm text-gray-500">
            Create and manage categories
          </p>
        </Link>

        <Link
          href="/admin/banners"
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition block"
        >
          <Package className="mb-3 text-pink-600"/>
          <h3 className="font-bold text-lg">Home Banners</h3>
          <p className="text-sm text-gray-500">
            Control homepage banners
          </p>
        </Link>

        <Link
          href="/admin/festival"
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition block"
        >
          <Package className="mb-3 text-yellow-600"/>
          <h3 className="font-bold text-lg">Festival Banner</h3>
          <p className="text-sm text-gray-500">
            Manage festival promotions
          </p>
        </Link>

        <Link
          href="/admin/sellers"
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition block"
        >
          <Users className="mb-3 text-orange-600"/>
          <h3 className="font-bold text-lg">Sellers</h3>
          <p className="text-sm text-gray-500">
            Approve or block sellers
          </p>
        </Link>

      </div>

    </div>

  );

}

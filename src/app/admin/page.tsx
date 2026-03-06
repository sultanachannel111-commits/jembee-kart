"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  Tag,
  Store,
} from "lucide-react";

export default function AdminDashboard() {

  const [stats,setStats] = useState({
    products:0,
    orders:0,
    users:0,
    sellers:0
  });

  useEffect(()=>{

    // future me yaha firestore service connect hogi
    // abhi dummy data

    setStats({
      products:120,
      orders:85,
      users:320,
      sellers:25
    });

  },[]);

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


      {/* STATS CARDS */}

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

        <Link href="/admin/products">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer">
            <Package className="mb-3 text-purple-600"/>
            <h3 className="font-bold text-lg">Manage Products</h3>
            <p className="text-sm text-gray-500">
              Add, edit or delete products
            </p>
          </div>
        </Link>

        <Link href="/admin/orders">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer">
            <ShoppingCart className="mb-3 text-green-600"/>
            <h3 className="font-bold text-lg">Manage Orders</h3>
            <p className="text-sm text-gray-500">
              View and update order status
            </p>
          </div>
        </Link>

        <Link href="/admin/categories">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer">
            <Tag className="mb-3 text-blue-600"/>
            <h3 className="font-bold text-lg">Manage Categories</h3>
            <p className="text-sm text-gray-500">
              Create and manage categories
            </p>
          </div>
        </Link>

        <Link href="/admin/banners">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer">
            <Tag className="mb-3 text-pink-600"/>
            <h3 className="font-bold text-lg">Home Banners</h3>
            <p className="text-sm text-gray-500">
              Control homepage banners
            </p>
          </div>
        </Link>

        <Link href="/admin/festival">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer">
            <Tag className="mb-3 text-yellow-600"/>
            <h3 className="font-bold text-lg">Festival Banner</h3>
            <p className="text-sm text-gray-500">
              Manage festival promotions
            </p>
          </div>
        </Link>

        <Link href="/admin/sellers">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition cursor-pointer">
            <Users className="mb-3 text-orange-600"/>
            <h3 className="font-bold text-lg">Sellers</h3>
            <p className="text-sm text-gray-500">
              Approve or block sellers
            </p>
          </div>
        </Link>

      </div>


      {/* RECENT ORDERS */}

      <div className="mt-12 bg-white rounded-xl shadow p-6">

        <h2 className="text-xl font-bold mb-4">
          Recent Orders
        </h2>

        <table className="w-full text-sm">

          <thead className="border-b">
            <tr className="text-left">
              <th className="py-2">Order ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>

            <tr className="border-b">
              <td className="py-2">#JB1022</td>
              <td>Rahul</td>
              <td>₹799</td>
              <td className="text-green-600">Delivered</td>
            </tr>

            <tr className="border-b">
              <td className="py-2">#JB1023</td>
              <td>Ali</td>
              <td>₹599</td>
              <td className="text-yellow-600">Processing</td>
            </tr>

            <tr>
              <td className="py-2">#JB1024</td>
              <td>Sara</td>
              <td>₹999</td>
              <td className="text-red-500">Pending</td>
            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );

}

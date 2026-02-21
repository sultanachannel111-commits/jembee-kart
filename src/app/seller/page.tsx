"use client";

import { Package, ShoppingCart, DollarSign } from "lucide-react";

export default function SellerDashboard() {
  return (
    <div className="animate-fadeIn">

      <h1 className="text-3xl font-bold mb-8 text-brand-pink">
        Seller Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-6">

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Products</p>
              <h2 className="text-2xl font-bold mt-2">12</h2>
            </div>
            <Package className="text-brand-pink" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Orders</p>
              <h2 className="text-2xl font-bold mt-2">48</h2>
            </div>
            <ShoppingCart className="text-brand-pink" size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500">Total Revenue</p>
              <h2 className="text-2xl font-bold mt-2">₹ 24,500</h2>
            </div>
            <DollarSign className="text-brand-pink" size={32} />
          </div>
        </div>

      </div>
    </div>
  );
}

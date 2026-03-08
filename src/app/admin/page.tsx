"use client";

import Link from "next/link";

import {
Package,
ShoppingCart,
Users,
Store,
Tag,
Image,
Gift,
Settings,
Bell,
Truck,
RefreshCcw,
HelpCircle,
Monitor,
DollarSign,
Flame,
Cpu,
Bug,
Palette,
Sparkles,
Home
} from "lucide-react";

export default function AdminDashboard(){

return(

<div className="p-8 bg-gray-100 min-h-screen">

<h1 className="text-4xl font-bold mb-10">
JembeeKart Admin Panel
</h1>


<div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">


{/* PRODUCTS */}

<Link href="/admin/products">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Package className="text-purple-600 mb-2"/>
<h3 className="font-bold">Products</h3>
<p className="text-sm text-gray-500">Manage products</p>
</div>
</Link>


{/* ADD QIKINK PRODUCTS */}

<Link href="/admin/qikink-products">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Package className="text-purple-700 mb-2"/>
<h3 className="font-bold">Add Qikink Product</h3>
<p className="text-sm text-gray-500">Add POD product</p>
</div>
</Link>


{/* ORDERS */}

<Link href="/admin/orders">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<ShoppingCart className="text-green-600 mb-2"/>
<h3 className="font-bold">Orders</h3>
<p className="text-sm text-gray-500">Manage orders</p>
</div>
</Link>


{/* USERS */}

<Link href="/admin/users">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Users className="text-blue-600 mb-2"/>
<h3 className="font-bold">Users</h3>
<p className="text-sm text-gray-500">Manage users</p>
</div>
</Link>


{/* SELLERS */}

<Link href="/admin/sellers">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Store className="text-orange-600 mb-2"/>
<h3 className="font-bold">Sellers</h3>
<p className="text-sm text-gray-500">Manage sellers</p>
</div>
</Link>


{/* CATEGORIES */}

<Link href="/admin/categories">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Tag className="text-indigo-600 mb-2"/>
<h3 className="font-bold">Categories</h3>
<p className="text-sm text-gray-500">Manage categories</p>
</div>
</Link>


{/* BANNERS */}

<Link href="/admin/banners">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Image className="text-pink-600 mb-2"/>
<h3 className="font-bold">Banners</h3>
<p className="text-sm text-gray-500">Homepage banners</p>
</div>
</Link>


{/* HOMEPAGE */}

<Link href="/admin/homepage">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Home className="text-blue-500 mb-2"/>
<h3 className="font-bold">Homepage</h3>
<p className="text-sm text-gray-500">Edit homepage layout</p>
</div>
</Link>


{/* OFFERS */}

<Link href="/admin/offers">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Tag className="text-red-500 mb-2"/>
<h3 className="font-bold">Offers</h3>
<p className="text-sm text-gray-500">Discount offers</p>
</div>
</Link>


{/* AI OFFERS */}

<Link href="/admin/ai-offers">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Sparkles className="text-purple-500 mb-2"/>
<h3 className="font-bold">AI Offers</h3>
<p className="text-sm text-gray-500">AI generated offers</p>
</div>
</Link>


{/* FLASH SALE */}

<Link href="/admin/flash-sale">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Flame className="text-red-500 mb-2"/>
<h3 className="font-bold">Flash Sale</h3>
<p className="text-sm text-gray-500">Flash sale control</p>
</div>
</Link>


{/* FESTIVAL */}

<Link href="/admin/festival">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Gift className="text-yellow-600 mb-2"/>
<h3 className="font-bold">Festival Banner</h3>
<p className="text-sm text-gray-500">Festival promotions</p>
</div>
</Link>


{/* PAYMENTS */}

<Link href="/admin/payments">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<DollarSign className="text-green-600 mb-2"/>
<h3 className="font-bold">Payments</h3>
<p className="text-sm text-gray-500">Manage payments</p>
</div>
</Link>


{/* RETURNS */}

<Link href="/admin/returns">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<RefreshCcw className="text-red-600 mb-2"/>
<h3 className="font-bold">Returns</h3>
<p className="text-sm text-gray-500">Manage returns</p>
</div>
</Link>


{/* CUSTOMER QUESTIONS */}

<Link href="/admin/questions">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<HelpCircle className="text-blue-500 mb-2"/>
<h3 className="font-bold">Customer Questions</h3>
<p className="text-sm text-gray-500">Customer support</p>
</div>
</Link>


{/* NOTIFICATIONS */}

<Link href="/admin/notifications">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Bell className="text-orange-500 mb-2"/>
<h3 className="font-bold">Notifications</h3>
<p className="text-sm text-gray-500">Admin alerts</p>
</div>
</Link>


{/* QIKINK ORDERS */}

<Link href="/admin/qikink">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Truck className="text-purple-600 mb-2"/>
<h3 className="font-bold">Qikink Orders</h3>
<p className="text-sm text-gray-500">Print on demand</p>
</div>
</Link>


{/* QIKINK TEST */}

<Link href="/admin/qikink-test">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Truck className="text-gray-600 mb-2"/>
<h3 className="font-bold">Qikink Test</h3>
<p className="text-sm text-gray-500">API testing</p>
</div>
</Link>


{/* SYSTEM */}

<Link href="/admin/system">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Cpu className="text-gray-700 mb-2"/>
<h3 className="font-bold">System</h3>
<p className="text-sm text-gray-500">System control</p>
</div>
</Link>


{/* DEBUG */}

<Link href="/admin/debug">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Bug className="text-red-600 mb-2"/>
<h3 className="font-bold">Debug</h3>
<p className="text-sm text-gray-500">Debug tools</p>
</div>
</Link>


{/* DIAGNOSTICS */}

<Link href="/admin/diagnostics">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Monitor className="text-gray-600 mb-2"/>
<h3 className="font-bold">Diagnostics</h3>
<p className="text-sm text-gray-500">System diagnostics</p>
</div>
</Link>


{/* THEME */}

<Link href="/admin/theme">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Palette className="text-pink-500 mb-2"/>
<h3 className="font-bold">Theme</h3>
<p className="text-sm text-gray-500">Change theme</p>
</div>
</Link>


{/* SETTINGS */}

<Link href="/admin/settings">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Settings className="text-gray-700 mb-2"/>
<h3 className="font-bold">Settings</h3>
<p className="text-sm text-gray-500">System settings</p>
</div>
</Link>

{/* DATABASE CONTROL */}

<Link href="/admin/database">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">

<h3 className="font-bold">Database Control</h3>

<p className="text-sm text-gray-500">
View edit delete firestore data
</p>

</div>
</Link>
  
</div>

</div>

);

}

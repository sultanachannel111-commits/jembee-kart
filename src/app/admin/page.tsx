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
Flame
} from "lucide-react";

export default function AdminDashboard(){

return(

<div className="p-6">

<h1 className="text-3xl font-bold mb-8">
JembeeKart Admin
</h1>


<div className="grid md:grid-cols-3 gap-6">


{/* PRODUCTS */}

<Link href="/admin/products">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Package className="text-purple-600 mb-2"/>
<h3 className="font-bold">Products</h3>
<p className="text-sm text-gray-500">
Manage products
</p>
</div>
</Link>


{/* ADD PRODUCT */}

<Link href="/admin/products/add">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Package className="text-purple-700 mb-2"/>
<h3 className="font-bold">Add Product</h3>
<p className="text-sm text-gray-500">
Add new Qikink product
</p>
</div>
</Link>
  

{/* ORDERS */}

<Link href="/admin/orders">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<ShoppingCart className="text-green-600 mb-2"/>
<h3 className="font-bold">Orders</h3>
<p className="text-sm text-gray-500">
Manage orders
</p>
</div>
</Link>
  

{/* FLASH SALE */}

<Link href="/admin/flash-sale">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">

<Flame className="text-red-500 mb-2"/>

<h3 className="font-bold">
Flash Sale
</h3>

<p className="text-sm text-gray-500">
Control flash sale timer
</p>

</div>
</Link>


{/* USERS */}

<Link href="/admin/users">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Users className="text-blue-600 mb-2"/>
<h3 className="font-bold">Users</h3>
<p className="text-sm text-gray-500">
Manage users
</p>
</div>
</Link>


{/* SELLERS */}

<Link href="/admin/sellers">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Store className="text-orange-600 mb-2"/>
<h3 className="font-bold">Sellers</h3>
<p className="text-sm text-gray-500">
Manage sellers
</p>
</div>
</Link>


{/* CATEGORIES */}

<Link href="/admin/categories">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Tag className="text-indigo-600 mb-2"/>
<h3 className="font-bold">Categories</h3>
<p className="text-sm text-gray-500">
Manage categories
</p>
</div>
</Link>


{/* BANNERS */}

<Link href="/admin/banners">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Image className="text-pink-600 mb-2"/>
<h3 className="font-bold">Banners</h3>
<p className="text-sm text-gray-500">
Homepage banners
</p>
</div>
</Link>


{/* FESTIVAL */}

<Link href="/admin/festival">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Gift className="text-yellow-600 mb-2"/>
<h3 className="font-bold">Festival Banner</h3>
<p className="text-sm text-gray-500">
Festival promotions
</p>
</div>
</Link>


{/* QIKINK */}

<Link href="/admin/qikink">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Truck className="text-purple-600 mb-2"/>
<h3 className="font-bold">Qikink Orders</h3>
<p className="text-sm text-gray-500">
Print on demand orders
</p>
</div>
</Link>


{/* QIKINK TEST */}

<Link href="/admin/qikink-test">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Truck className="text-gray-700 mb-2"/>
<h3 className="font-bold">Qikink Test</h3>
<p className="text-sm text-gray-500">
Test API connection
</p>
</div>
</Link>


{/* PAYMENTS */}

<Link href="/admin/payments">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<DollarSign className="text-green-600 mb-2"/>
<h3 className="font-bold">Payments</h3>
<p className="text-sm text-gray-500">
Manage payments
</p>
</div>
</Link>


{/* RETURNS */}

<Link href="/admin/returns">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<RefreshCcw className="text-red-500 mb-2"/>
<h3 className="font-bold">Returns</h3>
<p className="text-sm text-gray-500">
Manage returns
</p>
</div>
</Link>


{/* QUESTIONS */}

<Link href="/admin/questions">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<HelpCircle className="text-blue-500 mb-2"/>
<h3 className="font-bold">Customer Questions</h3>
<p className="text-sm text-gray-500">
Customer support
</p>
</div>
</Link>


{/* NOTIFICATIONS */}

<Link href="/admin/notifications">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Bell className="text-orange-500 mb-2"/>
<h3 className="font-bold">Notifications</h3>
<p className="text-sm text-gray-500">
Admin notifications
</p>
</div>
</Link>


{/* MONITOR */}

<Link href="/admin/monitor">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Monitor className="text-gray-600 mb-2"/>
<h3 className="font-bold">System Monitor</h3>
<p className="text-sm text-gray-500">
Server monitoring
</p>
</div>
</Link>


{/* SETTINGS */}

<Link href="/admin/settings">
<div className="bg-white p-6 rounded-xl shadow hover:shadow-lg">
<Settings className="text-gray-700 mb-2"/>
<h3 className="font-bold">Settings</h3>
<p className="text-sm text-gray-500">
System settings
</p>
</div>
</Link>


</div>

</div>

);

}

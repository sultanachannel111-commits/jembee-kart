"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
LayoutDashboard,
Package,
ShoppingCart,
Users,
Store,
Tag,
Settings,
Image,
Gift,
LogOut
} from "lucide-react";

export default function AdminLayout({
children,
}: {
children: React.ReactNode;
}) {

const pathname = usePathname();
const router = useRouter();

const [checking,setChecking] = useState(true);
const [allowed,setAllowed] = useState(false);


/* 🔐 LOGIN CHECK */

useEffect(()=>{

const logged = localStorage.getItem("adminLoggedIn");

if(logged === "true"){
setAllowed(true);
}

else{
router.replace("/admin/login");
}

setChecking(false);

},[]);


/* 🔓 LOGOUT */

const logout = ()=>{

localStorage.removeItem("adminLoggedIn");

router.push("/admin/login");

};


const menu = [

{ name:"Dashboard", icon:LayoutDashboard, path:"/admin" },

{ name:"Products", icon:Package, path:"/admin/products" },

{ name:"Categories", icon:Tag, path:"/admin/categories" },

{ name:"Orders", icon:ShoppingCart, path:"/admin/orders" },

{ name:"Banners", icon:Image, path:"/admin/banners" },

{ name:"Festival Banner", icon:Gift, path:"/admin/festival" },

{ name:"Sellers", icon:Store, path:"/admin/sellers" },

{ name:"Users", icon:Users, path:"/admin/users" },

{ name:"Settings", icon:Settings, path:"/admin/settings" },

];


/* ⏳ WAIT UNTIL CHECK COMPLETE */

if(checking){
return(
<div className="flex items-center justify-center h-screen">
<p className="text-gray-500 text-lg">
Checking admin access...
</p>
</div>
)
}

/* ❌ NOT ALLOWED */

if(!allowed){
return null;
}


return (

<div className="flex min-h-screen bg-gray-100">

{/* SIDEBAR */}

<aside className="w-64 bg-white shadow-lg hidden md:flex flex-col">

<div className="p-6 border-b">

<h1 className="text-2xl font-bold text-purple-600">
JembeeKart
</h1>

<p className="text-xs text-gray-500">
Admin Panel
</p>

</div>

<nav className="flex-1 p-4 space-y-2">

{menu.map((item,index)=>{

const Icon = item.icon;
const active = pathname === item.path;

return(

<Link
key={index}
href={item.path}
className={`flex items-center gap-3 p-3 rounded-lg transition
${
active
? "bg-purple-100 text-purple-700"
: "hover:bg-gray-100 text-gray-700"
}`}
>

<Icon size={18}/>

<span className="text-sm font-medium">
{item.name}
</span>

</Link>

);

})}

</nav>

</aside>



{/* MAIN */}

<div className="flex-1 flex flex-col">

{/* HEADER */}

<header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">

<h2 className="text-lg font-semibold text-gray-700">
Admin Dashboard
</h2>


<div className="flex items-center gap-4">

<div className="text-sm text-gray-500">
Welcome Admin
</div>


<div className="w-9 h-9 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">
A
</div>


<button
onClick={logout}
className="flex items-center gap-1 text-red-500 text-sm"
>

<LogOut size={16}/>

Logout

</button>

</div>

</header>


{/* CONTENT */}

<main className="p-6">

{children}

</main>

</div>

</div>

);

}

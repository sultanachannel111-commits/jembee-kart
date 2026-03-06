"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function Header() {

const { cartCount } = useCart();

return (

<div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-pink-200 to-pink-400 px-4 h-[72px] flex items-center justify-between">

<h1 className="text-xl font-bold">
<span className="text-black">Jembee</span>
<span className="text-pink-700">Kart</span>
</h1>

<Link href="/cart" className="relative">

<ShoppingCart size={22} />

{cartCount > 0 && (

<span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">

{cartCount}

</span>

)}

</Link>

</div>

);

}

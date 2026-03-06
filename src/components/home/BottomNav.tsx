"use client";

import Link from "next/link";
import { Home, Grid, Flame, User } from "lucide-react";

export default function BottomNav(){

return(

<div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-2">

<Link href="/" className="flex flex-col items-center text-xs">
<Home size={20}/>
Home
</Link>

<Link href="/categories" className="flex flex-col items-center text-xs">
<Grid size={20}/>
Categories
</Link>

<Link href="/offers" className="flex flex-col items-center text-xs">
<Flame size={20}/>
Offers
</Link>

<Link href="/profile" className="flex flex-col items-center text-xs">
<User size={20}/>
Profile
</Link>

</div>

);

}

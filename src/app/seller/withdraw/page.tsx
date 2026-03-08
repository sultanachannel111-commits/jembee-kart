"use client";

import { useState } from "react";

export default function Withdraw(){

const [amount,setAmount] = useState("");

return(

<div>

<h1 className="text-2xl font-bold mb-6">
Withdraw Money
</h1>

<input
placeholder="Enter amount"
value={amount}
onChange={(e)=>setAmount(e.target.value)}
className="border p-3 rounded w-full mb-3"
/>

<button className="bg-black text-white px-5 py-2 rounded">
Request Withdraw
</button>

</div>

)

}

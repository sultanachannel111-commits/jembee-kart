"use client";

import { useState,useEffect } from "react";
import { doc,getDoc,setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminThemePage(){

const [background,setBackground]=useState("#ffffff");
const [header,setHeader]=useState("#ec4899");
const [button,setButton]=useState("#ec4899");
const [card,setCard]=useState("#ffffff");

const [loading,setLoading]=useState(true);


// LOAD THEME

useEffect(()=>{

async function loadTheme(){

const snap = await getDoc(
doc(db,"settings","theme")
);

if(snap.exists()){

const data:any = snap.data();

setBackground(data.background || "#ffffff");
setHeader(data.header || "#ec4899");
setButton(data.button || "#ec4899");
setCard(data.card || "#ffffff");

}

setLoading(false);

}

loadTheme();

},[]);


// SAVE THEME

async function saveTheme(){

await setDoc(
doc(db,"settings","theme"),
{
background,
header,
button,
card,
updatedAt:new Date()
}
);

alert("Theme Saved Successfully");

}


if(loading){

return(
<div className="p-6">
Loading Theme...
</div>
);

}


return(

<div className="p-6 space-y-6">

<h1 className="text-3xl font-bold text-pink-600">
Website Theme Control
</h1>


{/* COLOR CONTROLS */}

<div className="grid md:grid-cols-2 gap-6">


<div className="bg-white p-4 rounded shadow">

<p className="font-semibold mb-2">
Background Color
</p>

<input
type="color"
value={background}
onChange={(e)=>setBackground(e.target.value)}
/>

</div>


<div className="bg-white p-4 rounded shadow">

<p className="font-semibold mb-2">
Header Color
</p>

<input
type="color"
value={header}
onChange={(e)=>setHeader(e.target.value)}
/>

</div>


<div className="bg-white p-4 rounded shadow">

<p className="font-semibold mb-2">
Button Color
</p>

<input
type="color"
value={button}
onChange={(e)=>setButton(e.target.value)}
/>

</div>


<div className="bg-white p-4 rounded shadow">

<p className="font-semibold mb-2">
Card Color
</p>

<input
type="color"
value={card}
onChange={(e)=>setCard(e.target.value)}
/>

</div>


</div>


{/* PREVIEW */}

<div
className="p-6 rounded shadow"
style={{background:background}}
>

<div
className="p-4 rounded text-white"
style={{background:header}}
>

Header Preview

</div>


<div className="mt-4">

<button
style={{background:button}}
className="text-white px-5 py-2 rounded"
>

Button Preview

</button>

</div>


<div
className="mt-4 p-4 rounded shadow"
style={{background:card}}
>

Card Preview

</div>

</div>


<button
onClick={saveTheme}
className="bg-pink-600 text-white px-5 py-2 rounded"
>

Save Theme

</button>

</div>

);

}

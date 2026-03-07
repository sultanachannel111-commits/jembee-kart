"use client";

import { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminFlashSale(){

const [active,setActive] = useState(false);
const [endTime,setEndTime] = useState("");

useEffect(()=>{

loadFlashSale();

},[]);

const loadFlashSale = async ()=>{

const snap = await getDoc(doc(db,"settings","flashSale"));

if(snap.exists()){

const data = snap.data();

setActive(data.active || false);

if(data.endTime){
const date = new Date(data.endTime);
const formatted =
date.getFullYear() +
"-" +
String(date.getMonth()+1).padStart(2,"0") +
"-" +
String(date.getDate()).padStart(2,"0") +
"T" +
String(date.getHours()).padStart(2,"0") +
":" +
String(date.getMinutes()).padStart(2,"0");

setEndTime(formatted);
}

}

};

const saveFlashSale = async ()=>{

await setDoc(doc(db,"settings","flashSale"),{

active,
endTime: new Date(endTime).toISOString()

});

alert("Flash Sale Updated");

};

return(

<div className="p-6 max-w-xl">

<h1 className="text-2xl font-bold mb-6">
Flash Sale Settings
</h1>

<div className="space-y-4">

<div>

<label className="text-sm font-semibold">
End Time
</label>

<input
type="datetime-local"
value={endTime}
onChange={(e)=>setEndTime(e.target.value)}
className="border w-full px-3 py-2 rounded"
/>

</div>

<label className="flex items-center gap-2">

<input
type="checkbox"
checked={active}
onChange={(e)=>setActive(e.target.checked)}
/>

Flash Sale Active

</label>

<button
onClick={saveFlashSale}
className="bg-pink-600 text-white px-4 py-2 rounded"
>

Save

</button>

</div>

</div>

);

}

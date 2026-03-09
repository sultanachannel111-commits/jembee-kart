"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
doc,
getDoc,
updateDoc
} from "firebase/firestore";

export default function SellerProfile(){

const [name,setName] = useState("");
const [email,setEmail] = useState("");
const [phone,setPhone] = useState("");
const [store,setStore] = useState("");
const [loading,setLoading] = useState(true);

useEffect(()=>{

const loadProfile = async()=>{

try{

const user = auth.currentUser;

if(!user) return;

const ref = doc(db,"users",user.uid);
const snap = await getDoc(ref);

if(snap.exists()){

const data:any = snap.data();

setName(data.name || "");
setEmail(data.email || "");
setPhone(data.phone || "");
setStore(data.store || "");

}

}catch(err){
console.log(err);
}

setLoading(false);

};

loadProfile();

},[]);



const saveProfile = async()=>{

try{

const user = auth.currentUser;

if(!user) return;

await updateDoc(
doc(db,"users",user.uid),
{
name,
phone,
store
}
);

alert("Profile Updated");

}catch(err){

console.log(err);
alert("Update failed");

}

};



if(loading){
return <p>Loading profile...</p>
}


return(

<div className="max-w-xl">

<h1 className="text-2xl font-bold mb-6">
Seller Profile
</h1>

<div className="space-y-4">

<input
placeholder="Full Name"
value={name}
onChange={(e)=>setName(e.target.value)}
className="border p-3 w-full rounded"
/>

<input
placeholder="Email"
value={email}
disabled
className="border p-3 w-full rounded bg-gray-100"
/>

<input
placeholder="Phone"
value={phone}
onChange={(e)=>setPhone(e.target.value)}
className="border p-3 w-full rounded"
/>

<input
placeholder="Store Name"
value={store}
onChange={(e)=>setStore(e.target.value)}
className="border p-3 w-full rounded"
/>

<button
onClick={saveProfile}
className="bg-black text-white px-5 py-3 rounded"
>

Save Profile

</button>

</div>

</div>

);

}

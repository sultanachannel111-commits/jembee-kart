"use client";

import { useEffect, useState } from "react";
import { db, auth } from "@/lib/firebase";
import {
collection,
query,
where,
getDocs,
addDoc,
serverTimestamp
} from "firebase/firestore";

export default function SellerMessages(){

const [messages,setMessages] = useState<any[]>([]);
const [reply,setReply] = useState("");
const [selected,setSelected] = useState<any>(null);

useEffect(()=>{

const loadMessages = async()=>{

const user = auth.currentUser;

if(!user) return;

const q = query(
collection(db,"messages"),
where("sellerId","==",user.uid)
);

const snap = await getDocs(q);

let data:any=[];

snap.forEach((d)=>{
data.push({
id:d.id,
...d.data()
});
});

setMessages(data);

};

loadMessages();

},[]);



const sendReply = async()=>{

if(!reply || !selected) return;

const user = auth.currentUser;

await addDoc(
collection(db,"messages"),
{
sellerId:user?.uid,
customerId:selected.customerId,
productId:selected.productId,
text:reply,
sender:"seller",
createdAt:serverTimestamp()
}
);

alert("Reply sent");

setReply("");

};



return(

<div className="grid md:grid-cols-2 gap-6">

{/* MESSAGE LIST */}

<div>

<h1 className="text-2xl font-bold mb-4">
Customer Messages
</h1>

<div className="space-y-3">

{messages.map((m:any)=>(

<div
key={m.id}
onClick={()=>setSelected(m)}
className="bg-white p-4 rounded-xl shadow cursor-pointer"
>

<p className="font-semibold">
{m.customerName}
</p>

<p className="text-gray-500 text-sm">
{m.text}
</p>

</div>

))}

</div>

</div>



{/* CHAT BOX */}

<div>

<h1 className="text-2xl font-bold mb-4">
Reply
</h1>

{selected ? (

<div className="bg-white p-4 rounded-xl shadow">

<p className="mb-4 text-gray-600">
Customer: {selected.customerName}
</p>

<textarea
placeholder="Type reply..."
value={reply}
onChange={(e)=>setReply(e.target.value)}
className="border w-full p-2 rounded mb-3"
/>

<button
onClick={sendReply}
className="bg-black text-white px-4 py-2 rounded"
>

Send Reply

</button>

</div>

) : (

<p className="text-gray-500">
Select a message
</p>

)}

</div>

</div>

);

}

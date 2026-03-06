"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminUsers() {

const [users,setUsers] = useState<any[]>([]);

useEffect(()=>{
loadUsers();
},[]);

async function loadUsers(){

const snapshot = await getDocs(collection(db,"users"));

const list = snapshot.docs.map(d => ({
id:d.id,
...d.data()
}));

setUsers(list);

}

async function changeRole(uid:string,role:string){

await updateDoc(doc(db,"users",uid),{
role:role
});

alert("Role updated");

loadUsers();

}

return (

<div className="p-6">

{/* HEADER */}

<div className="mb-8">

<h1 className="text-3xl font-bold text-purple-600">
Users Management
</h1>

<p className="text-gray-500 text-sm">
Manage all platform users
</p>

</div>


{/* USERS GRID */}

<div className="grid md:grid-cols-2 gap-6">

{users.map(user => (

<div
key={user.id}
className="bg-white shadow rounded-xl p-5 space-y-4"
>

{/* NAME */}

<div>

<p className="text-sm text-gray-500">
User
</p>

<p className="font-semibold">
{user.name || user.email}
</p>

</div>


{/* EMAIL */}

<div>

<p className="text-sm text-gray-500">
Email
</p>

<p>
{user.email}
</p>

</div>


{/* ROLE */}

<div>

<span
className={`text-xs px-3 py-1 rounded ${
user.role==="seller"
? "bg-green-100 text-green-700"
: "bg-blue-100 text-blue-700"
}`}
>

{user.role}

</span>

</div>


{/* ACTION */}

<div className="flex gap-3">

<button
className="bg-green-600 text-white px-4 py-2 rounded"
onClick={()=>changeRole(user.id,"seller")}
>

Make Seller

</button>

<button
className="bg-gray-700 text-white px-4 py-2 rounded"
onClick={()=>changeRole(user.id,"customer")}
>

Make Customer

</button>

</div>

</div>

))}

</div>

</div>

);

}

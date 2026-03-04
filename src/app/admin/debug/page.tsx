"use client";

import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function DebugPanel() {

const [users,setUsers] = useState<any[]>([]);

useEffect(()=>{

const loadUsers = async () => {

const snap = await getDocs(collection(db,"users"));

const data = snap.docs.map(doc => ({
id: doc.id,
...doc.data()
}));

setUsers(data);

};

loadUsers();

},[]);

return (

<div className="p-6">

<h1 className="text-2xl font-bold mb-6">
System Debug Panel
</h1>

{users.map(user=>(
<div key={user.id} className="border p-4 mb-4 rounded">

<p><b>UID:</b> {user.id}</p>

<p><b>Email:</b> {user.email}</p>

<p><b>Role:</b> {user.role}</p>

<p><b>Status:</b>
{user.role === "seller"
? "Seller Panel Access"
: "Customer Only"}
</p>

</div>
))}

</div>

);

}

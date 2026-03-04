"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminUsers() {

const [users,setUsers] = useState<any[]>([]);

useEffect(() => {

const fetchUsers = async () => {

const snapshot = await getDocs(collection(db,"users"));

const list = snapshot.docs.map(doc => ({
id: doc.id,
...doc.data()
}));

setUsers(list);
};

fetchUsers();

},[]);

const changeRole = async (uid:string,role:string) => {

await updateDoc(doc(db,"users",uid),{
role:role
});

alert("Role updated");

};

return (

<div className="p-6">

<h1 className="text-2xl font-bold mb-6">Users Management</h1>

{users.map(user => (

<div key={user.id} className="border p-4 mb-4 rounded">

<p><b>Email:</b> {user.email}</p>

<p><b>Role:</b> {user.role}</p>

<div className="flex gap-3 mt-3">

<button
className="bg-green-500 text-white px-3 py-1 rounded"
onClick={()=>changeRole(user.id,"seller")}
>
Make Seller
</button>

<button
className="bg-gray-600 text-white px-3 py-1 rounded"
onClick={()=>changeRole(user.id,"customer")}
>
Make Customer
</button>

</div>

</div>

))}

</div>

);

}

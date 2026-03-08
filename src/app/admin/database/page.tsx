"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
collection,
getDocs,
deleteDoc,
doc,
updateDoc
} from "firebase/firestore";

export default function DatabaseExplorer(){

const [collectionName,setCollectionName] = useState("users");
const [data,setData] = useState<any[]>([]);
const [search,setSearch] = useState("");
const [editing,setEditing] = useState<any>(null);

useEffect(()=>{

loadCollection(collectionName)

},[collectionName])

const loadCollection = async (name:string)=>{

const snap = await getDocs(collection(db,name))

setData(
snap.docs.map(d=>({
id:d.id,
...d.data()
}))
)

}

const deleteItem = async(id:string)=>{

if(!confirm("Delete document?")) return

await deleteDoc(doc(db,collectionName,id))

loadCollection(collectionName)

}

const updateItem = async()=>{

await updateDoc(
doc(db,collectionName,editing.id),
editing
)

setEditing(null)

loadCollection(collectionName)

}

const filtered = data.filter((item:any)=>
JSON.stringify(item)
.toLowerCase()
.includes(search.toLowerCase())
)

return(

<div className="p-6 space-y-6">

<h1 className="text-3xl font-bold">
Firestore Database
</h1>


{/* COLLECTION SELECT */}

<select
value={collectionName}
onChange={(e)=>setCollectionName(e.target.value)}
className="border p-2 rounded"
>

<option value="users">Users</option>
<option value="products">Products</option>
<option value="orders">Orders</option>
<option value="qikinkCategories">Categories</option>
<option value="adminProducts">Admin Products</option>

</select>


{/* SEARCH */}

<input
placeholder="Search database..."
value={search}
onChange={(e)=>setSearch(e.target.value)}
className="border p-2 rounded w-full"
/>


{/* DOCUMENT LIST */}

{filtered.map((item:any)=>(

<div key={item.id} className="bg-white p-4 rounded shadow">

<h2 className="font-bold mb-2">
Document ID: {item.id}
</h2>

{Object.keys(item).map((key)=>(
<p key={key}>
<b>{key}</b>: {JSON.stringify(item[key])}
</p>
))}

<div className="flex gap-4 mt-3">

<button
onClick={()=>setEditing(item)}
className="text-blue-600"
>
Edit
</button>

<button
onClick={()=>deleteItem(item.id)}
className="text-red-600"
>
Delete
</button>

</div>

</div>

))}


{/* EDIT MODAL */}

{editing &&(

<div className="fixed inset-0 bg-black/40 flex items-center justify-center">

<div className="bg-white p-6 rounded w-96">

<h2 className="font-bold mb-4">
Edit Document
</h2>

{Object.keys(editing).map((key)=>{

if(key==="id") return null

return(

<input
key={key}
value={editing[key]}
onChange={(e)=>setEditing({
...editing,
[key]:e.target.value
})}
className="border p-2 w-full mb-2"
/>

)

})}

<div className="flex gap-3 mt-4">

<button
onClick={updateItem}
className="bg-green-600 text-white px-4 py-2 rounded"
>
Save
</button>

<button
onClick={()=>setEditing(null)}
className="bg-gray-400 text-white px-4 py-2 rounded"
>
Cancel
</button>

</div>

</div>

</div>

)}

</div>

)

}

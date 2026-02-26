"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
collection,
onSnapshot,
updateDoc,
deleteDoc,
doc,
serverTimestamp,
} from "firebase/firestore";

export default function AdminProducts() {
const [products, setProducts] = useState<any[]>([]);

useEffect(() => {
const unsub = onSnapshot(
collection(db, "products"),
(snap) => {
setProducts(
snap.docs.map((doc) => ({
id: doc.id,
...doc.data(),
}))
);
}
);
return () => unsub();
}, []);

const approve = async (id: string) => {
await updateDoc(doc(db, "products", id), {
status: "approved",
isActive: true,
approvedAt: serverTimestamp(),
});
};

const reject = async (id: string) => {
await updateDoc(doc(db, "products", id), {
status: "rejected",
isActive: false,
rejectedAt: serverTimestamp(),
});
};

const remove = async (id: string) => {
await deleteDoc(doc(db, "products", id));
};

return (
<div className="p-6">
<h1 className="text-2xl font-bold mb-6">
Admin Product Panel
</h1>

{products.map((p) => (  
    <div key={p.id} className="bg-white p-4 mb-4 rounded shadow">  

      <h2 className="font-bold">{p.name}</h2>  
      <p>Seller: {p.sellerId}</p>  
      <p>Category: {p.category}</p>  
      <p>Price: ₹ {p.sellingPrice}</p>  
      <p>Status: {p.status}</p>  

      <div className="mt-3 space-x-2">  

        <button  
          onClick={() => approve(p.id)}  
          className="bg-green-600 text-white px-3 py-1 rounded"  
        >  
          Approve  
        </button>  

        <button  
          onClick={() => reject(p.id)}  
          className="bg-yellow-600 text-white px-3 py-1 rounded"  
        >  
          Reject  
        </button>  

        <button  
          onClick={() => remove(p.id)}  
          className="bg-red-600 text-white px-3 py-1 rounded"  
        >  
          Delete  
        </button>  

      </div>  
    </div>  
  ))}  
</div>

);
} Ye kaha likhna h

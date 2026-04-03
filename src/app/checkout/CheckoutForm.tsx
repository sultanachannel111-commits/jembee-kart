"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

import {
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  doc,
  deleteDoc
} from "firebase/firestore";

import { getOfferPrice } from "@/utils/pricing";
import { getActiveOffers } from "@/services/offerService";

export default function CheckoutPage(){

  const [items,setItems] = useState<any[]>([]);
  const [offers,setOffers] = useState({});
  const [user,setUser] = useState<any>(null);

  const router = useRouter();

  useEffect(()=>{

    const unsub = onAuthStateChanged(auth, async(u)=>{
      if(!u) return;

      setUser(u);

      const snap = await getDocs(collection(db,"carts",u.uid,"items"));

      const arr:any[] = [];
      snap.forEach(d=>arr.push({id:d.id,...d.data()}));

      setItems(arr);

      const off = await getActiveOffers();
      setOffers(off);
    });

    return ()=>unsub();

  },[]);

  const total = items.reduce((s,i)=>
    s + getOfferPrice(i,offers)*(i.quantity||1)
  ,0);

  const placeOrder = async()=>{

    const cleanItems = items.map(i=>({
      id: i.productId,
      productId: i.productId,
      name: i.name,
      image: i.image,
      quantity: i.quantity,
      price: getOfferPrice(i,offers),
      category: i.category || "",
      variations: i.variations || []
    }));

    const ref = await addDoc(collection(db,"orders"),{
      userId:user.uid,
      items:cleanItems,
      total,
      status:"Pending",
      createdAt:serverTimestamp()
    });

    const snap = await getDocs(collection(db,"carts",user.uid,"items"));

    for(const d of snap.docs){
      await deleteDoc(doc(db,"carts",user.uid,"items",d.id));
    }

    router.push(`/order-success/${ref.id}`);
  };

  return(
    <div className="p-4">

      <h1 className="text-xl font-bold">Checkout</h1>

      {items.map(i=>(

        <div key={i.id} className="border p-3 mt-2 rounded">

          {i.name} - ₹{getOfferPrice(i,offers)}

        </div>

      ))}

      <h2 className="mt-4 font-bold">
        Total ₹{total}
      </h2>

      <button
        onClick={placeOrder}
        className="bg-black text-white p-3 w-full mt-4 rounded"
      >
        Place Order
      </button>

    </div>
  );
}

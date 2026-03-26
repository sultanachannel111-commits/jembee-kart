"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const snap = await getDoc(doc(db, "orders", id as string));

      if (snap.exists()) {
        setOrder({ id: snap.id, ...snap.data() });
      }
    };

    fetchOrder();
  }, [id]);

  if (!order) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Order Details</h1>

      {order.items?.map((item:any,i:number)=>(
        <div key={i} className="flex justify-between mb-2">
          <span>{item.name} × {item.quantity}</span>
          <span>₹{item.price}</span>
        </div>
      ))}

      <h2 className="mt-4 font-bold text-lg">
        Total: ₹{order.total}
      </h2>

      <p>Status: {order.status}</p>
    </div>
  );
}

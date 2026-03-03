"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OrderSuccess() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    const fetch = async () => {
      const snap = await getDoc(doc(db, "orders", id as string));
      if (snap.exists()) setOrder(snap.data());
    };
    fetch();
  }, [id]);

  if (!order) return <div>Loading...</div>;

  return (
    <div className="p-6 pt-[100px]">
      <h1 className="text-green-600 text-2xl font-bold">Order Placed 🎉</h1>
      <p>Order ID: {id}</p>
      <p>Total: ₹{order.totalAmount}</p>
    </div>
  );
}

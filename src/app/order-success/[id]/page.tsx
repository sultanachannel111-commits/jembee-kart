"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function OrderSuccess() {

  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {

    const saveAndFetch = async () => {

      const ref = doc(db, "orders", id as string);
      const snap = await getDoc(ref);

      // अगर order नहीं है तो create करो
      if (!snap.exists()) {

        await setDoc(ref, {
          orderId: id,
          status: "Paid",
          totalAmount: 2,
          createdAt: Date.now()
        });

        const newSnap = await getDoc(ref);
        setOrder(newSnap.data());

      } else {
        setOrder(snap.data());
      }

    };

    saveAndFetch();

  }, [id]);

  if (!order) return <div>Loading...</div>;

  return (
    <div className="p-6 pt-[100px]">

      <h1 className="text-green-600 text-2xl font-bold">
        Payment Successful 🎉
      </h1>

      <p>Order ID: {id}</p>

      <p>Total: ₹{order.totalAmount}</p>

      <p>Status: {order.status}</p>

    </div>
  );
}

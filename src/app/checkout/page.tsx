"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, writeBatch, doc, increment } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const [items, setItems] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    onAuthStateChanged(auth, async (u) => {
      if (!u) return;
      setUser(u);

      const snap = await getDocs(collection(db, "cart", u.uid, "items"));
      const data: any[] = [];
      snap.forEach((d) => data.push({ id: d.id, ...d.data() }));
      setItems(data);
    });
  }, []);

  const placeOrder = async () => {
    const batch = writeBatch(db);

    const orderRef = doc(collection(db, "orders"));

    batch.set(orderRef, {
      userId: user.uid,
      products: items,
      totalAmount: items.reduce((s, i) => s + i.price * i.quantity, 0),
      status: "Placed",
      createdAt: new Date(),
    });

    for (const item of items) {
      batch.update(doc(db, "products", item.productId), {
        stock: increment(-item.quantity),
      });

      batch.delete(doc(db, "cart", user.uid, "items", item.id));
    }

    await batch.commit();

    router.push(`/order-success/${orderRef.id}`);
  };

  return (
    <div className="p-6 pt-[100px]">
      <h1>Checkout</h1>
      <button onClick={placeOrder} className="bg-green-600 text-white px-6 py-3 rounded">
        Place Order
      </button>
    </div>
  );
}

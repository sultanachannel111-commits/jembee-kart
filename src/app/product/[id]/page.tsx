"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  addDoc,
  setDoc,
  increment,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ProductPage() {
  const { id } = useParams();
  const router = useRouter();

  const [product, setProduct] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      const snap = await getDoc(doc(db, "products", id as string));
      if (snap.exists()) {
        setProduct({ id: snap.id, ...snap.data() });
      }
    };
    fetchProduct();
  }, [id]);

  const addToCart = async () => {
    if (!user) return alert("Login first");

    const productRef = doc(db, "products", product.id);
    const productSnap = await getDoc(productRef);
    const stock = productSnap.data()?.stock || 0;

    if (stock <= 0) return alert("Out of stock");

    await setDoc(doc(db, "cart", user.uid), { createdAt: new Date() }, { merge: true });

    const itemsRef = collection(db, "cart", user.uid, "items");
    const q = query(itemsRef, where("productId", "==", product.id));
    const snap = await getDocs(q);

    if (!snap.empty) {
      const existing = snap.docs[0];
      if (existing.data().quantity >= stock) {
        return alert("Stock limit reached");
      }
      await updateDoc(existing.ref, { quantity: increment(1) });
    } else {
      await addDoc(itemsRef, {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
      });
    }

    alert("Added to cart ✅");
  };

  const buyNow = async () => {
    await addToCart();
    router.push("/checkout");
  };

  if (!product) return <div>Loading...</div>;

  return (
    <div className="p-6 pt-[100px]">
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p>₹{product.price}</p>

      <div className="flex gap-4 mt-4">
        <button onClick={addToCart} className="bg-pink-600 text-white px-6 py-3 rounded">
          Add to Cart
        </button>

        <button onClick={buyNow} className="bg-black text-white px-6 py-3 rounded">
          Buy Now
        </button>
      </div>
    </div>
  );
}

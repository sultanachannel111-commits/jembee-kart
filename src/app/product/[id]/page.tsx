"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function ProductPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const snap = await getDoc(doc(db, "products", id));

        console.log("Doc ID:", id);
        console.log("Exists:", snap.exists());

        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error(error);
      }

      setLoading(false);
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product not found ❌
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 pt-[100px]">
      <h1 className="text-2xl font-bold">{product.name}</h1>
      <p className="text-xl mt-4">₹{product.sellingPrice}</p>
    </div>
  );
}

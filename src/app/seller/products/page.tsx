"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { useAuth } from "@/providers/auth-provider";

export default function SellerProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);

  const fetchProducts = async () => {
    const querySnapshot = await getDocs(collection(db, "products"));
    const list = querySnapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((item: any) => item.sellerId === user?.uid);

    setProducts(list);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">My Products</h1>

      {products.map((product) => (
        <div key={product.id} className="bg-white p-4 mb-4 rounded shadow">
          <h2 className="font-bold">{product.name}</h2>
          <p>₹ {product.price}</p>

          <button
            onClick={() => handleDelete(product.id)}
            className="bg-red-500 text-white px-4 py-1 mt-2 rounded"
          >
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

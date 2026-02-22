"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { useAuth } from "@/providers/auth-provider";

export default function SellerProducts() {
  const { user } = useAuth();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (uid: string) => {
    const q = query(
      collection(db, "products"),
      where("sellerId", "==", uid)
    );

    const snapshot = await getDocs(q);

    const list = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setProducts(list);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.uid) {
      fetchProducts(user.uid);
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    await deleteDoc(doc(db, "products", id));
    if (user?.uid) fetchProducts(user.uid);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">
        My Products
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : products.length === 0 ? (
        <p>No products found</p>
      ) : (
        <div className="space-y-4">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white p-4 rounded shadow"
            >
              <h2 className="font-bold">
                {product.name}
              </h2>

              <p>
                ₹ {product.sellingPrice || product.price}
              </p>

              <p>Status: {product.status}</p>

              <button
                onClick={() => handleDelete(product.id)}
                className="bg-red-500 text-white px-4 py-1 mt-2 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

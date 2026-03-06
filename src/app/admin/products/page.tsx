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
import { CheckCircle, XCircle, Trash2 } from "lucide-react";

export default function AdminProducts() {
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "products"), (snap) => {
      const list = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      }));
      setProducts(list);
    });

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

      {/* Title */}
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Admin Product Panel
      </h1>

      {/* Product Grid */}
      <div className="grid md:grid-cols-3 gap-6">

        {products.map((p) => (

          <div
            key={p.id}
            className="bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
          >

            {/* Image */}
            {p.image && (
              <img
                src={p.image}
                className="w-full h-48 object-cover"
              />
            )}

            <div className="p-4">

              <h2 className="font-bold text-lg">
                {p.name}
              </h2>

              <p className="text-sm text-gray-500">
                Seller: {p.sellerId || "Admin"}
              </p>

              <p className="text-sm text-gray-500">
                Category: {p.category}
              </p>

              <p className="text-purple-600 font-bold mt-2">
                ₹ {p.sellingPrice}
              </p>

              {/* Status */}
              <div className="mt-2">
                <span
                  className={`text-xs px-2 py-1 rounded
                    ${
                      p.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : p.status === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                >
                  {p.status || "pending"}
                </span>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 mt-4">

                <button
                  onClick={() => approve(p.id)}
                  className="flex items-center gap-1 bg-green-600 text-white px-3 py-1 rounded text-sm"
                >
                  <CheckCircle size={16} />
                  Approve
                </button>

                <button
                  onClick={() => reject(p.id)}
                  className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded text-sm"
                >
                  <XCircle size={16} />
                  Reject
                </button>

                <button
                  onClick={() => remove(p.id)}
                  className="flex items-center gap-1 bg-red-600 text-white px-3 py-1 rounded text-sm"
                >
                  <Trash2 size={16} />
                  Delete
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

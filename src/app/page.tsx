"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [message, setMessage] = useState("");

  /* 🔹 FETCH PRODUCTS */
  useEffect(() => {
    const fetchProducts = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(data);
    };
    fetchProducts();
  }, []);

  /* 🔥 FINAL PLACE ORDER FUNCTION */
  const placeOrder = async (product: any) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        setMessage("Please login first 💖");
        return;
      }

      if (!product.qikinkProductId) {
        setMessage("Qikink Product ID missing ❌");
        return;
      }

      setMessage("Sending order to Qikink... ⏳");

      // 1️⃣ Save order in Firestore
      const orderRef = await addDoc(collection(db, "orders"), {
        productId: product.id,
        productName: product.name,
        price: product.price,
        userId: user.uid,
        status: "Processing",
        createdAt: new Date(),
      });

      // 2️⃣ Send order to Qikink API
      const response = await fetch("/api/qikink/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order_id: orderRef.id,
          shipping_address: {
            name: user.displayName || "Customer Name",
            address1: "Test Address Line 1",
            city: "Delhi",
            state: "Delhi",
            pincode: "110001",
            country: "India",
            phone: "9999999999",
          },
          order_items: [
            {
              product_id: product.qikinkProductId,
              quantity: 1,
            },
          ],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error("Qikink order failed");
      }

      // 3️⃣ Update order status
      await updateDoc(doc(db, "orders", orderRef.id), {
        status: "Confirmed",
        qikinkResponse: data,
      });

      setMessage("Order placed successfully 💕");
    } catch (error) {
      console.error(error);
      setMessage("Order failed ❌");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-center mb-6 text-pink-600">
        JEMBEE KART 💖
      </h1>

      {message && (
        <p className="text-center text-lg font-semibold mb-4">
          {message}
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {products.map((product: any) => (
          <div
            key={product.id}
            className="bg-white p-4 rounded-xl shadow-md"
          >
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-40 w-full object-cover rounded-md"
            />
            <h2 className="mt-3 font-semibold">{product.name}</h2>
            <p className="text-pink-600 font-bold">
              ₹{product.price}
            </p>

            <button
              onClick={() => placeOrder(product)}
              className="mt-3 w-full bg-pink-500 text-white py-2 rounded-lg"
            >
              Place Order 💕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function OrderSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrder() {
      if (!orderId || !db) return;

      const snapshot = await getDoc(doc(db, "orders", orderId));

      if (snapshot.exists()) {
        setOrder(snapshot.data());
      }

      setLoading(false);
    }

    fetchOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto p-6 text-center max-w-xl">

        {loading && <p>Loading order details...</p>}

        {!loading && order && (
          <>
            <h1 className="text-3xl font-bold text-green-600 mb-4">
              🎉 Order Placed Successfully!
            </h1>

            <div className="bg-white shadow rounded p-6 mb-6 text-left">
              <p className="mb-2">
                <strong>Customer Name:</strong> {order.customerName}
              </p>

              <p className="mb-2">
                <strong>Total Amount:</strong> ₹{order.totalAmount}
              </p>

              <p className="mb-2">
                <strong>Status:</strong> {order.status}
              </p>
            </div>

            <Button onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </>
        )}

        {!loading && !order && (
          <>
            <h1 className="text-2xl font-bold text-red-500 mb-4">
              Order Not Found
            </h1>

            <Button onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </>
        )}

      </div>
    </div>
  );
}

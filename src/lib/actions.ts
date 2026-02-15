"use server";

import { z } from "zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

/* =========================
   ORDER VALIDATION SCHEMA
========================= */

const orderSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerPhone: z.string().min(1, "Phone is required"),
  shippingAddress: z.string().min(5, "Address is required"),
  productId: z.string(),
  sellerId: z.string().optional(),
  userId: z.string().optional(),
  productDetails: z.object({
    name: z.string(),
    price: z.number(),
    imageUrl: z.string(),
  }),
});

/* =========================
   PLACE ORDER ACTION
========================= */

export async function placeOrderAction(values: any) {
  const validated = orderSchema.safeParse(values);

  if (!validated.success) {
    console.log("Validation Error:", validated.error);
    return { error: "Invalid data provided." };
  }

  try {
    const data = validated.data;

    const orderId =
      "JM-" + Math.random().toString(36).substring(2, 7).toUpperCase();

    const newOrder = {
      orderId,
      userId: data.userId || "guest",
      productId: data.productId,
      sellerId: data.sellerId || "admin",
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      shippingAddress: data.shippingAddress,
      productDetails: data.productDetails,
      status: "Confirmed",
      createdAt: serverTimestamp(),
    };

    if (!db) {
      return { error: "Database not initialized." };
    }

    await addDoc(collection(db, "orders"), newOrder);

    return {
      success: true,
      message: "Order placed successfully",
    };
  } catch (error) {
    console.error("Order Error:", error);
    return {
      error: "There was a problem placing your order.",
    };
  }
}

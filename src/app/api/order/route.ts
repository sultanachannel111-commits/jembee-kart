import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";

/*
  POST /api/order
  Body:
  {
    productId: string,
    productName: string,
    price: number,
    customerEmail?: string
  }
*/

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      productId,
      productName,
      price,
      customerEmail,
    } = body;

    /* ---------------- Validation ---------------- */

    if (!productId || !productName || !price) {
      return NextResponse.json(
        { success: false, message: "Missing fields" },
        { status: 400 }
      );
    }

    /* ---------------- Create Order Object ---------------- */

    const orderData = {
      productId,
      productName,
      price,
      customerEmail: customerEmail || null,

      status: "Pending",
      trackingId: null,

      source: "WhatsApp",

      createdAt: serverTimestamp(),
    };

    /* ---------------- Save to Firestore ---------------- */

    await addDoc(collection(db, "orders"), orderData);

    return NextResponse.json({
      success: true,
      message: "Order created successfully",
    });
  } catch (error) {
    console.error("Order API Error:", error);

    return NextResponse.json(
      { success: false, message: "Server Error" },
      { status: 500 }
    );
  }
}

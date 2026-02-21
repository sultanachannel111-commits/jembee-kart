import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // 🔐 Optional: Verify secret key here

    const orderId = data.order_id;

    const costPrice = Number(data.cost_price || 0);
    const sellingPrice = Number(data.selling_price || 0);

    const profit = sellingPrice - costPrice;

    await setDoc(doc(db, "orders", orderId), {
      qikinkOrderId: data.order_id,
      qikinkTrackingId: data.tracking_id || null,
      customerName: data.customer_name,
      customerPhone: data.phone,
      shippingAddress: data.address,
      productName: data.product_name,
      variant: data.variant,
      quantity: data.quantity,
      costPrice,
      sellingPrice,
      profit,
      status: data.status || "Pending",
      courier: data.courier || null,
      sellerId: data.seller_id, // must match your seller UID
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: true }, { status: 500 });
  }
}

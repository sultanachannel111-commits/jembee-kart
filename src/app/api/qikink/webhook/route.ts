import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";

export async function POST(req: Request) {
  const data = await req.json();

  if (!data.order_number)
    return NextResponse.json({ error: "Missing order number" }, { status: 400 });

  await updateDoc(doc(db, "orders", data.order_number), {
    status: data.status,
    trackingId: data.tracking_id || null,
  });

  return NextResponse.json({ success: true });
}

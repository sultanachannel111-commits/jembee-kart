import { NextResponse } from "next/server";
import { sendOrderEmail } from "@/lib/email";

export async function POST(req: Request) {
  const body = await req.json();

  await sendOrderEmail(
    body.email,
    body.orderId,
    body.product,
    body.total
  );

  return NextResponse.json({ success: true });
}

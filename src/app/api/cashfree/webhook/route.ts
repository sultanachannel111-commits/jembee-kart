import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: Request) {

  try {

    const body = await req.json();

    const orderId = body.data?.order?.order_id;
    const paymentStatus = body.data?.payment?.payment_status;
    const amount = body.data?.order?.order_amount;

    if(paymentStatus === "SUCCESS"){

      await setDoc(doc(db,"orders",orderId),{

        orderId:orderId,
        price:amount,
        status:"Paid",
        createdAt:new Date()

      });

    }

    return NextResponse.json({
      success:true
    });

  } catch (error) {

    return NextResponse.json({
      success:false
    });

  }

}

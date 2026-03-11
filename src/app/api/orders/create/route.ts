import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();
    const { product, customer, paymentMethod } = body;

    if (!product || !customer) {
      return NextResponse.json(
        { success:false, error:"Missing data" },
        { status:400 }
      );
    }

    const orderNumber = "JB" + Date.now().toString().slice(-8);

    await setDoc(
      doc(db,"orders",orderNumber),
      {
        orderNumber,
        product,
        customer,
        paymentMethod,
        status:"Pending",
        createdAt:new Date()
      }
    );

    return NextResponse.json({
      success:true,
      orderNumber
    });

  } catch(error:any){

    return NextResponse.json({
      success:false,
      error:error.message
    });

  }

}

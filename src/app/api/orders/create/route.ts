import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function POST(req: NextRequest) {

  try {

    const body = await req.json();

    const { product, customer, paymentMethod } = body;

    /* ==========================
       VALIDATE DATA
    ========================== */

    if (!product || !customer) {

      return NextResponse.json(
        { success:false, error:"Missing product or customer data" },
        { status:400 }
      );

    }

    /* ==========================
       GENERATE ORDER ID
    ========================== */

    const orderNumber = "JB" + Date.now().toString().slice(-8);


    /* ==========================
       SAVE ORDER IN FIRESTORE
    ========================== */

    await setDoc(
      doc(db,"orders",orderNumber),
      {
        orderNumber,
        product,
        customer,
        paymentMethod,
        status:"Pending",
        trackingId:null,
        courier:null,
        estimatedDelivery:null,
        createdAt:new Date()
      }
    );


    /* ==========================
       SEND CUSTOMER SMS
    ========================== */

    try{

      await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/send-sms`,{

        method:"POST",

        headers:{
          "Content-Type":"application/json"
        },

        body:JSON.stringify({

          phone:customer.phone,

          orderId:orderNumber

        })

      });

    }catch(smsError){

      console.log("SMS error:",smsError);

    }


    /* ==========================
       SUCCESS RESPONSE
    ========================== */

    return NextResponse.json({

      success:true,

      message:"Order created successfully",

      orderNumber

    });


  } catch(error:any){

    console.log("Order Create Error:",error);

    return NextResponse.json({

      success:false,

      error:error.message

    });

  }

}

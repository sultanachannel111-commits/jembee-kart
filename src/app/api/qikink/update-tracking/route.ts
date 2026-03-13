import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";

export async function GET() {

  try {

    const clientId = process.env.QIKINK_CLIENT_ID;
    const clientSecret = process.env.QIKINK_CLIENT_SECRET;

    /* =====================
       GET TOKEN
    ===================== */

    const tokenRes = await fetch(
      "https://api.qikink.com/api/v1/oauth/token",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          client_id:clientId,
          client_secret:clientSecret,
          grant_type:"client_credentials"
        })
      }
    );

    const tokenData = await tokenRes.json();

    const accessToken = tokenData.access_token;

    /* =====================
       GET QIKINK ORDERS
    ===================== */

    const orderRes = await fetch(
      "https://api.qikink.com/api/v1/orders",
      {
        headers:{
          Authorization:`Bearer ${accessToken}`
        }
      }
    );

    const orderData = await orderRes.json();

    const qikinkOrders = orderData.data || [];

    /* =====================
       UPDATE FIRESTORE
    ===================== */

    const snapshot = await getDocs(collection(db,"orders"));

    for(const docSnap of snapshot.docs){

      const order = docSnap.data();

      const qOrder = qikinkOrders.find(
        (o:any)=>o.order_number === order.orderNumber
      );

      if(qOrder){

        await updateDoc(doc(db,"orders",docSnap.id),{

          status:qOrder.status,

          trackingId:qOrder.tracking_id || null,

          courier:qOrder.courier || null,

          estimatedDelivery:qOrder.estimated_delivery || null

        });

      }

    }

    return NextResponse.json({
      success:true,
      message:"Tracking updated"
    });

  } catch(error:any){

    return NextResponse.json({
      success:false,
      error:error.message
    });

  }

}

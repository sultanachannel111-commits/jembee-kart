import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc } from "firebase/firestore";

export async function GET() {

  try {

    const res = await fetch("https://api.qikink.com/api/v1/products",{
      method:"GET",
      headers:{
        "Content-Type":"application/json",
        "x-api-key": process.env.QIKINK_API_KEY || ""
      }
    });

    const data = await res.json();

    const products = data.data || [];

    let count = 0;

    for(const p of products){

      await setDoc(doc(db,"products",String(p.id)),{

        name: p.title || "Qikink Product",

        price: p.selling_price || 499,

        image:
        p.images?.[0]?.src ||
        "https://via.placeholder.com/300",

        supplier:"qikink"

      });

      count++;

    }

    return NextResponse.json({
      message:"Products Imported",
      count
    });

  } catch(e){

    return NextResponse.json({
      error:"Import Failed",
      details:String(e)
    });

  }

}

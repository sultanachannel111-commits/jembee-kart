import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

export async function GET(){

  try{

    await setDoc(doc(db,"products","test1"),{
      name:"Test Product 1",
      price:500,
      image:"https://via.placeholder.com/300"
    });

    await setDoc(doc(db,"products","test2"),{
      name:"Test Product 2",
      price:700,
      image:"https://via.placeholder.com/300"
    });

    return NextResponse.json({
      message:"Test Products Added",
      count:2
    });

  }catch(e){

    return NextResponse.json({
      error:String(e)
    });

  }

}

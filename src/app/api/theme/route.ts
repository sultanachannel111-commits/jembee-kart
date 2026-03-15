import { NextResponse } from "next/server";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function GET(){

const ref = doc(db,"settings","theme");

const snap = await getDoc(ref);

if(!snap.exists()){

const defaultTheme={
primaryColor:"#ec4899",
secondaryColor:"#111827"
};

await setDoc(ref,defaultTheme);

return NextResponse.json(defaultTheme);

}

return NextResponse.json(snap.data());

}

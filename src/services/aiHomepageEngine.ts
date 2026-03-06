import { getDocs,collection } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const generateAutoLayout = async ()=>{

const offers = await getDocs(collection(db,"offers"));
const festival = await getDocs(collection(db,"festival"));
const products = await getDocs(collection(db,"products"));

let layout=[];


/* FESTIVAL PRIORITY */

if(!festival.empty){

layout.push("festival");

}


/* OFFERS PRIORITY */

if(offers.size>0){

layout.push("offers");

}


/* DEFAULT */

layout.push("banner");
layout.push("categories");
layout.push("trending");
layout.push("products");


return layout;

};

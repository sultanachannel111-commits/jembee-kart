import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export const getActiveOffers = async ()=>{

  const snap = await getDocs(collection(db,"offers"));

  const offers:any = {};

  snap.forEach(doc=>{
    const d:any = doc.data();

    if(!d.active) return;

    if(d.endDate && new Date(d.endDate) < new Date()) return;

    offers[doc.id] = d;
  });

  return offers;
};

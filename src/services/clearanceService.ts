import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const getClearanceProducts = async () => {

  const snap = await getDocs(collection(db,"products"));

  const products = snap.docs.map(doc=>({
    id:doc.id,
    ...doc.data()
  }));

  return products
  .filter((p:any)=>p.stock < 5)
  .slice(0,8);

};

import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const getTrendingProducts = async () => {

  const snap = await getDocs(collection(db, "products"));

  const products = snap.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const trending = products
    .sort((a:any,b:any)=> (b.sales || 0) - (a.sales || 0))
    .slice(0,8);

  return trending;

};

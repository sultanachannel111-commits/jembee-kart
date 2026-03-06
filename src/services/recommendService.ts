import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const getRecommendedProducts = async () => {

  const snap = await getDocs(collection(db,"products"));

  const products = snap.docs.map(doc=>({
    id:doc.id,
    ...doc.data()
  }));

  return products
  .sort(()=>0.5-Math.random())
  .slice(0,8);

};

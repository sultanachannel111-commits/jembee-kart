import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const getTotalOrders = async () => {

  const snapshot = await getDocs(collection(db,"orders"));

  return snapshot.size;

};

export const getTotalRevenue = async () => {

  const snapshot = await getDocs(collection(db,"orders"));

  let revenue = 0;

  snapshot.docs.forEach(doc=>{
    const data:any = doc.data();

    if(data.status === "Completed"){
      revenue += Number(data.product?.sellingPrice || 0);
    }
  });

  return revenue;

};

export const getTopProducts = async () => {

  const snapshot = await getDocs(collection(db,"products"));

  return snapshot.docs.map(doc=>({
    id:doc.id,
    ...doc.data()
  }));

};

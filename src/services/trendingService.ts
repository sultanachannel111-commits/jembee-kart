import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const getTrendingProducts = async () => {

  try{

    const snap = await getDocs(collection(db,"products"));

    const products:any[] = snap.docs.map(doc=>({
      id: doc.id,
      ...doc.data()
    }));

    // SALES BASED TRENDING
    const trending = products
      .sort((a:any,b:any)=> (b.sales || 0) - (a.sales || 0))
      .slice(0,8);

    return trending;

  }catch(error){

    console.log("Trending error",error);
    return [];

  }

};

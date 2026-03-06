import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const searchProducts = async (query: string) => {

  const snapshot = await getDocs(collection(db, "products"));

  const products = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  const normalized = query.toLowerCase();

  return products.filter((p: any) =>
    p.name?.toLowerCase().includes(normalized)
  );

};

export const getSearchSuggestions = async (query: string) => {

  const results = await searchProducts(query);

  return results.slice(0, 5);

};

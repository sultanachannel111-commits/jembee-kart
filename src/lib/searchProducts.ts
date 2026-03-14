import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { correctSearch } from "./typoCorrect";

export async function searchProducts(query: string) {

  if (!query) return [];

  const fixedQuery = correctSearch(query).toLowerCase();

  const snapshot = await getDocs(collection(db, "products"));

  const products = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  })) as any[];

  const filtered = products.filter((p: any) => {

    const name =
      (p.name || p.title || p.productName || "").toLowerCase();

    const category =
      (p.category || "").toLowerCase();

    return (
      name.includes(fixedQuery) ||
      category.includes(fixedQuery)
    );

  });

  return filtered;
}

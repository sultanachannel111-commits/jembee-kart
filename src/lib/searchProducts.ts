import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { correctSearch } from "./typoCorrect";

export async function searchProducts(query: string) {

const fixedQuery = correctSearch(query);

const snapshot = await getDocs(collection(db,"products"));

const products = snapshot.docs.map(doc => ({
id: doc.id,
...doc.data()
}));

const filtered = products.filter((p:any)=>
p.name?.toLowerCase().includes(fixedQuery) ||
p.category?.toLowerCase().includes(fixedQuery)
);

return filtered;

}

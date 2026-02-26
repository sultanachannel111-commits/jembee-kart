import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function checkVerifiedBuyer(userId: string, productId: string) {
  const q = query(
    collection(db, "orders"),
    where("userId", "==", userId),
    where("productId", "==", productId),
    where("status", "==", "SHIPPED")
  );

  const snap = await getDocs(q);
  return !snap.empty;
}

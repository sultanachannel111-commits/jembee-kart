import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export const createOrder = async (order: any) => {
  const ref = await addDoc(collection(db, "orders"), order);
  return ref.id;
};

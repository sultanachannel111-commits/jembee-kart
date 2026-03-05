import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc
} from "firebase/firestore";

export const addToCartDB = async (userId: string, product: any) => {
  await addDoc(collection(db, "users", userId, "cart"), product);
};

export const getCartItems = async (userId: string) => {
  const snapshot = await getDocs(collection(db, "users", userId, "cart"));

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data()
  }));
};

export const removeCartItem = async (userId: string, cartId: string) => {
  await deleteDoc(doc(db, "users", userId, "cart", cartId));
};

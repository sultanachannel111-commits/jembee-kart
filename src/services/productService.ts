import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  updateDoc
} from "firebase/firestore";

const productCollection = collection(db, "products");

export const getProducts = async () => {
  const snapshot = await getDocs(productCollection);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data()
  }));
};

export const addProduct = async (product: any) => {
  return await addDoc(productCollection, product);
};

export const deleteProduct = async (id: string) => {
  return await deleteDoc(doc(db, "products", id));
};

export const updateProduct = async (id: string, data: any) => {
  return await updateDoc(doc(db, "products", id), data);
};

import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";

const sellerCollection = collection(db, "sellers");

/* ---------------------------
ADD NEW SELLER
----------------------------*/
export const registerSeller = async (seller: any) => {
  const ref = await addDoc(sellerCollection, {
    ...seller,
    status: "pending",
    createdAt: new Date(),
  });

  return ref.id;
};

/* ---------------------------
GET ALL SELLERS
----------------------------*/
export const getAllSellers = async () => {
  const snapshot = await getDocs(sellerCollection);

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));
};

/* ---------------------------
GET SINGLE SELLER
----------------------------*/
export const getSellerById = async (id: string) => {
  const ref = doc(db, "sellers", id);
  const snap = await getDoc(ref);

  if (!snap.exists()) return null;

  return {
    id: snap.id,
    ...snap.data(),
  };
};

/* ---------------------------
APPROVE SELLER (ADMIN)
----------------------------*/
export const approveSeller = async (id: string) => {
  await updateDoc(doc(db, "sellers", id), {
    status: "approved",
  });
};

/* ---------------------------
BLOCK SELLER
----------------------------*/
export const blockSeller = async (id: string) => {
  await updateDoc(doc(db, "sellers", id), {
    status: "blocked",
  });
};

/* ---------------------------
UPDATE SELLER PROFILE
----------------------------*/
export const updateSeller = async (id: string, data: any) => {
  await updateDoc(doc(db, "sellers", id), data);
};

/* ---------------------------
DELETE SELLER
----------------------------*/
export const deleteSeller = async (id: string) => {
  await deleteDoc(doc(db, "sellers", id));
};

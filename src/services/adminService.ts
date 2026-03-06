import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";

/* ===========================
CATEGORY MANAGEMENT
===========================*/

export const getCategories = async () => {

  const snapshot = await getDocs(collection(db, "categories"));

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

};

export const addCategory = async (category: any) => {

  return await addDoc(collection(db, "categories"), {
    ...category,
    createdAt: serverTimestamp(),
  });

};

export const updateCategory = async (id: string, data: any) => {

  await updateDoc(doc(db, "categories", id), data);

};

export const deleteCategory = async (id: string) => {

  await deleteDoc(doc(db, "categories", id));

};

/* ===========================
FESTIVAL BANNER MANAGEMENT
===========================*/

export const getFestivalBanner = async () => {

  const ref = doc(db, "festivalBanner", "main");

  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };

};

export const setFestivalBanner = async (data: any) => {

  const ref = doc(db, "festivalBanner", "main");

  await setDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });

};

export const deleteFestivalBanner = async () => {

  await deleteDoc(doc(db, "festivalBanner", "main"));

};

/* ===========================
BANNER MANAGEMENT
===========================*/

export const getBanners = async () => {

  const snapshot = await getDocs(collection(db, "banners"));

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

};

export const addBanner = async (banner: any) => {

  return await addDoc(collection(db, "banners"), {
    ...banner,
    createdAt: serverTimestamp(),
  });

};

export const deleteBanner = async (id: string) => {

  await deleteDoc(doc(db, "banners", id));

};

/* ===========================
PRODUCT MANAGEMENT
(Admin products sellers reuse)
===========================*/

export const getProducts = async () => {

  const snapshot = await getDocs(collection(db, "products"));

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

};

export const addProduct = async (product: any) => {

  return await addDoc(collection(db, "products"), {
    ...product,
    createdAt: serverTimestamp(),
  });

};

export const updateProduct = async (id: string, data: any) => {

  await updateDoc(doc(db, "products", id), data);

};

export const deleteProduct = async (id: string) => {

  await deleteDoc(doc(db, "products", id));

};

/* ===========================
ORDER MANAGEMENT
===========================*/

export const getOrders = async () => {

  const snapshot = await getDocs(collection(db, "orders"));

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

};

export const updateOrderStatus = async (
  orderId: string,
  status: string
) => {

  await updateDoc(doc(db, "orders", orderId), {
    status,
    updatedAt: serverTimestamp(),
  });

};

/* ===========================
SELLER MANAGEMENT
===========================*/

export const getSellers = async () => {

  const snapshot = await getDocs(collection(db, "sellers"));

  return snapshot.docs.map((d) => ({
    id: d.id,
    ...d.data(),
  }));

};

export const approveSeller = async (id: string) => {

  await updateDoc(doc(db, "sellers", id), {
    status: "approved",
  });

};

export const blockSeller = async (id: string) => {

  await updateDoc(doc(db, "sellers", id), {
    status: "blocked",
  });

};

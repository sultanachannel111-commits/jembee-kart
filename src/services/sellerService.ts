import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  getDoc,
  serverTimestamp,
  query,
  where
} from "firebase/firestore";

/* ---------------------------
GET ADMIN PRODUCTS
Seller dashboard में दिखाने के लिए
----------------------------*/

export const getAdminProducts = async () => {

  const snapshot = await getDocs(collection(db,"products"));

  return snapshot.docs.map(d => ({
    id:d.id,
    ...d.data()
  }));

};

/* ---------------------------
SELLER ADD PRODUCT (RESELL)
----------------------------*/

export const addSellerProduct = async (
  sellerId:string,
  productId:string,
  resalePrice:number
) => {

  const productRef = doc(db,"products",productId);
  const productSnap = await getDoc(productRef);

  if(!productSnap.exists()){
    throw new Error("Product not found");
  }

  const product:any = productSnap.data();

  const basePrice = Number(product.basePrice || product.price || 0);

  const profit = resalePrice - basePrice;

  const sellerProduct = {
    sellerId,
    productId,
    productName:product.name,
    image:product.image,
    basePrice,
    resalePrice,
    profit,
    createdAt:serverTimestamp()
  };

  await addDoc(collection(db,"sellerProducts"), sellerProduct);

};

/* ---------------------------
GET SELLER PRODUCTS
----------------------------*/

export const getSellerProducts = async (sellerId:string) => {

  const q = query(
    collection(db,"sellerProducts"),
    where("sellerId","==",sellerId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map(d => ({
    id:d.id,
    ...d.data()
  }));

};

/* ---------------------------
DELETE SELLER PRODUCT
----------------------------*/

export const deleteSellerProduct = async (id:string) => {

  await deleteDoc(doc(db,"sellerProducts",id));

};

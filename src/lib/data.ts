import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { db } from "./firebase";
import type { Product, Order } from "./definitions";

export async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, "products");
  const productSnapshot = await getDocs(productsCol);
  const productList = productSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));
  return productList;
}

export async function getProductById(id: string): Promise<Product | null> {
  const productDocRef = doc(db, "products", id);
  const productDoc = await getDoc(productDocRef);
  if (productDoc.exists()) {
    return { id: productDoc.id, ...productDoc.data() } as Product;
  }
  return null;
}

export async function getOrdersByUserId(userId: string): Promise<Order[]> {
  const ordersCol = collection(db, "orders");
  const q = query(ordersCol, where("userId", "==", userId));
  const orderSnapshot = await getDocs(q);
  const orderList = orderSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Order));
  return orderList;
}

export async function getOrderByOrderId(orderId: string): Promise<Order | null> {
  const ordersCol = collection(db, "orders");
  const q = query(ordersCol, where("orderId", "==", orderId));
  const orderSnapshot = await getDocs(q);

  if (orderSnapshot.empty) {
    return null;
  }

  const orderDoc = orderSnapshot.docs[0];
  return { id: orderDoc.id, ...orderDoc.data() } as Order;
}

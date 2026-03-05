import { db } from "@/lib/firebase";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc
} from "firebase/firestore";

/* ---------------------------
CREATE PAYMENT REQUEST
----------------------------*/

export const createPayment = async (data: any) => {
  const paymentRef = await addDoc(collection(db, "payments"), {
    ...data,
    status: "pending",
    createdAt: new Date()
  });

  return paymentRef.id;
};

/* ---------------------------
VERIFY PAYMENT
(Admin manual verification)
----------------------------*/

export const verifyPayment = async (paymentId: string) => {
  await updateDoc(doc(db, "payments", paymentId), {
    status: "verified",
    verifiedAt: new Date()
  });
};

/* ---------------------------
CREATE ORDER AFTER PAYMENT
----------------------------*/

export const createOrderAfterPayment = async (paymentId: string) => {
  const paymentSnap = await getDoc(doc(db, "payments", paymentId));

  if (!paymentSnap.exists()) return;

  const paymentData: any = paymentSnap.data();

  const orderRef = await addDoc(collection(db, "orders"), {
    userId: paymentData.userId,
    productId: paymentData.productId,
    price: paymentData.amount,
    paymentId,
    orderStatus: "Pending",
    createdAt: new Date()
  });

  return orderRef.id;
};

/* ---------------------------
SEND ORDER TO QIKINK
----------------------------*/

export const sendOrderToQikink = async (orderId: string) => {

  const orderSnap = await getDoc(doc(db, "orders", orderId));

  if (!orderSnap.exists()) return;

  const orderData: any = orderSnap.data();

  const response = await fetch("/api/qikink-order", {
    method: "POST",
    body: JSON.stringify(orderData)
  });

  const result = await response.json();

  await updateDoc(doc(db, "orders", orderId), {
    orderStatus: "Printing",
    trackingId: result.trackingId || null
  });

  return result;
};

/* ---------------------------
10 MINUTE PAYMENT WINDOW
----------------------------*/

export const checkPaymentTimeout = async (
  paymentId: string
) => {

  const paymentSnap = await getDoc(doc(db, "payments", paymentId));

  if (!paymentSnap.exists()) return;

  const data: any = paymentSnap.data();

  const created = new Date(data.createdAt).getTime();
  const now = new Date().getTime();

  const diff = now - created;

  if (diff > 10 * 60 * 1000 && data.status === "pending") {

    await updateDoc(doc(db, "payments", paymentId), {
      status: "expired"
    });

  }
};

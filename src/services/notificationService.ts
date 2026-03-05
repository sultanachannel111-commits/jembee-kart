import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export const sendNotification = async (data:any) => {

  await addDoc(collection(db,"notifications"),{
    ...data,
    createdAt: serverTimestamp()
  });

};

export const sendOrderNotification = async (order:any) => {

  await sendNotification({
    type:"order",
    message:`New Order ${order.orderNumber}`,
    orderId:order.id
  });

};

export const sendPaymentNotification = async (payment:any) => {

  await sendNotification({
    type:"payment",
    message:`Payment Received ₹${payment.amount}`
  });

};

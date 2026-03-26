import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const logError = async (error: any) => {
  try {
    await addDoc(collection(db, "errors"), {
      message: error?.message || "Unknown error",
      stack: error?.stack || "",
      url: window.location.href,
      time: serverTimestamp(),
      userAgent: navigator.userAgent,
    });
  } catch (e) {
    console.log("Error saving failed");
  }
};

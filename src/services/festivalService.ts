import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const getFestival = async () => {

  const snap = await getDoc(doc(db,"settings","festival"));

  if(!snap.exists()) return null;

  return snap.data();

};

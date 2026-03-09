import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function getUserRole() {

const user = auth.currentUser;

if (!user) {
return null;
}

const snap = await getDoc(doc(db, "users", user.uid));

if (!snap.exists()) {
return null;
}

return snap.data();

}

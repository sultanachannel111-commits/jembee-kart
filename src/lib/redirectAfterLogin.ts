import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export async function redirectAfterLogin(router:any){

const user = auth.currentUser;

if(!user) return;

const snap = await getDoc(doc(db,"users",user.uid));

if(!snap.exists()) return;

const data = snap.data();

if(data.role === "admin"){
router.push("/admin");
}

else if(data.role === "seller"){
router.push("/seller/dashboard");
}

else{
router.push("/");
}

}

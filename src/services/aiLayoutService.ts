import { db } from "@/lib/firebase";
import { doc,getDoc,setDoc } from "firebase/firestore";

export const getLayoutMode = async () => {

const snap = await getDoc(
doc(db,"settings","aiLayout")
);

if(!snap.exists()){
return "auto";
}

return snap.data().mode;

};

export const setLayoutMode = async (mode:string)=>{

await setDoc(
doc(db,"settings","aiLayout"),
{
mode,
updatedAt:new Date()
}
);

};

import { db } from "@/lib/firebase";
import { doc,getDoc,setDoc } from "firebase/firestore";


export const getHomepageLayout = async () => {

const snap = await getDoc(
doc(db,"settings","homepageLayout")
);

if(!snap.exists()){

return [
"banner",
"festival",
"categories",
"offers",
"trending",
"products"
];

}

return snap.data().sections;

};


export const saveHomepageLayout = async (sections:any)=>{

await setDoc(
doc(db,"settings","homepageLayout"),
{
sections,
updatedAt:new Date()
}
);

};

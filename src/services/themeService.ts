import { db } from "@/lib/firebase";
import {
doc,
getDoc,
setDoc
} from "firebase/firestore";

/* ---------------------------
GET THEME
----------------------------*/

export const getTheme = async () => {

const snap = await getDoc(
doc(db,"settings","theme")
);

if(!snap.exists()){

return {
background:"#ffffff",
header:"#ec4899",
button:"#ec4899",
card:"#ffffff"
};

}

return snap.data();

};


/* ---------------------------
SAVE THEME
----------------------------*/

export const saveTheme = async (theme:any) => {

await setDoc(
doc(db,"settings","theme"),
{
...theme,
updatedAt:new Date()
}
);

};


/* ---------------------------
RESET THEME
----------------------------*/

export const resetTheme = async () => {

await setDoc(
doc(db,"settings","theme"),
{
background:"#ffffff",
header:"#ec4899",
button:"#ec4899",
card:"#ffffff",
updatedAt:new Date()
}
);

};

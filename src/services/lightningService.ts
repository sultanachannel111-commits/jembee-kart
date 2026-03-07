import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";

export const getLightningDeals = async () => {

const snap = await getDocs(collection(db,"products"));

const deals:any[] = [];

snap.forEach(doc => {

const data:any = doc.data();

if(data.lightningDeal){
deals.push({
id:doc.id,
...data
});
}

});

return deals;

};

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function getAiOffers(){

const snap = await getDocs(collection(db,"aiOffers"));

return snap.docs.map(doc=>({
id:doc.id,
...doc.data()
}));

}


// trending products

export async function detectTrendingProducts(){

const snap = await getDocs(collection(db,"products"));

const trending:any[]=[];

snap.docs.forEach(d=>{

const p:any = d.data();

if(p.views && p.views > 100){
trending.push({
id:d.id,
...p
});
}

});

return trending;

}


// clearance products

export async function detectClearanceProducts(){

const snap = await getDocs(collection(db,"products"));

const clearance:any[]=[];

snap.docs.forEach(d=>{

const p:any = d.data();

if(p.sales && p.sales < 5){
clearance.push({
id:d.id,
...p
});
}

});

return clearance;

}

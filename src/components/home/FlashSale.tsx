"use client";

import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function FlashSale(){

const [timeLeft,setTimeLeft] = useState<any>(null);
const [active,setActive] = useState(false);

useEffect(()=>{

const loadFlashSale = async ()=>{

const snap = await getDoc(doc(db,"settings","flashSale"));

if(!snap.exists()) return;

const data = snap.data();

setActive(data.active);

const end = new Date(data.endTime).getTime();

const timer = setInterval(()=>{

const diff = end - new Date().getTime();

if(diff<=0){
setTimeLeft(null);
clearInterval(timer);
}else{

setTimeLeft({
hours:Math.floor(diff/(1000*60*60)),
minutes:Math.floor((diff/(1000*60))%60),
seconds:Math.floor((diff/1000)%60)
});

}

},1000);

};

loadFlashSale();

},[]);

if(!active) return null;

return(

<div className="bg-red-500 text-white rounded-xl p-4 flex justify-between items-center">

<h2 className="font-bold">
🔥 Flash Sale
</h2>

<div className="flex gap-3 font-bold">

<span>{timeLeft?.hours || 0}h</span>
<span>{timeLeft?.minutes || 0}m</span>
<span>{timeLeft?.seconds || 0}s</span>

</div>

</div>

);

}

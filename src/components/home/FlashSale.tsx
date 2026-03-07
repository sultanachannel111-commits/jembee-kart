"use client";

import { useEffect,useState } from "react";
import { doc,getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function FlashSale(){

const [timeLeft,setTimeLeft] = useState<any>(null);
const [active,setActive] = useState(false);

useEffect(()=>{

loadFlashSale();

},[]);

const loadFlashSale = async ()=>{

const snap = await getDoc(doc(db,"settings","flashSale"));

if(!snap.exists()) return;

const data = snap.data();

setActive(data.active);

const end = new Date(data.endTime).getTime();

setInterval(()=>{

const diff = end - new Date().getTime();

if(diff<=0){

setTimeLeft(null);

}else{

setTimeLeft({
hours:Math.floor(diff/(1000*60*60)),
minutes:Math.floor((diff/(1000*60))%60),
seconds:Math.floor((diff/1000)%60)
});

}

},1000);

};

if(!active || !timeLeft) return null;

return(

<div className="bg-red-500 text-white rounded-xl p-4 flex justify-between items-center">

<h2 className="font-bold">
🔥 Flash Sale
</h2>

<div className="flex gap-3 font-bold">

<span>{timeLeft.hours}h</span>
<span>{timeLeft.minutes}m</span>
<span>{timeLeft.seconds}s</span>

</div>

</div>

);

}

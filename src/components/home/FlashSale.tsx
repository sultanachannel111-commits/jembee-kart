"use client";

import { useEffect, useState } from "react";

export default function FlashSale() {

const [time,setTime] = useState({
hours:2,
minutes:59,
seconds:59
});

useEffect(()=>{

const timer = setInterval(()=>{

setTime(prev=>{

let {hours,minutes,seconds} = prev;

if(seconds>0){

seconds--;

}else{

seconds=59;

if(minutes>0){

minutes--;

}else{

minutes=59;

hours--;

}

}

return {hours,minutes,seconds};

});

},1000);

return ()=>clearInterval(timer);

},[]);

return(

<div className="bg-red-500 text-white rounded-xl p-4 flex justify-between items-center">

<h2 className="font-bold">
🔥 Flash Sale
</h2>

<div className="flex gap-3 font-bold">

<span>{time.hours}h</span>
<span>{time.minutes}m</span>
<span>{time.seconds}s</span>

</div>

</div>

);

}

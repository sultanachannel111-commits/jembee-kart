"use client";

import { useEffect, useState } from "react";

export default function FlashSale(){

const [time,setTime] = useState({
hours:2,
minutes:59,
seconds:59
});

useEffect(()=>{

const timer = setInterval(()=>{

setTime(prev=>{

let {hours,minutes,seconds} = prev;

if(hours===0 && minutes===0 && seconds===0){
return prev;
}

if(seconds>0){

seconds--;

}else{

seconds=59;

if(minutes>0){

minutes--;

}else{

minutes=59;

if(hours>0) hours--;

}

}

return {hours,minutes,seconds};

});

},1000);

return ()=>clearInterval(timer);

},[]);

return(

<div className="bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-xl p-4 flex justify-between items-center shadow">

<h2 className="font-bold text-lg">
🔥 Flash Sale
</h2>

<div className="flex gap-3 font-bold text-lg">

<span>{time.hours}h</span>
<span>{time.minutes}m</span>
<span>{time.seconds}s</span>

</div>

</div>

);

}

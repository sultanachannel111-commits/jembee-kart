"use client";

export default function FestivalBanner({
festival,
timeLeft
}: any){

if(!festival) return null;

return(

<div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl p-4">

<h2 className="font-bold text-lg">
{festival.title}
</h2>

{timeLeft && (
<div className="flex gap-4 mt-2 font-bold">

<span>{timeLeft.hours}h</span>
<span>{timeLeft.minutes}m</span>
<span>{timeLeft.seconds}s</span>

</div>
)}

</div>

);

}

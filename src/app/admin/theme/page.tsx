"use client";

import { useEffect,useState } from "react";
import { getTheme,saveTheme } from "@/services/themeService";

export default function ThemePage(){

const [background,setBackground]=useState("#ffffff");
const [header,setHeader]=useState("#ec4899");
const [button,setButton]=useState("#ec4899");
const [card,setCard]=useState("#ffffff");

const [loading,setLoading]=useState(true);


/* LOAD THEME */

useEffect(()=>{

async function load(){

const theme:any = await getTheme();

setBackground(theme.background);
setHeader(theme.header);
setButton(theme.button);
setCard(theme.card);

setLoading(false);

}

load();

},[]);


/* SAVE */

async function save(){

await saveTheme({
background,
header,
button,
card
});

alert("Theme Updated");

}


if(loading){

return(
<div className="p-6">
Loading Theme...
</div>
);

}


return(

<div className="p-6 space-y-8">


{/* TITLE */}

<h1 className="text-3xl font-bold text-purple-600">
Website Theme Builder
</h1>



{/* ------------------------
HOMEPAGE PREVIEW
------------------------ */}

<div
className="rounded-xl shadow p-6"
style={{background}}
>

{/* HEADER */}

<div
className="text-white p-4 rounded mb-6"
style={{background:header}}
>

<h2 className="font-bold text-lg">
JembeeKart
</h2>

</div>


{/* CATEGORY GRID */}

<div className="grid grid-cols-4 gap-4">

<div
className="p-4 rounded text-center shadow"
style={{background:card}}
>
Tshirts
</div>

<div
className="p-4 rounded text-center shadow"
style={{background:card}}
>
Hoodies
</div>

<div
className="p-4 rounded text-center shadow"
style={{background:card}}
>
Caps
</div>

<div
className="p-4 rounded text-center shadow"
style={{background:card}}
>
Mugs
</div>

</div>


{/* PRODUCT CARD */}

<div
className="mt-6 p-4 rounded shadow"
style={{background:card}}
>

<p className="font-semibold">
Sample Product
</p>

<p className="text-pink-600 font-bold">
₹499
</p>

<button
className="mt-2 text-white px-4 py-2 rounded"
style={{background:button}}
>

Buy Now

</button>

</div>

</div>



{/* ------------------------
THEME CONTROLS
------------------------ */}

<div className="grid md:grid-cols-2 gap-6">


<div className="bg-white p-4 rounded shadow">

<p className="font-semibold mb-2">
Background Color
</p>

<input
type="color"
value={background}
onChange={(e)=>setBackground(e.target.value)}
/>

</div>


<div className="bg-white p-4 rounded shadow">

<p className="font-semibold mb-2">
Header Color
</p>

<input
type="color"
value={header}
onChange={(e)=>setHeader(e.target.value)}
/>

</div>


<div className="bg-white p-4 rounded shadow">

<p className="font-semibold mb-2">
Button Color
</p>

<input
type="color"
value={button}
onChange={(e)=>setButton(e.target.value)}
/>

</div>


<div className="bg-white p-4 rounded shadow">

<p className="font-semibold mb-2">
Card Color
</p>

<input
type="color"
value={card}
onChange={(e)=>setCard(e.target.value)}
/>

</div>

</div>



{/* SAVE BUTTON */}

<button
onClick={save}
className="bg-purple-600 text-white px-6 py-2 rounded"
>

Save Theme

</button>


</div>

);

}

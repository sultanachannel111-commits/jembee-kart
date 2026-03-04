"use client";

import { useState, useEffect } from "react";

export default function ThemeSettings(){

const [bg,setBg]=useState("#ffffff");
const [header,setHeader]=useState("#000000");
const [button,setButton]=useState("#e91e63");

useEffect(()=>{

const saved = localStorage.getItem("theme");

if(saved){

const t = JSON.parse(saved);

setBg(t.bg);
setHeader(t.header);
setButton(t.button);

}

},[]);

function saveTheme(){

const theme={
bg,
header,
button
};

localStorage.setItem("theme",JSON.stringify(theme));

document.documentElement.style.setProperty("--bg",bg);
document.documentElement.style.setProperty("--header",header);
document.documentElement.style.setProperty("--button",button);

alert("Theme Saved");

}

function setTheme(bg,header,button){

setBg(bg);
setHeader(header);
setButton(button);

}

return(

<div className="p-6 space-y-6"><h1 className="text-3xl font-bold">
Website Theme Control
</h1>{/* COLOR PICKERS */}

<div className="space-y-3"><div>
Background Color
<input
type="color"
value={bg}
onChange={(e)=>setBg(e.target.value)}
className="ml-3"
/>
</div><div>
Header Color
<input
type="color"
value={header}
onChange={(e)=>setHeader(e.target.value)}
className="ml-3"
/>
</div><div>
Button Color
<input
type="color"
value={button}
onChange={(e)=>setButton(e.target.value)}
className="ml-3"
/>
</div></div>{/* PREVIEW */}

<div className="border p-6 rounded shadow"><h2 className="font-bold mb-3">
Live Preview
</h2><div
style={{
background:bg,
padding:"20px"
}}
><div
style={{
background:header,
color:"#fff",
padding:"10px"
}}
>
Header Preview
</div><button
style={{
background:button,
color:"#fff",
padding:"10px 20px",
marginTop:"10px"
}}


Button Preview
</button>

</div></div>{/* PRESET COLOR THEMES */}

<div className="space-y-2"><h2 className="font-bold">
Color Themes
</h2><button
onClick={()=>setTheme("#ffffff","#000000","#e91e63")}
className="border px-3 py-2 mr-2"


Classic
</button>

<button
onClick={()=>setTheme("#f5f5f5","#3f51b5","#ff9800")}
className="border px-3 py-2 mr-2"


Modern
</button>

<button
onClick={()=>setTheme("#1e1e1e","#000000","#4caf50")}
className="border px-3 py-2 mr-2 text-white"


Dark
</button>

</div><button
onClick={saveTheme}
className="bg-pink-600 text-white px-4 py-2 rounded"


Save Theme
</button>

</div>);

}

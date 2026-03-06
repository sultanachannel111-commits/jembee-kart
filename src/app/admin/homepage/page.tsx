"use client";

import { useEffect,useState } from "react";
import {
getHomepageLayout,
saveHomepageLayout
} from "@/services/layoutService";


export default function HomepageBuilder(){

const [sections,setSections]=useState<string[]>([]);
const [loading,setLoading]=useState(true);


useEffect(()=>{

async function load(){

const data = await getHomepageLayout();

setSections(data);

setLoading(false);

}

load();

},[]);



function moveUp(index:number){

if(index===0) return;

const newSections=[...sections];

[newSections[index],newSections[index-1]] =
[newSections[index-1],newSections[index]];

setSections(newSections);

}


function moveDown(index:number){

if(index===sections.length-1) return;

const newSections=[...sections];

[newSections[index],newSections[index+1]] =
[newSections[index+1],newSections[index]];

setSections(newSections);

}


async function save(){

await saveHomepageLayout(sections);

alert("Homepage Layout Updated");

}



if(loading){

return(
<div className="p-6">
Loading Layout...
</div>
);

}


return(

<div className="p-6 space-y-6">

<h1 className="text-3xl font-bold text-purple-600">
Homepage Builder
</h1>

<p className="text-gray-500">
Control homepage section order
</p>


<div className="space-y-3">

{sections.map((s,i)=>(

<div
key={i}
className="bg-white p-4 rounded shadow flex justify-between items-center"
>

<div className="font-semibold">

{s}

</div>


<div className="flex gap-2">

<button
onClick={()=>moveUp(i)}
className="bg-gray-200 px-3 py-1 rounded"
>

↑

</button>


<button
onClick={()=>moveDown(i)}
className="bg-gray-200 px-3 py-1 rounded"
>

↓

</button>

</div>

</div>

))}

</div>


<button
onClick={save}
className="bg-purple-600 text-white px-5 py-2 rounded"
>

Save Layout

</button>


</div>

);

}

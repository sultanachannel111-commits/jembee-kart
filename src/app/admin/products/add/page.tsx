"use client";

import { useState,useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddProduct(){

const router = useRouter();

const [name,setName] = useState("");
const [category,setCategory] = useState("");
const [basePrice,setBasePrice] = useState("");
const [sellPrice,setSellPrice] = useState("");

const [image,setImage] = useState("");
const [front,setFront] = useState("");
const [back,setBack] = useState("");
const [side,setSide] = useState("");
const [model,setModel] = useState("");
const [design,setDesign] = useState("");
const [mockup,setMockup] = useState("");

const [variations,setVariations] = useState<any[]>([]);


useEffect(()=>{

if(typeof window !== "undefined"){

const params = new URLSearchParams(window.location.search);

const img = params.get("image");

if(img){
setImage(img);
}

}

},[]);


const addVariation = ()=>{

setVariations([
...variations,
{
type:"",
options:[""]
}
]);

};


const updateVariationType = (index:number,value:string)=>{

const updated = [...variations];
updated[index].type = value;
setVariations(updated);

};


const updateOption = (vIndex:number,oIndex:number,value:string)=>{

const updated = [...variations];
updated[vIndex].options[oIndex] = value;
setVariations(updated);

};


const addOption = (index:number)=>{

const updated = [...variations];
updated[index].options.push("");
setVariations(updated);

};


return(

<div className="p-6 max-w-2xl">

<h1 className="text-2xl font-bold mb-6">
Add Product
</h1>


{/* PRODUCT NAME */}

<input
placeholder="Product Name"
value={name}
onChange={(e)=>setName(e.target.value)}
className="border p-2 w-full mb-3"
/>


{/* CATEGORY */}

<input
placeholder="Category"
value={category}
onChange={(e)=>setCategory(e.target.value)}
className="border p-2 w-full mb-3"
/>


{/* PRODUCT IMAGE */}

<div className="mb-3">

<input
placeholder="Product Image Link"
value={image}
readOnly
className="border p-2 w-full mb-2"
/>

<button
type="button"
onClick={()=>router.push("/admin/upload-image")}
className="bg-blue-600 text-white px-4 py-2 rounded w-full"
>

Upload Product Image

</button>

</div>


{/* FRONT IMAGE */}

<div className="mb-3">

<input
placeholder="Front Image Link"
value={front}
readOnly
className="border p-2 w-full mb-2"
/>

<button
type="button"
onClick={()=>router.push("/admin/upload-image")}
className="bg-blue-600 text-white px-4 py-2 rounded w-full"
>

Upload Front Image

</button>

</div>


{/* BACK IMAGE */}

<div className="mb-3">

<input
placeholder="Back Image Link"
value={back}
readOnly
className="border p-2 w-full mb-2"
/>

<button
type="button"
onClick={()=>router.push("/admin/upload-image")}
className="bg-blue-600 text-white px-4 py-2 rounded w-full"
>

Upload Back Image

</button>

</div>


{/* SIDE IMAGE */}

<div className="mb-3">

<input
placeholder="Side Image Link"
value={side}
readOnly
className="border p-2 w-full mb-2"
/>

<button
type="button"
onClick={()=>router.push("/admin/upload-image")}
className="bg-blue-600 text-white px-4 py-2 rounded w-full"
>

Upload Side Image

</button>

</div>


{/* MODEL IMAGE */}

<div className="mb-3">

<input
placeholder="Model Image Link"
value={model}
readOnly
className="border p-2 w-full mb-2"
/>

<button
type="button"
onClick={()=>router.push("/admin/upload-image")}
className="bg-blue-600 text-white px-4 py-2 rounded w-full"
>

Upload Model Image

</button>

</div>


{/* DESIGN */}

<input
placeholder="Design Link"
value={design}
onChange={(e)=>setDesign(e.target.value)}
className="border p-2 w-full mb-3"
/>


{/* MOCKUP */}

<input
placeholder="Mockup Link"
value={mockup}
onChange={(e)=>setMockup(e.target.value)}
className="border p-2 w-full mb-3"
/>


{/* PRICE */}

<input
placeholder="Qikink Base Price"
value={basePrice}
onChange={(e)=>setBasePrice(e.target.value)}
className="border p-2 w-full mb-3"
/>

<input
placeholder="Admin Sell Price"
value={sellPrice}
onChange={(e)=>setSellPrice(e.target.value)}
className="border p-2 w-full mb-3"
/>


{/* VARIATIONS */}

<div className="mt-6">

<h2 className="font-bold mb-3">
Variations
</h2>


{variations.map((v,index)=>(

<div key={index} className="border p-4 mb-4 rounded">


<select
value={v.type}
onChange={(e)=>updateVariationType(index,e.target.value)}
className="border p-2 w-full mb-3"
>

<option value="">Select Variation</option>

<option value="Size">Size</option>
<option value="Color">Color</option>
<option value="Number">Number</option>
<option value="Age">Age</option>
<option value="Custom">Custom</option>

</select>


{v.options.map((o:any,oIndex:number)=>(

<input
key={oIndex}
placeholder="Option (S,M,L / Black / 5-7 Years)"
value={o}
onChange={(e)=>updateOption(index,oIndex,e.target.value)}
className="border p-2 w-full mb-2"
/>

))}


<button
onClick={()=>addOption(index)}
className="bg-gray-200 px-3 py-1 rounded text-sm"
>

Add Option

</button>

</div>

))}


<button
onClick={addVariation}
className="bg-blue-600 text-white px-4 py-2 rounded"
>

Add Variation

</button>

</div>


{/* SAVE PRODUCT */}

<button
className="bg-green-600 text-white px-5 py-2 rounded mt-6"
>

Save Product

</button>


</div>

);

}

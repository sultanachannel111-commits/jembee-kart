"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
addDoc,
collection,
serverTimestamp,
getDocs
} from "firebase/firestore";

import {
Package,
Image,
Layers,
IndianRupee,
PlusCircle
} from "lucide-react";

export default function AdminQikinkProducts(){

const [name,setName] = useState("");
const [qikinkId,setQikinkId] = useState("");

const [sku,setSku] = useState("");
const [printTypeId,setPrintTypeId] = useState("");

const [image,setImage] = useState("");

const [frontImage,setFrontImage] = useState("");
const [backImage,setBackImage] = useState("");
const [sideImage,setSideImage] = useState("");
const [modelImage,setModelImage] = useState("");

const [designLink,setDesignLink] = useState("");
const [mockupLink,setMockupLink] = useState("");

const [basePrice,setBasePrice] = useState("");
const [sellPrice,setSellPrice] = useState("");

const [description,setDescription] = useState("");

const [stock,setStock] = useState("");

const [category,setCategory] = useState("");
const [categories,setCategories] = useState<any[]>([]);

const [type,setType] = useState("");
const [options,setOptions] = useState("");

const profit =
Number(sellPrice || 0) - Number(basePrice || 0);

useEffect(()=>{
loadCategories();
},[]);

const loadCategories = async()=>{

try{

const snap = await getDocs(
collection(db,"qikinkCategories")
);

const list = snap.docs.map(doc=>({
id:doc.id,
...doc.data()
}));

setCategories(list);

}catch(err){
console.log(err);
}

};

const saveProduct = async()=>{

if(!name || !qikinkId || !category){
alert("Please fill required fields");
return;
}

try{

await addDoc(collection(db,"products"),{

name,
qikinkId,
sku,
printTypeId,

category,

image,
frontImage,
backImage,
sideImage,
modelImage,

designLink,
mockupLink,

basePrice:Number(basePrice),
sellPrice:Number(sellPrice),
profit,

description,

stock:Number(stock),

variations:{
type:type,
options: options ? options.split(",") : []
},

supplier:"qikink",

createdAt:serverTimestamp()

});

alert("Product Added Successfully 🎉");

setName("");
setQikinkId("");
setSku("");
setPrintTypeId("");

setImage("");
setFrontImage("");
setBackImage("");
setSideImage("");
setModelImage("");

setDesignLink("");
setMockupLink("");

setBasePrice("");
setSellPrice("");

setDescription("");
setStock("");

setType("");
setOptions("");

}catch(err){

console.log(err);
alert("Error adding product");

}

};

return(

<div className="p-8 bg-gray-100 min-h-screen">

<div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">

<h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
<Package className="text-purple-600"/>
Add Qikink Product
</h1>

<div className="space-y-5">

{/* PRODUCT NAME */}

<div>

<label className="font-semibold mb-1 block">
Product Name
</label>

<input
value={name}
onChange={(e)=>setName(e.target.value)}
placeholder="Oversized T Shirt"
className="border w-full p-3 rounded-lg"
/>

</div>


{/* QIKINK PRODUCT ID */}

<div>

<label className="font-semibold mb-1 block">
Qikink Product ID
</label>

<input
value={qikinkId}
onChange={(e)=>setQikinkId(e.target.value)}
placeholder="QK1022"
className="border w-full p-3 rounded-lg"
/>

</div>


{/* SKU */}

<div>

<label className="font-semibold mb-1 block">
SKU
</label>

<input
value={sku}
onChange={(e)=>setSku(e.target.value)}
placeholder="QK1022-BLK-M"
className="border w-full p-3 rounded-lg"
/>

</div>


{/* PRINT TYPE */}

<div>

<label className="font-semibold mb-1 block">
Print Type ID
</label>

<input
value={printTypeId}
onChange={(e)=>setPrintTypeId(e.target.value)}
placeholder="1"
className="border w-full p-3 rounded-lg"
/>

</div>


{/* CATEGORY */}

<div>

<label className="font-semibold mb-1 block flex items-center gap-2">
<Layers size={18}/>
Qikink Category
</label>

<select
value={category}
onChange={(e)=>setCategory(e.target.value)}
className="border w-full p-3 rounded-lg"
>

<option value="">Select Category</option>

{categories.map((c:any)=>(
<option key={c.id} value={c.name}>
{c.name}
</option>
))}

</select>

</div>


{/* MAIN IMAGE */}

<div>

<label className="font-semibold mb-1 block flex items-center gap-2">
<Image size={18}/>
Product Image
</label>

<input
value={image}
readOnly
onClick={()=>window.location.href="/admin/upload-image"}
placeholder="Click to upload product image"
className="border w-full p-3 rounded-lg cursor-pointer bg-gray-100"
/>

</div>


{/* FRONT IMAGE */}

<input
value={frontImage}
readOnly
onClick={()=>window.location.href="/admin/upload-image"}
placeholder="Click to upload front image"
className="border w-full p-3 rounded-lg cursor-pointer bg-gray-100"
/>

{/* BACK IMAGE */}

<input
value={backImage}
readOnly
onClick={()=>window.location.href="/admin/upload-image"}
placeholder="Click to upload back image"
className="border w-full p-3 rounded-lg cursor-pointer bg-gray-100"
/>

{/* SIDE IMAGE */}

<input
value={sideImage}
readOnly
onClick={()=>window.location.href="/admin/upload-image"}
placeholder="Click to upload side image"
className="border w-full p-3 rounded-lg cursor-pointer bg-gray-100"
/>

{/* MODEL IMAGE */}

<input
value={modelImage}
readOnly
onClick={()=>window.location.href="/admin/upload-image"}
placeholder="Click to upload model image"
className="border w-full p-3 rounded-lg cursor-pointer bg-gray-100"
/>


{/* DESIGN LINK */}

<input
value={designLink}
onChange={(e)=>setDesignLink(e.target.value)}
placeholder="Design Link"
className="border w-full p-3 rounded-lg"
/>

{/* MOCKUP LINK */}

<input
value={mockupLink}
onChange={(e)=>setMockupLink(e.target.value)}
placeholder="Mockup Link"
className="border w-full p-3 rounded-lg"
/>


{/* BASE PRICE */}

<div>

<label className="font-semibold mb-1 block flex items-center gap-2">
<IndianRupee size={18}/>
Qikink Base Price
</label>

<input
type="number"
value={basePrice}
onChange={(e)=>setBasePrice(e.target.value)}
placeholder="100"
className="border w-full p-3 rounded-lg"
/>

</div>


{/* SELL PRICE */}

<div>

<label className="font-semibold mb-1 block">
Sell Price
</label>

<input
type="number"
value={sellPrice}
onChange={(e)=>setSellPrice(e.target.value)}
placeholder="299"
className="border w-full p-3 rounded-lg"
/>

</div>


{/* PROFIT */}

<div>

<label className="font-semibold mb-1 block">
Profit
</label>

<input
value={profit}
readOnly
className="border w-full p-3 rounded-lg bg-gray-100"
/>

</div>


{/* DESCRIPTION */}

<textarea
value={description}
onChange={(e)=>setDescription(e.target.value)}
placeholder="Product Description"
className="border w-full p-3 rounded-lg"
/>


{/* STOCK */}

<input
type="number"
value={stock}
onChange={(e)=>setStock(e.target.value)}
placeholder="Stock Quantity"
className="border w-full p-3 rounded-lg"
/>


{/* VARIATION */}

<select
value={type}
onChange={(e)=>setType(e.target.value)}
className="border p-3 w-full rounded-lg"
>

<option value="">Select Variation</option>
<option value="Size">Size</option>
<option value="Color">Color</option>

</select>


<input
value={options}
onChange={(e)=>setOptions(e.target.value)}
placeholder="Options (S,M,L / Red,Blue)"
className="border p-3 w-full rounded-lg"
/>


<button
onClick={saveProduct}
className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl mt-4"
>

<PlusCircle size={20}/>
Add Product

</button>

</div>

</div>

</div>

);

}

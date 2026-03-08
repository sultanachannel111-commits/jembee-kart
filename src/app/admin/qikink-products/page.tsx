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
  Tag,
  Layers,
  IndianRupee,
  PlusCircle
} from "lucide-react";

export default function AdminQikinkProducts() {

  const [name,setName] = useState("");
  const [qikinkId,setQikinkId] = useState("");
  const [image,setImage] = useState("");
  const [basePrice,setBasePrice] = useState("");
  const [minPrice,setMinPrice] = useState("");
  const [category,setCategory] = useState("");
  const [categories,setCategories] = useState<any[]>([]);
  const [variations,setVariations] = useState("");

  /* =========================
     LOAD CATEGORIES
  ========================= */

  useEffect(()=>{
    loadCategories();
  },[]);

  const loadCategories = async ()=>{

    const snap = await getDocs(
      collection(db,"qikinkCategories")
    );

    setCategories(
      snap.docs.map(d=>({
        id:d.id,
        ...d.data()
      }))
    );

  };

  /* =========================
     SAVE PRODUCT
  ========================= */

  const saveProduct = async ()=>{

    if(!name || !qikinkId || !category){
      alert("Please fill required fields");
      return;
    }

    await addDoc(
      collection(db,"adminProducts"),
      {
        name,
        qikinkId,
        category,
        image,
        basePrice:Number(basePrice),
        minPrice:Number(minPrice),
        variations:variations.split(","),
        createdAt:serverTimestamp()
      }
    );

    setName("");
    setQikinkId("");
    setImage("");
    setBasePrice("");
    setMinPrice("");
    setVariations("");

    alert("Product Added Successfully 🎉");

  };

  return (

<div className="p-8 bg-gray-100 min-h-screen">

<div className="max-w-3xl mx-auto bg-white shadow-xl rounded-2xl p-8">

<h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
<Package className="text-purple-600"/>
Add Qikink Product
</h1>

<div className="space-y-5">

{/* PRODUCT NAME */}

<div>

<label className="flex items-center gap-2 font-semibold mb-1">
<Package size={18}/>
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

<label className="flex items-center gap-2 font-semibold mb-1">
<Tag size={18}/>
Qikink Product ID
</label>

<input
value={qikinkId}
onChange={(e)=>setQikinkId(e.target.value)}
placeholder="QK1022"
className="border w-full p-3 rounded-lg"
/>

</div>


{/* CATEGORY */}

<div>

<label className="flex items-center gap-2 font-semibold mb-1">
<Layers size={18}/>
Qikink Category
</label>

<select
value={category}
onChange={(e)=>setCategory(e.target.value)}
className="border w-full p-3 rounded-lg"
>

<option value="">
Select Category
</option>

{categories.map((c:any)=>(
<option key={c.id} value={c.name}>
{c.name}
</option>
))}

</select>

</div>


{/* IMAGE LINK */}

<div>

<label className="flex items-center gap-2 font-semibold mb-1">
<Image size={18}/>
Product Image Link
</label>

<input
value={image}
onChange={(e)=>setImage(e.target.value)}
placeholder="https://image-link.jpg"
className="border w-full p-3 rounded-lg"
/>

</div>


{/* IMAGE PREVIEW */}

{image && (

<div className="flex justify-center">

<img
src={image}
className="w-28 h-28 rounded-xl shadow object-cover"
/>

</div>

)}


{/* BASE PRICE */}

<div>

<label className="flex items-center gap-2 font-semibold mb-1">
<IndianRupee size={18}/>
Qikink Base Price
</label>

<input
value={basePrice}
onChange={(e)=>setBasePrice(e.target.value)}
placeholder="180"
className="border w-full p-3 rounded-lg"
/>

</div>


{/* MIN SELL PRICE */}

<div>

<label className="flex items-center gap-2 font-semibold mb-1">
<IndianRupee size={18}/>
Minimum Sell Price
</label>

<input
value={minPrice}
onChange={(e)=>setMinPrice(e.target.value)}
placeholder="299"
className="border w-full p-3 rounded-lg"
/>

</div>


{/* VARIATIONS */}

<div>

<label className="flex items-center gap-2 font-semibold mb-1">
<Layers size={18}/>
Variations
</label>

<input
value={variations}
onChange={(e)=>setVariations(e.target.value)}
placeholder="S,M,L / Red,Blue / 5-7 Years"
className="border w-full p-3 rounded-lg"
/>

</div>


{/* BUTTON */}

<button
onClick={saveProduct}
className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl mt-4"
>

<PlusCircle size={20}/>
Add Product

</button>

</div>

</div>

</div>

);

}

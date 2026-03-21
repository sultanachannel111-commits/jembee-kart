"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
addDoc,
collection,
serverTimestamp,
getDocs
} from "firebase/firestore";

import { Package, PlusCircle, Trash2 } from "lucide-react";

const SIZE_OPTIONS = ["S","M","L","XL","XXL"];

export default function AdminQikinkProducts() {

const [name,setName] = useState("");
const [qikinkId,setQikinkId] = useState("");
const [sku,setSku] = useState("");
const [printTypeId,setPrintTypeId] = useState("");

const [category,setCategory] = useState("");
const [categories,setCategories] = useState<any[]>([]);

const [description,setDescription] = useState("");
const [designLink,setDesignLink] = useState("");
const [mockupLink,setMockupLink] = useState("");

// 🔥 VARIATIONS FULL
const [variations,setVariations] = useState<any[]>([
{
color:"",
mainImage:"",
frontImage:"",
backImage:"",
sideImage:"",
modelImage:"",
basePrice:"",
sellPrice:"",
sizes:[{ size:"", price:"", stock:"" }]
}
]);

// CATEGORY LOAD
useEffect(()=>{
loadCategories();
},[]);

const loadCategories = async()=>{
const snap = await getDocs(collection(db,"qikinkCategories"));
setCategories(snap.docs.map(doc=>({
id:doc.id,
...doc.data()
})));
};

// 🔥 IMAGE COMPRESS
const compressImage = (file:any):Promise<string>=>{
return new Promise((resolve)=>{
const reader = new FileReader();
reader.readAsDataURL(file);

reader.onload = (e:any)=>{  
    const img = new Image();  
    img.src = e.target.result;  

    img.onload = ()=>{  
      const canvas = document.createElement("canvas");  
      const ctx = canvas.getContext("2d");  

      const maxWidth = 800;  
      const scale = maxWidth / img.width;  

      canvas.width = maxWidth;  
      canvas.height = img.height * scale;  

      ctx?.drawImage(img,0,0,canvas.width,canvas.height);  

      resolve(canvas.toDataURL("image/jpeg",0.6));  
    };  
  };  
});

};

const handleImage = async(e:any,i:number,field:string)=>{
const file = e.target.files[0];
const compressed = await compressImage(file);

const updated = [...variations];  
updated[i][field] = compressed;  
setVariations(updated);

};

// ADD COLOR
const addColor = ()=>{
setVariations([
...variations,
{
color:"",
mainImage:"",
frontImage:"",
backImage:"",
sideImage:"",
modelImage:"",
basePrice:"",
sellPrice:"",
sizes:[{ size:"", price:"", stock:"" }]
}
]);
};

// ADD SIZE
const addSize = (i:number)=>{
const updated = [...variations];
updated[i].sizes.push({ size:"", price:"", stock:"" });
setVariations(updated);
};

// UPDATE
const updateColor = (i:number,field:string,value:any)=>{
const updated = [...variations];
updated[i][field] = value;
setVariations(updated);
};

const updateSize = (i:number,j:number,field:string,value:any)=>{
const updated = [...variations];
updated[i].sizes[j][field] = value;
setVariations(updated);
};

const removeColor = (i:number)=>{
setVariations(variations.filter((_,idx)=>idx!==i));
};

// SAVE
const saveProduct = async()=>{

const finalVariations = variations.map(v=>({  
  color: v.color,  

  images:{  
    main: v.mainImage,  
    front: v.frontImage,  
    back: v.backImage,  
    side: v.sideImage,  
    model: v.modelImage  
  },  

  basePrice: Number(v.basePrice),  
  sellPrice: Number(v.sellPrice),  

  sizes: v.sizes.map((s:any)=>({  
    size:s.size,  
    price:Number(s.price),  
    stock:Number(s.stock)  
  }))  
}));  

await addDoc(collection(db,"products"),{  

  name,  
  qikinkId,  
  sku,  
  printTypeId,  
  category,  

  designLink,  
  mockupLink,  
  description,  

  variations: finalVariations,  

  createdAt:serverTimestamp()  

});  

alert("🔥 Product Added Successfully");

};

return(
<div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">

<div className="max-w-4xl mx-auto bg-white p-6 rounded-3xl shadow-2xl">  

    <h1 className="text-3xl font-bold mb-6 flex gap-2">  
      <Package className="text-blue-600"/>  
      Ultra Product Panel 🚀  
    </h1>  

    {/* BASIC */}  
    <input placeholder="Product Name" value={name} onChange={(e)=>setName(e.target.value)} className="input"/>  
    <input placeholder="Qikink Product ID" value={qikinkId} onChange={(e)=>setQikinkId(e.target.value)} className="input"/>  
    <input placeholder="SKU" value={sku} onChange={(e)=>setSku(e.target.value)} className="input"/>  
    <input placeholder="Print Type ID" value={printTypeId} onChange={(e)=>setPrintTypeId(e.target.value)} className="input"/>  

    <select value={category} onChange={(e)=>setCategory(e.target.value)} className="input">  
      <option value="">Select Category</option>  
      {categories.map((c:any)=>(  
        <option key={c.id}>{c.name}</option>  
      ))}  
    </select>  

    <input placeholder="Design Link" value={designLink} onChange={(e)=>setDesignLink(e.target.value)} className="input"/>  
    <input placeholder="Mockup Link" value={mockupLink} onChange={(e)=>setMockupLink(e.target.value)} className="input"/>  

    <textarea placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} className="input"/>  

    {/* VARIANTS */}  
    <h2 className="text-xl font-bold mt-6">Variants</h2>  

    {variations.map((v,i)=>(  
      <div key={i} className="bg-gray-50 p-4 rounded-2xl mt-4 shadow">  

        <input  
          placeholder="Color Name"  
          value={v.color}  
          onChange={(e)=>updateColor(i,"color",e.target.value)}  
          className="input"  
        />  

        {/* IMAGES */}  
        <div className="grid grid-cols-2 gap-2 mt-2">  
          {["mainImage","frontImage","backImage","sideImage","modelImage"].map((field)=>(
    key={field}
    className={`relative border-2 rounded-xl p-2 mt-2 ${
      v[field]
        ? "border-green-500 bg-green-50"
        : "border-gray-300"
    }`}
  >

    <input
      type="file"
      onChange={(e)=>handleImage(e,i,field)}
      className="w-full"
    />

    {/* ✅ GREEN TICK */}
    {v[field] && (
      <span className="absolute right-2 top-2 text-green-600 text-xl">
        ✔
      </span>
    )}

  </div>

        {/* PRICE */}  
        <div className="grid grid-cols-2 gap-2 mt-3">  
          <input placeholder="Base Price" value={v.basePrice} onChange={(e)=>updateColor(i,"basePrice",e.target.value)} className="input"/>  
          <input placeholder="Sell Price" value={v.sellPrice} onChange={(e)=>updateColor(i,"sellPrice",e.target.value)} className="input"/>  
        </div>  

        {/* SIZES */}  
        {v.sizes.map((s:any,j:number)=>(  
          <div key={j} className="grid grid-cols-3 gap-2 mt-2">  
            <select value={s.size} onChange={(e)=>updateSize(i,j,"size",e.target.value)} className="input">  
              <option value="">Size</option>  
              {SIZE_OPTIONS.map(size=>(  
                <option key={size}>{size}</option>  
              ))}  
            </select>  

            <input placeholder="Price" value={s.price} onChange={(e)=>updateSize(i,j,"price",e.target.value)} className="input"/>  
            <input placeholder="Stock" value={s.stock} onChange={(e)=>updateSize(i,j,"stock",e.target.value)} className="input"/>  
          </div>  
        ))}  

        <button onClick={()=>addSize(i)} className="btn-black mt-2">  
          + Add Size  
        </button>  

        <button onClick={()=>removeColor(i)} className="text-red-500 mt-2 flex gap-1">  
          <Trash2 size={16}/> Remove  
        </button>  

      </div>  
    ))}  

    <button onClick={addColor} className="btn-blue mt-4">  
      + Add Color Variant  
    </button>  

    <button onClick={saveProduct} className="btn-blue w-full mt-6 flex justify-center gap-2">  
      <PlusCircle/> Add Product  
    </button>  

  </div>  

  {/* 🔥 STYLES */}  
  <style jsx>{`  
    .input {  
      border:1px solid #ddd;  
      padding:12px;  
      border-radius:12px;  
      width:100%;  
      margin-top:10px;  
    }  
    .btn-blue {  
      background:#2563eb;  
      color:white;  
      padding:12px;  
      border-radius:12px;  
    }  
    .btn-black {  
      background:black;  
      color:white;  
      padding:8px 12px;  
      border-radius:10px;  
    }  
  `}</style>  

</div>

);
}

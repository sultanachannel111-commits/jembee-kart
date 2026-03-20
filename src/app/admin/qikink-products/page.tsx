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
  const [category,setCategory] = useState("");
  const [categories,setCategories] = useState<any[]>([]);

  const [image,setImage] = useState("");

  const [basePrice,setBasePrice] = useState("");
  const [sellPrice,setSellPrice] = useState("");

  const [stock,setStock] = useState("");

  const [variations,setVariations] = useState<any[]>([]);

  const profit =
    Number(sellPrice || 0) - Number(basePrice || 0);

  useEffect(()=>{
    loadCategories();

    const main = localStorage.getItem("image_main");
    if(main) setImage(main);
  },[]);

  const loadCategories = async()=>{
    const snap = await getDocs(collection(db,"qikinkCategories"));
    setCategories(
      snap.docs.map(doc=>({ id:doc.id, ...doc.data() }))
    );
  };

  // 🔥 AUTO GENERATE SIZES
  const generateSizes = ()=>{
    const newVariants = SIZE_OPTIONS.map(size=>({
      size,
      price: sellPrice,
      stock: "",
      image: image
    }));
    setVariations(newVariants);
  };

  // 🔥 UPDATE
  const updateVariation = (index:number, field:string, value:any)=>{
    const updated = [...variations];
    updated[index][field] = value;
    setVariations(updated);
  };

  // ❌ REMOVE
  const removeVariation = (index:number)=>{
    setVariations(variations.filter((_,i)=>i!==index));
  };

  // ➕ ADD EMPTY
  const addVariation = ()=>{
    setVariations([
      ...variations,
      { size:"", price:"", stock:"", image:"" }
    ]);
  };

  // 💾 SAVE
  const saveProduct = async()=>{

    if(!name || !category){
      alert("Fill required fields");
      return;
    }

    // ❌ duplicate size block
    const sizes = variations.map(v=>v.size);
    const unique = new Set(sizes);
    if(unique.size !== sizes.length){
      alert("Duplicate sizes not allowed");
      return;
    }

    try{

      const finalVariations = variations.map(v=>({
        size: v.size,
        price: Number(v.price || sellPrice),
        stock: Number(v.stock || stock),
        images: [v.image || image]
      }));

      await addDoc(collection(db,"products"),{
        name,
        category,
        image,

        basePrice:Number(basePrice),
        sellPrice:Number(sellPrice),
        profit,

        stock:Number(stock),
        variations: finalVariations,

        createdAt:serverTimestamp()
      });

      alert("✅ Product Added");

    }catch(err){
      console.log(err);
      alert("Error");
    }
  };

  return (

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-xl">

        {/* HEADER */}
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <Package className="text-blue-600"/>
          Ultra Product Panel 🚀
        </h1>

        {/* BASIC */}
        <input
          placeholder="Product Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          className="border p-3 rounded-xl w-full mb-3"
        />

        <select
          value={category}
          onChange={(e)=>setCategory(e.target.value)}
          className="border p-3 rounded-xl w-full mb-3"
        >
          <option value="">Select Category</option>
          {categories.map((c:any)=>(
            <option key={c.id} value={c.name}>{c.name}</option>
          ))}
        </select>

        {/* IMAGE */}
        <button
          onClick={()=>window.location.href="/admin/upload-image?type=main"}
          className="bg-gray-200 px-4 py-2 rounded-lg"
        >
          Upload Main Image
        </button>

        {image && <img src={image} className="w-24 mt-3 rounded-xl"/>}

        {/* PRICE */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <input type="number" placeholder="Base Price"
            value={basePrice}
            onChange={(e)=>setBasePrice(e.target.value)}
            className="border p-3 rounded-xl"/>

          <input type="number" placeholder="Sell Price"
            value={sellPrice}
            onChange={(e)=>setSellPrice(e.target.value)}
            className="border p-3 rounded-xl"/>

          <input value={profit} readOnly
            className="border p-3 rounded-xl bg-gray-100"/>
        </div>

        {/* VARIANTS */}
        <div className="mt-6">

          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg">Variants</h2>

            <button
              onClick={generateSizes}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm"
            >
              Auto Generate Sizes
            </button>
          </div>

          {variations.map((v,index)=>(
            <div key={index}
              className="border p-4 rounded-xl mt-3 bg-gray-50">

              <div className="grid grid-cols-2 gap-3">

                {/* SIZE DROPDOWN */}
                <select
                  value={v.size}
                  onChange={(e)=>updateVariation(index,"size",e.target.value)}
                  className="border p-2 rounded-lg"
                >
                  <option value="">Select Size</option>
                  {SIZE_OPTIONS.map(size=>(
                    <option key={size}>{size}</option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Price"
                  value={v.price}
                  onChange={(e)=>updateVariation(index,"price",e.target.value)}
                  className="border p-2 rounded-lg"
                />

                <input
                  type="number"
                  placeholder="Stock"
                  value={v.stock}
                  onChange={(e)=>updateVariation(index,"stock",e.target.value)}
                  className="border p-2 rounded-lg"
                />

                {/* IMAGE UPLOAD */}
                <button
                  onClick={()=>window.location.href=`/admin/upload-image?type=variant_${index}`}
                  className="bg-gray-200 rounded-lg"
                >
                  Upload Image
                </button>

              </div>

              <button
                onClick={()=>removeVariation(index)}
                className="text-red-500 mt-2 flex gap-1 items-center"
              >
                <Trash2 size={16}/> Remove
              </button>

            </div>
          ))}

          <button
            onClick={addVariation}
            className="mt-3 bg-black text-white px-4 py-2 rounded-lg"
          >
            + Add Variant
          </button>

        </div>

        {/* SAVE */}
        <button
          onClick={saveProduct}
          className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl flex justify-center gap-2"
        >
          <PlusCircle/>
          Add Product
        </button>

      </div>

    </div>
  );
}

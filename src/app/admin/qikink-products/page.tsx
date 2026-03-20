"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs
} from "firebase/firestore";

export default function AdminQikinkProducts() {

  const [name,setName] = useState("");
  const [category,setCategory] = useState("");
  const [categories,setCategories] = useState<any[]>([]);

  const [basePrice,setBasePrice] = useState("");
  const [sellPrice,setSellPrice] = useState("");

  // 🔥 VARIATION STATES (ADVANCED)
  const [colorInputs,setColorInputs] = useState<any[]>([
    { color:"#000000", image:"" }
  ]);

  const [sizes,setSizes] = useState("S,M,L");

  const profit =
    Number(sellPrice || 0) - Number(basePrice || 0);

  useEffect(()=>{
    loadCategories();
  },[]);

  const loadCategories = async()=>{
    const snap = await getDocs(collection(db,"qikinkCategories"));
    const list = snap.docs.map(doc=>({
      id:doc.id,
      ...doc.data()
    }));
    setCategories(list);
  };

  // ➕ ADD COLOR
  const addColor = ()=>{
    setColorInputs([
      ...colorInputs,
      { color:"#000000", image:"" }
    ]);
  };

  // 🔄 UPDATE COLOR
  const updateColor = (index:number,key:string,value:any)=>{
    const updated = [...colorInputs];
    updated[index][key] = value;
    setColorInputs(updated);
  };

  // 🔥 SAVE PRODUCT
  const saveProduct = async()=>{

    if(!name || !category){
      alert("Fill required fields");
      return;
    }

    const sizeList = sizes.split(",").map(s=>s.trim());

    let variations:any[] = [];

    colorInputs.forEach((c)=>{
      sizeList.forEach((size)=>{
        variations.push({
          color: c.color,
          size,
          price:Number(sellPrice),
          stock:10, // default
          images:[c.image] // 🔥 color wise image
        });
      });
    });

    await addDoc(collection(db,"products"),{
      name,
      category,
      basePrice:Number(basePrice),
      sellPrice:Number(sellPrice),
      profit,
      variations,
      createdAt:serverTimestamp()
    });

    alert("🔥 Product Added with Advanced Variations");
  };

  return(
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        PRO Variation Product
      </h1>

      {/* BASIC */}
      <input
        placeholder="Product Name"
        onChange={(e)=>setName(e.target.value)}
        className="border p-3 w-full mb-3"
      />

      <select
        onChange={(e)=>setCategory(e.target.value)}
        className="border p-3 w-full mb-3"
      >
        <option>Select Category</option>
        {categories.map((c:any)=>(
          <option key={c.id}>{c.name}</option>
        ))}
      </select>

      {/* PRICE */}
      <input
        placeholder="Base Price"
        onChange={(e)=>setBasePrice(e.target.value)}
        className="border p-3 w-full mb-3"
      />

      <input
        placeholder="Sell Price"
        onChange={(e)=>setSellPrice(e.target.value)}
        className="border p-3 w-full mb-3"
      />

      {/* 🔥 COLORS */}
      <h2 className="font-bold mt-4">Colors</h2>

      {colorInputs.map((c,index)=>(
        <div key={index} className="flex gap-2 mb-2">

          <input
            type="color"
            value={c.color}
            onChange={(e)=>updateColor(index,"color",e.target.value)}
          />

          <input
            placeholder="Image URL"
            value={c.image}
            onChange={(e)=>updateColor(index,"image",e.target.value)}
            className="border p-2 flex-1"
          />

        </div>
      ))}

      <button
        onClick={addColor}
        className="bg-black text-white px-4 py-2 mb-4"
      >
        + Add Color
      </button>

      {/* SIZES */}
      <input
        placeholder="Sizes (S,M,L,XL)"
        value={sizes}
        onChange={(e)=>setSizes(e.target.value)}
        className="border p-3 w-full mb-4"
      />

      {/* SAVE */}
      <button
        onClick={saveProduct}
        className="bg-green-600 text-white px-6 py-3 rounded"
      >
        Save Product
      </button>

    </div>
  );
}

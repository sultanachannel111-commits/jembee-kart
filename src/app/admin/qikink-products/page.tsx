"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs
} from "firebase/firestore";

import { Package, PlusCircle } from "lucide-react";

export default function AdminQikinkProducts() {

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

  // 🔥 NEW VARIATIONS STATE
  const [variations,setVariations] = useState<any[]>([
    {
      color: "",
      size: "",
      price: "",
      stock: "",
      image: ""
    }
  ]);

  const profit =
  Number(sellPrice || 0) - Number(basePrice || 0);

  useEffect(()=>{

    loadCategories();

    const main = localStorage.getItem("image_main");
    const front = localStorage.getItem("image_front");
    const back = localStorage.getItem("image_back");
    const side = localStorage.getItem("image_side");
    const model = localStorage.getItem("image_model");

    if(main) setImage(main);
    if(front) setFrontImage(front);
    if(back) setBackImage(back);
    if(side) setSideImage(side);
    if(model) setModelImage(model);

  },[]);

  const loadCategories = async()=>{
    try{
      const snap = await getDocs(collection(db,"qikinkCategories"));
      const list = snap.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
      }));
      setCategories(list);
    }catch(err){
      console.log(err);
    }
  };

  // 🔥 ADD VARIATION
  const addVariation = ()=>{
    setVariations([
      ...variations,
      { color:"", size:"", price:"", stock:"", image:"" }
    ]);
  };

  // 🔥 UPDATE VARIATION
  const updateVariation = (index:number, field:string, value:any)=>{
    const updated = [...variations];
    updated[index][field] = value;
    setVariations(updated);
  };

  const saveProduct = async()=>{

    if(!name || !qikinkId || !category){
      alert("Please fill required fields");
      return;
    }

    try{

      // ✅ CLEAN VARIATIONS
      const finalVariations = variations.map(v=>({
        color: v.color,
        size: v.size,
        price: Number(v.price || sellPrice),
        stock: Number(v.stock || stock),
        images: [v.image || image]
      }));

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

        // 🔥 FIXED
        variations: finalVariations,

        supplier:"qikink",
        createdAt:serverTimestamp()

      });

      alert("Product Added Successfully 🎉");

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

          <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="Product Name" className="border w-full p-3 rounded-lg"/>

          <input value={qikinkId} onChange={(e)=>setQikinkId(e.target.value)} placeholder="Qikink Product ID" className="border w-full p-3 rounded-lg"/>

          <input value={sku} onChange={(e)=>setSku(e.target.value)} placeholder="SKU" className="border w-full p-3 rounded-lg"/>

          <input value={printTypeId} onChange={(e)=>setPrintTypeId(e.target.value)} placeholder="Print Type ID" className="border w-full p-3 rounded-lg"/>

          <select value={category} onChange={(e)=>setCategory(e.target.value)} className="border w-full p-3 rounded-lg">
            <option value="">Select Category</option>
            {categories.map((c:any)=>(
              <option key={c.id} value={c.name}>{c.name}</option>
            ))}
          </select>

          {/* 🔥 VARIATION UI */}
          <div className="mt-6">
            <h2 className="font-bold text-lg">Variations</h2>

            {variations.map((v,index)=>(
              <div key={index} className="border p-4 rounded-xl mt-3 space-y-2">

                <input
                  placeholder="Color (#ff0000)"
                  value={v.color}
                  onChange={(e)=>updateVariation(index,"color",e.target.value)}
                  className="border w-full p-2 rounded"
                />

                <input
                  placeholder="Size (S, M, L)"
                  value={v.size}
                  onChange={(e)=>updateVariation(index,"size",e.target.value)}
                  className="border w-full p-2 rounded"
                />

                <input
                  type="number"
                  placeholder="Price"
                  value={v.price}
                  onChange={(e)=>updateVariation(index,"price",e.target.value)}
                  className="border w-full p-2 rounded"
                />

                <input
                  type="number"
                  placeholder="Stock"
                  value={v.stock}
                  onChange={(e)=>updateVariation(index,"stock",e.target.value)}
                  className="border w-full p-2 rounded"
                />

                <input
                  placeholder="Image URL"
                  value={v.image}
                  onChange={(e)=>updateVariation(index,"image",e.target.value)}
                  className="border w-full p-2 rounded"
                />

              </div>
            ))}

            <button
              onClick={addVariation}
              className="mt-3 bg-black text-white px-4 py-2 rounded"
            >
              + Add Variant
            </button>

          </div>

          <button
            onClick={saveProduct}
            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl mt-6"
          >
            <PlusCircle size={20}/>
            Add Product
          </button>

        </div>

      </div>

    </div>

  );

}

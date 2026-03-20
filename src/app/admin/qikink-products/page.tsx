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

  // BASIC
  const [name,setName] = useState("");
  const [qikinkId,setQikinkId] = useState("");
  const [sku,setSku] = useState("");
  const [printTypeId,setPrintTypeId] = useState("");

  const [category,setCategory] = useState("");
  const [categories,setCategories] = useState<any[]>([]);

  const [description,setDescription] = useState("");

  // IMAGE
  const [image,setImage] = useState("");

  // LINKS
  const [designLink,setDesignLink] = useState("");
  const [mockupLink,setMockupLink] = useState("");

  // VARIATIONS (COLOR + SIZE)
  const [variations,setVariations] = useState<any[]>([
    {
      color:"",
      image:"",
      sizes:[{ size:"", price:"", stock:"" }]
    }
  ]);

  // 🔥 LOAD CATEGORY
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

  // 🔥 IMAGE COMPRESS (200KB)
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

          const compressed = canvas.toDataURL("image/jpeg",0.6); // 🔥 compress

          resolve(compressed);
        };
      };
    });
  };

  // 📸 MAIN IMAGE
  const handleMainImage = async(e:any)=>{
    const file = e.target.files[0];
    const compressed = await compressImage(file);
    setImage(compressed);
  };

  // 📸 COLOR IMAGE
  const handleColorImage = async(e:any,i:number)=>{
    const file = e.target.files[0];
    const compressed = await compressImage(file);

    const updated = [...variations];
    updated[i].image = compressed;
    setVariations(updated);
  };

  // ➕ COLOR VARIANT
  const addColor = ()=>{
    setVariations([
      ...variations,
      {
        color:"",
        image:"",
        sizes:[{ size:"", price:"", stock:"" }]
      }
    ]);
  };

  // ➕ SIZE
  const addSize = (i:number)=>{
    const updated = [...variations];
    updated[i].sizes.push({ size:"", price:"", stock:"" });
    setVariations(updated);
  };

  // ✏️ UPDATE
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

  // ❌ REMOVE
  const removeColor = (i:number)=>{
    setVariations(variations.filter((_,idx)=>idx!==i));
  };

  // 💾 SAVE
  const saveProduct = async()=>{

    try{

      const finalVariations = variations.map(v=>({
        color: v.color,
        image: v.image || image,
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

        image,

        designLink,
        mockupLink,

        description,

        variations: finalVariations,

        supplier:"qikink",
        createdAt:serverTimestamp()

      });

      alert("✅ Product Added");

    }catch(err){
      console.log(err);
      alert("Error");
    }

  };

  return(

    <div className="min-h-screen bg-gray-100 p-6">

      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow-xl">

        <h1 className="text-2xl font-bold flex gap-2 mb-6">
          <Package className="text-blue-600"/>
          Ultra Qikink Product 🚀
        </h1>

        {/* BASIC */}
        <input placeholder="Product Name" value={name} onChange={(e)=>setName(e.target.value)} className="border p-3 rounded-xl w-full mb-3"/>

        <input placeholder="Qikink Product ID" value={qikinkId} onChange={(e)=>setQikinkId(e.target.value)} className="border p-3 rounded-xl w-full mb-3"/>

        <input placeholder="SKU" value={sku} onChange={(e)=>setSku(e.target.value)} className="border p-3 rounded-xl w-full mb-3"/>

        <input placeholder="Print Type ID" value={printTypeId} onChange={(e)=>setPrintTypeId(e.target.value)} className="border p-3 rounded-xl w-full mb-3"/>

        {/* CATEGORY */}
        <select value={category} onChange={(e)=>setCategory(e.target.value)} className="border p-3 rounded-xl w-full mb-3">
          <option value="">Select Category</option>
          {categories.map((c:any)=>(
            <option key={c.id}>{c.name}</option>
          ))}
        </select>

        {/* IMAGE */}
        <input type="file" onChange={handleMainImage} className="mb-3"/>
        {image && <img src={image} className="w-24 rounded-xl mb-3"/>}

        {/* LINKS */}
        <input placeholder="Design Link" value={designLink} onChange={(e)=>setDesignLink(e.target.value)} className="border p-3 rounded-xl w-full mb-3"/>

        <input placeholder="Mockup Link" value={mockupLink} onChange={(e)=>setMockupLink(e.target.value)} className="border p-3 rounded-xl w-full mb-3"/>

        {/* DESCRIPTION */}
        <textarea placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} className="border p-3 rounded-xl w-full mb-3"/>

        {/* VARIATIONS */}
        <h2 className="font-bold mt-4">Variants</h2>

        {variations.map((v,i)=>(
          <div key={i} className="border p-4 rounded-xl mt-3">

            <input
              placeholder="Color Name"
              value={v.color}
              onChange={(e)=>updateColor(i,"color",e.target.value)}
              className="border p-2 w-full mb-2 rounded"
            />

            <input type="file" onChange={(e)=>handleColorImage(e,i)} className="mb-2"/>

            {v.sizes.map((s:any,j:number)=>(
              <div key={j} className="grid grid-cols-3 gap-2 mb-2">

                <select value={s.size} onChange={(e)=>updateSize(i,j,"size",e.target.value)} className="border p-2 rounded">
                  <option value="">Size</option>
                  {SIZE_OPTIONS.map(size=>(
                    <option key={size}>{size}</option>
                  ))}
                </select>

                <input placeholder="Price" value={s.price} onChange={(e)=>updateSize(i,j,"price",e.target.value)} className="border p-2 rounded"/>

                <input placeholder="Stock" value={s.stock} onChange={(e)=>updateSize(i,j,"stock",e.target.value)} className="border p-2 rounded"/>

              </div>
            ))}

            <button onClick={()=>addSize(i)} className="bg-black text-white px-3 py-1 rounded mt-2">
              + Add Size
            </button>

            <button onClick={()=>removeColor(i)} className="text-red-500 mt-2 flex gap-1 items-center">
              <Trash2 size={16}/> Remove
            </button>

          </div>
        ))}

        <button onClick={addColor} className="mt-4 bg-blue-600 text-white px-4 py-2 rounded">
          + Add Color Variant
        </button>

        {/* SAVE */}
        <button onClick={saveProduct} className="w-full mt-6 bg-blue-600 text-white py-3 rounded-xl flex justify-center gap-2">
          <PlusCircle/> Add Product
        </button>

      </div>

    </div>

  );

}

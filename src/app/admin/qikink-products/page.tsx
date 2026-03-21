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
  const [importId,setImportId] = useState("");

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

  /* ================= LOAD CATEGORY ================= */
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

  /* ================= IMPORT ================= */
  const handleImport = async () => {

    if (!importId) {
      alert("Enter Product ID");
      return;
    }

    try {

      const res = await fetch("/api/qikink/import", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          productId: importId
        })
      });

      const data = await res.json();

      if (!data.success) {
        alert("❌ Import failed");
        return;
      }

      const p = data.product;

      setName(p.name || "");
      setDescription(p.description || "");
      setCategory(p.category || "");
      setQikinkId(p.id || "");

      if (p.variations?.length) {

        const formatted = p.variations.map((v:any)=>({

          color: v.color || "",

          mainImage: v.images?.main || "",
          frontImage: "",
          backImage: "",
          sideImage: "",
          modelImage: "",

          basePrice: v.basePrice || 0,
          sellPrice: (v.basePrice || 0) + 200,

          sizes: v.sizes?.map((s:any)=>({
            size: s.size,
            price: s.price,
            stock: s.stock
          })) || []

        }));

        setVariations(formatted);
      }

      alert("🔥 Product Imported");

    } catch (err) {
      console.log(err);
      alert("❌ Error");
    }
  };

  /* ================= AUTO PASTE ================= */
  const handleQikinkPaste = (text:string)=>{
    try{
      const data = JSON.parse(text);

      setName(data.name || "");
      setDescription(data.description || "");
      setQikinkId(data.id || "");
      setSku(data.sku || "");

      if(data.category){
        setCategory(data.category);
      }

      if(data.variants){
        const formatted = data.variants.map((v:any)=>({
          color: v.color || "",
          mainImage: v.images?.[0] || "",
          frontImage: v.images?.[1] || "",
          backImage: v.images?.[2] || "",
          sideImage: v.images?.[3] || "",
          modelImage: v.images?.[4] || "",
          basePrice: v.base_price || 0,
          sellPrice: (v.base_price || 0) + 200,
          sizes: v.sizes?.map((s:any)=>({
            size: s.size,
            price: s.price || v.base_price,
            stock: s.stock || 100
          })) || []
        }));

        setVariations(formatted);
      }

      alert("✅ JSON Imported");

    }catch{
      alert("❌ Invalid JSON");
    }
  };

  /* ================= SAVE ================= */
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

    alert("🔥 Product Added");
  };

  return(
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-3xl shadow">

      <h1 className="text-2xl font-bold mb-4 flex gap-2">
        <Package/> Qikink Panel
      </h1>

      <textarea
        placeholder="Paste Qikink JSON..."
        className="input"
        onBlur={(e)=>handleQikinkPaste(e.target.value)}
      />

      <input
        placeholder="Enter Product ID"
        value={importId}
        onChange={(e)=>setImportId(e.target.value)}
        className="input"
      />

      <button onClick={handleImport} className="btn-blue w-full mt-2">
        🚀 Import Product
      </button>

      <input className="input" placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)}/>

      <select value={category} onChange={(e)=>setCategory(e.target.value)} className="input">
        <option value="">Select Category</option>
        {categories.map((c:any)=>(
          <option key={c.id}>{c.name}</option>
        ))}
      </select>

      <textarea className="input" placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)}/>

      <button onClick={saveProduct} className="btn-blue w-full mt-4">
        <PlusCircle/> Add Product
      </button>

      <style jsx>{`
        .input {
          border:1px solid #ddd;
          padding:10px;
          border-radius:10px;
          width:100%;
          margin-top:10px;
        }
        .btn-blue {
          background:#2563eb;
          color:white;
          padding:10px;
          border-radius:10px;
        }
      `}</style>

    </div>
  );
}

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

  /* ================= QIKINK IMPORT ================= */
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

      console.log("IMPORT DATA:", data);

      if (!data.success) {
        alert("❌ Import failed");
        return;
      }

      const p = data.product;

      console.log("REAL PRODUCT:", p);

      // 🔥 FIXED FIELD MAPPING
      setName(p.product_name || p.name || "");
      setDescription(p.product_description || p.description || "");
      setCategory(p.product_category || p.category || "");
      setQikinkId(p.id || "");

      if (p.variants || p.variations) {

        const list = p.variants || p.variations;

        const formatted = list.map((v:any)=>({

          color: v.color || "",

          mainImage: v.images?.main || v.images?.[0] || "",
          frontImage: v.images?.[1] || "",
          backImage: v.images?.[2] || "",
          sideImage: v.images?.[3] || "",
          modelImage: v.images?.[4] || "",

          basePrice: v.base_price || v.basePrice || 0,
          sellPrice: (v.base_price || v.basePrice || 0) + 200,

          sizes: v.sizes?.map((s:any)=>({
            size: s.size,
            price: s.price,
            stock: s.stock
          })) || []

        }));

        setVariations(formatted);
      }

      alert("🔥 Product Imported Successfully");

    } catch (err) {
      console.log("IMPORT ERROR:", err);
      alert("❌ Error importing product");
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
      description,
      variations: finalVariations,
      createdAt:serverTimestamp()
    });

    alert("🔥 Product Added Successfully");
  };

  /* ================= UI ================= */

  return(
    <div className="min-h-screen bg-gray-100 p-4">

      <div className="max-w-4xl mx-auto bg-white p-5 rounded-2xl shadow">

        <h1 className="text-2xl font-bold mb-4 flex gap-2">
          <Package/> Qikink Panel
        </h1>

        {/* IMPORT */}
        <input
          placeholder="Enter Product ID"
          value={importId}
          onChange={(e)=>setImportId(e.target.value)}
          className="input"
        />

        <button onClick={handleImport} className="btn-blue">
          🚀 Import Product
        </button>

        {/* BASIC */}
        <input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} className="input"/>

        <select value={category} onChange={(e)=>setCategory(e.target.value)} className="input">
          <option value="">Select Category</option>
          {categories.map((c:any)=>(
            <option key={c.id}>{c.name}</option>
          ))}
        </select>

        <textarea placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} className="input"/>

        {/* SAVE */}
        <button onClick={saveProduct} className="btn-blue w-full mt-4">
          <PlusCircle/> Add Product
        </button>

      </div>

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
          padding:12px;
          border-radius:10px;
          margin-top:10px;
          width:100%;
        }
      `}</style>

    </div>
  );
}

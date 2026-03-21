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
  const [category,setCategory] = useState("");
  const [categories,setCategories] = useState<any[]>([]);
  const [description,setDescription] = useState("");
  const [importId,setImportId] = useState("");

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

      console.log("FULL API RESPONSE:", data);

      if (!data.success) {
        alert("❌ Import failed");
        return;
      }

      const p = data.product;

      console.log("PRODUCT:", p);

      // 🔥 SAFE MAPPING (हर case cover)
      setName(
        p.product_name ||
        p.name ||
        p.title ||
        p.product?.name ||
        ""
      );

      setDescription(
        p.product_description ||
        p.description ||
        p.desc ||
        p.product?.description ||
        ""
      );

      setCategory(
        p.product_category ||
        p.category ||
        p.type ||
        p.product?.category ||
        ""
      );

      setQikinkId(p.id || importId);

      alert("🔥 Product Imported Successfully");

    } catch (err) {
      console.log("IMPORT ERROR:", err);
      alert("❌ Error importing product");
    }
  };

  /* ================= SAVE ================= */
  const saveProduct = async()=>{

    await addDoc(collection(db,"products"),{
      name,
      qikinkId,
      category,
      description,
      createdAt:serverTimestamp()
    });

    alert("🔥 Product Saved");
  };

  /* ================= UI ================= */

  return(
    <div className="min-h-screen bg-gray-100 p-4">

      <div className="max-w-3xl mx-auto bg-white p-5 rounded-2xl shadow">

        <h1 className="text-2xl font-bold mb-4 flex gap-2">
          <Package/> Qikink Panel 🚀
        </h1>

        {/* IMPORT */}
        <input
          placeholder="Enter Product ID"
          value={importId}
          onChange={(e)=>setImportId(e.target.value)}
          className="input"
        />

        <button onClick={handleImport} className="btn">
          🚀 Import Product
        </button>

        {/* FORM */}
        <input
          placeholder="Product Name"
          value={name}
          onChange={(e)=>setName(e.target.value)}
          className="input"
        />

        <select
          value={category}
          onChange={(e)=>setCategory(e.target.value)}
          className="input"
        >
          <option value="">Select Category</option>
          {categories.map((c:any)=>(
            <option key={c.id}>{c.name}</option>
          ))}
        </select>

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
          className="input"
        />

        <button onClick={saveProduct} className="btn">
          <PlusCircle/> Add Product
        </button>

      </div>

      <style jsx>{`
        .input {
          width:100%;
          border:1px solid #ddd;
          padding:12px;
          border-radius:10px;
          margin-top:10px;
        }
        .btn {
          width:100%;
          background:#2563eb;
          color:white;
          padding:12px;
          border-radius:10px;
          margin-top:10px;
        }
      `}</style>

    </div>
  );
}

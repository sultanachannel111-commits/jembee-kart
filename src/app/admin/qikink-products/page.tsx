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
    setCategories(
      snap.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
      }))
    );
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

      console.log("FULL API DATA:", data);

      if (!data.success) {
        alert("❌ Import failed");
        return;
      }

      // 🔥 SMART PICK (हर structure के लिए)
      const p =
        data.product ||
        data.data ||
        data.item ||
        data;

      console.log("FINAL PRODUCT:", p);

      // 🔥 DEBUG POPUP (देखने के लिए)
      alert(JSON.stringify(p, null, 2));

      // ✅ AUTO FILL
      setName(
        p.name ||
        p.product_name ||
        p.title ||
        ""
      );

      setDescription(
        p.description ||
        p.product_description ||
        ""
      );

      setCategory(
        p.category ||
        p.product_category ||
        ""
      );

      setQikinkId(
        p.id ||
        p.product_id ||
        ""
      );

      alert("🔥 Product Imported");

    } catch (err) {
      console.log(err);
      alert("❌ Error importing");
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

    alert("🔥 Product Added");
  };

  return(
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-3xl shadow">

      <h1 className="text-2xl font-bold mb-4 flex gap-2">
        <Package/> Qikink Panel
      </h1>

      <input
        placeholder="Enter Product ID"
        value={importId}
        onChange={(e)=>setImportId(e.target.value)}
        className="input"
      />

      <button onClick={handleImport} className="btn-blue w-full mt-2">
        🚀 Import Product
      </button>

      <input
        className="input"
        placeholder="Name"
        value={name}
        onChange={(e)=>setName(e.target.value)}
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
        className="input"
        placeholder="Description"
        value={description}
        onChange={(e)=>setDescription(e.target.value)}
      />

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

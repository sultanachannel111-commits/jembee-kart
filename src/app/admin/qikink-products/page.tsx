"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";

import { Package, PlusCircle, Trash2 } from "lucide-react";

const SIZE_OPTIONS = ["S","M","L","XL","XXL"];

export default function AdminQikinkProducts() {

  const [loading,setLoading] = useState(false);
  const [editId,setEditId] = useState<string | null>(null);

  const [products,setProducts] = useState<any[]>([]);
  const [categories,setCategories] = useState<any[]>([]);

  const [name,setName] = useState("");
  const [qikinkId,setQikinkId] = useState("");
  const [sku,setSku] = useState("");
  const [printTypeId,setPrintTypeId] = useState("");
  const [category,setCategory] = useState("");

  const [description,setDescription] = useState("");
  const [designLink,setDesignLink] = useState("");
  const [mockupLink,setMockupLink] = useState("");

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

  // LOAD DATA
  useEffect(()=>{
    loadCategories();
    loadProducts();
  },[]);

  const loadCategories = async()=>{
    const snap = await getDocs(collection(db,"qikinkCategories"));
    setCategories(snap.docs.map(doc=>({ id:doc.id, ...doc.data() })));
  };

  const loadProducts = async()=>{
    const snap = await getDocs(collection(db,"products"));
    setProducts(snap.docs.map(doc=>({ id:doc.id, ...doc.data() })));
  };

  // IMAGE COMPRESS
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
    if (!file) return;

    const compressed = await compressImage(file);

    const updated = [...variations];
    updated[i][field] = compressed;
    setVariations(updated);
  };

  // VARIANTS
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

  const addSize = (i:number)=>{
    const updated = [...variations];
    updated[i].sizes.push({ size:"", price:"", stock:"" });
    setVariations(updated);
  };

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
    if (!confirm("⚠️ Delete this variant?")) return;
    setVariations(variations.filter((_,idx)=>idx!==i));
  };

  // EDIT
  const handleEdit = (p:any)=>{
    setEditId(p.id);

    setName(p.name);
    setQikinkId(p.qikinkId);
    setSku(p.sku);
    setPrintTypeId(p.printTypeId);
    setCategory(p.category);
    setDescription(p.description);
    setDesignLink(p.designLink);
    setMockupLink(p.mockupLink);

    setVariations(p.variations.map((v:any)=>({
      color:v.color,
      mainImage:v.images?.main || "",
      frontImage:v.images?.front || "",
      backImage:v.images?.back || "",
      sideImage:v.images?.side || "",
      modelImage:v.images?.model || "",
      basePrice:v.basePrice,
      sellPrice:v.sellPrice,
      sizes:v.sizes
    })));
  };

  // SAVE
  const saveProduct = async()=>{

    if (!name || !qikinkId || !sku || !printTypeId || !category) {
      alert("⚠️ Fill all required fields");
      return;
    }

    for (let i=0;i<variations.length;i++){
      const v = variations[i];

      if (!v.color || !v.basePrice || !v.sellPrice) {
        alert(`Variant ${i+1} incomplete`);
        return;
      }

      for (let j=0;j<v.sizes.length;j++){
        const s = v.sizes[j];
        if (!s.size || !s.price || !s.stock) {
          alert(`Size missing in Variant ${i+1}`);
          return;
        }
      }
    }

    try{
      setLoading(true);

      const finalVariations = variations.map(v=>({
        color:v.color,
        images:{
          main:v.mainImage,
          front:v.frontImage,
          back:v.backImage,
          side:v.sideImage,
          model:v.modelImage
        },
        basePrice:Number(v.basePrice),
        sellPrice:Number(v.sellPrice),
        sizes:v.sizes.map((s:any)=>({
          size:s.size,
          price:Number(s.price),
          stock:Number(s.stock)
        }))
      }));

      if (editId) {
        await updateDoc(doc(db,"products",editId),{
          name,qikinkId,sku,printTypeId,category,
          designLink,mockupLink,description,
          variations:finalVariations
        });
        alert("✅ Product Updated");
        setEditId(null);
      } else {
        await addDoc(collection(db,"products"),{
          name,qikinkId,sku,printTypeId,category,
          designLink,mockupLink,description,
          variations:finalVariations,
          createdAt:serverTimestamp()
        });
        alert("🔥 Product Added");
      }

      loadProducts();

    }catch(err){
      console.error(err);
      alert("❌ Error");
    }finally{
      setLoading(false);
    }
  };

  // BULK UPLOAD
  const handleBulkUpload = async(e:any)=>{
    const file = e.target.files[0];
    if (!file) return;

    const text = await file.text();
    const data = JSON.parse(text);

    try{
      for (const p of data) {
        await addDoc(collection(db,"products"),{
          ...p,
          createdAt:serverTimestamp()
        });
      }
      alert("🔥 Bulk Upload Done");
      loadProducts();
    }catch(err){
      alert("❌ Bulk Failed");
    }
  };

  return(
    <div className="p-6">

      <h1 className="text-2xl font-bold flex gap-2">
        <Package/> Ultimate Admin Panel 🚀
      </h1>

      {/* BASIC */}
      <input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} className="input"/>
      <input placeholder="Qikink ID" value={qikinkId} onChange={(e)=>setQikinkId(e.target.value)} className="input"/>
      <input placeholder="SKU" value={sku} onChange={(e)=>setSku(e.target.value)} className="input"/>
      <input placeholder="Print Type ID" value={printTypeId} onChange={(e)=>setPrintTypeId(e.target.value)} className="input"/>

      <select value={category} onChange={(e)=>setCategory(e.target.value)} className="input">
        <option value="">Category</option>
        {categories.map((c:any)=>(<option key={c.id}>{c.name}</option>))}
      </select>

      <input placeholder="Design Link" value={designLink} onChange={(e)=>setDesignLink(e.target.value)} className="input"/>
      <input placeholder="Mockup Link" value={mockupLink} onChange={(e)=>setMockupLink(e.target.value)} className="input"/>
      <textarea placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} className="input"/>

      {/* VARIANTS */}
      {variations.map((v,i)=>(
        <div key={i} className="border p-3 mt-3 rounded-xl">

          <input placeholder="Color" value={v.color} onChange={(e)=>updateColor(i,"color",e.target.value)} className="input"/>

          <div className="grid grid-cols-2 gap-2">
            {["mainImage","frontImage","backImage","sideImage","modelImage"].map(field=>(
              <div key={field}>
                <input type="file" onChange={(e)=>handleImage(e,i,field)} />
                {v[field] && <img src={v[field]} className="h-20 mt-1"/>}
              </div>
            ))}
          </div>

          <input placeholder="Base Price" value={v.basePrice} onChange={(e)=>updateColor(i,"basePrice",e.target.value)} className="input"/>
          <input placeholder="Sell Price" value={v.sellPrice} onChange={(e)=>updateColor(i,"sellPrice",e.target.value)} className="input"/>

          {v.sizes.map((s:any,j:number)=>(
            <div key={j} className="grid grid-cols-3 gap-2">
              <select value={s.size} onChange={(e)=>updateSize(i,j,"size",e.target.value)} className="input">
                <option value="">Size</option>
                {SIZE_OPTIONS.map(size=>(<option key={size}>{size}</option>))}
              </select>
              <input placeholder="Price" value={s.price} onChange={(e)=>updateSize(i,j,"price",e.target.value)} className="input"/>
              <input placeholder="Stock" value={s.stock} onChange={(e)=>updateSize(i,j,"stock",e.target.value)} className="input"/>
            </div>
          ))}

          <button onClick={()=>addSize(i)}>+ Size</button>
          <button onClick={()=>removeColor(i)} className="text-red-500 flex gap-1">
            <Trash2 size={16}/> Remove
          </button>

        </div>
      ))}

      <button onClick={addColor}>+ Variant</button>

      <button onClick={saveProduct} disabled={loading} className="btn-blue mt-4">
        {loading ? "Saving..." : "Save Product"}
      </button>

      {/* BULK */}
      <input type="file" accept=".json" onChange={handleBulkUpload} className="input mt-6"/>

      {/* EDIT LIST */}
      <h2 className="mt-10 font-bold">Products</h2>
      {products.map((p:any)=>(
        <div key={p.id} className="flex justify-between border p-2 mt-2">
          <span>{p.name}</span>
          <button onClick={()=>handleEdit(p)} className="bg-yellow-500 text-white px-2 rounded">
            Edit
          </button>
        </div>
      ))}

      <style jsx>{`
        .input{
          border:1px solid #ddd;
          padding:10px;
          border-radius:10px;
          margin-top:10px;
          width:100%;
        }
        .btn-blue{
          background:#2563eb;
          color:white;
          padding:10px;
          border-radius:10px;
        }
      `}</style>

    </div>
  );
}

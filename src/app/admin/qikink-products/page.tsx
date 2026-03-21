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

import { Package, Trash2, Search } from "lucide-react";

const SIZE_OPTIONS = ["S","M","L","XL","XXL"];

export default function AdminQikinkProducts() {

  const [loading,setLoading] = useState(false);
  const [editId,setEditId] = useState<string | null>(null);

  const [products,setProducts] = useState<any[]>([]);
  const [search,setSearch] = useState("");

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
      sizes:[{ size:"", sellPrice:"", basePrice:"", stock:"" }]
    }
  ]);

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

  // IMAGE
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
        sizes:[{ size:"", sellPrice:"", basePrice:"", stock:"" }]
      }
    ]);
  };

  const addSize = (i:number)=>{
    const updated = [...variations];
    updated[i].sizes.push({ size:"", sellPrice:"", basePrice:"", stock:"" });
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
    if (!confirm("Delete this variant?")) return;
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
      sizes:v.sizes.map((s:any)=>({
        size:s.size,
        sellPrice:s.sellPrice || "",
        basePrice:s.basePrice || "",
        stock:s.stock
      }))
    })));
  };

  // SAVE
  const saveProduct = async()=>{
    if (!name || !category) {
      alert("Fill required fields");
      return;
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
        sizes:v.sizes.map((s:any)=>({
          size:s.size,
          sellPrice:Number(s.sellPrice),
          basePrice:Number(s.basePrice),
          stock:Number(s.stock)
        }))
      }));

      if (editId) {
        await updateDoc(doc(db,"products",editId),{
          name,qikinkId,sku,printTypeId,category,
          designLink,mockupLink,description,
          variations:finalVariations
        });
        alert("✅ Updated");
      } else {
        await addDoc(collection(db,"products"),{
          name,qikinkId,sku,printTypeId,category,
          designLink,mockupLink,description,
          variations:finalVariations,
          createdAt:serverTimestamp()
        });
        alert("🔥 Added");
      }

      loadProducts();

    }catch(err){
      alert("❌ Error");
    }finally{
      setLoading(false);
    }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return(
    <div className="min-h-screen p-4 bg-gradient-to-br from-black via-gray-900 to-black text-white">

      <div className="glass">

        <h1 className="text-2xl font-bold flex gap-2 mb-4">
          <Package/> Ultimate Admin Panel 🚀
        </h1>

        <input placeholder="Name" value={name} onChange={(e)=>setName(e.target.value)} className="input"/>
        <input placeholder="Qikink ID" value={qikinkId} onChange={(e)=>setQikinkId(e.target.value)} className="input"/>
        <input placeholder="SKU" value={sku} onChange={(e)=>setSku(e.target.value)} className="input"/>
        <input placeholder="Print Type ID" value={printTypeId} onChange={(e)=>setPrintTypeId(e.target.value)} className="input"/>

        <select value={category} onChange={(e)=>setCategory(e.target.value)} className="input">
          <option value="">Category</option>
          {categories.map((c:any)=>(<option key={c.id}>{c.name}</option>))}
        </select>

        <textarea placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} className="input"/>

        {variations.map((v,i)=>(
          <div key={i} className="variant">

            <input placeholder="Color" value={v.color} onChange={(e)=>updateColor(i,"color",e.target.value)} className="input"/>

            <div className="grid grid-cols-2 gap-2">
              {["mainImage","frontImage","backImage","sideImage","modelImage"].map(field=>(
                <div key={field}>
                  <input type="file" onChange={(e)=>handleImage(e,i,field)} />
                  {v[field] && <img src={v[field]} className="preview"/>}
                </div>
              ))}
            </div>

            {v.sizes.map((s:any,j:number)=>(
              <div key={j} className="grid grid-cols-4 gap-2 mt-2">

                <select value={s.size} onChange={(e)=>updateSize(i,j,"size",e.target.value)} className="input">
                  <option value="">Size</option>
                  {SIZE_OPTIONS.map(size=>(<option key={size}>{size}</option>))}
                </select>

                <input placeholder="Sell Price" value={s.sellPrice} onChange={(e)=>updateSize(i,j,"sellPrice",e.target.value)} className="input"/>
                <input placeholder="Base Price" value={s.basePrice} onChange={(e)=>updateSize(i,j,"basePrice",e.target.value)} className="input"/>
                <input placeholder="Stock" value={s.stock} onChange={(e)=>updateSize(i,j,"stock",e.target.value)} className="input"/>

              </div>
            ))}

            <button onClick={()=>addSize(i)} className="btn-premium mt-2">+ Size</button>

            <button onClick={()=>removeColor(i)} className="text-red-400 mt-2 flex gap-1">
              <Trash2 size={16}/> Remove
            </button>

          </div>
        ))}

        <button onClick={addColor} className="btn-premium mt-4">
          + Add Variant
        </button>

        <button onClick={saveProduct} disabled={loading} className="btn-main mt-4 w-full">
          {loading ? "Saving..." : "Save Product"}
        </button>

      </div>

      {/* SEARCH */}
      <div className="glass mt-6">
        <div className="flex gap-2 items-center">
          <Search/>
          <input placeholder="Search product..." value={search} onChange={(e)=>setSearch(e.target.value)} className="input"/>
        </div>

        {filtered.map((p:any)=>(
          <div key={p.id} className="flex justify-between mt-2 bg-white/5 p-2 rounded">
            <span>{p.name}</span>
            <button onClick={()=>handleEdit(p)} className="btn-yellow">Edit</button>
          </div>
        ))}
      </div>

      <style jsx>{`
        .glass{
          backdrop-filter: blur(20px);
          background: rgba(255,255,255,0.08);
          border:1px solid rgba(255,255,255,0.2);
          padding:20px;
          border-radius:20px;
        }
        .variant{
          background: rgba(255,255,255,0.05);
          padding:15px;
          border-radius:15px;
          margin-top:15px;
        }
        .input{
          width:100%;
          padding:10px;
          border-radius:10px;
          background:rgba(255,255,255,0.1);
          border:1px solid rgba(255,255,255,0.2);
          margin-top:10px;
          color:white;
        }
        .preview{
          height:80px;
          margin-top:5px;
          border-radius:8px;
        }
        .btn-main{
          background:linear-gradient(45deg,#3b82f6,#9333ea);
          padding:12px;
          border-radius:12px;
        }
        .btn-premium{
          background:linear-gradient(45deg,#00f5a0,#00d9f5);
          padding:8px 12px;
          border-radius:10px;
        }
        .btn-yellow{
          background:#facc15;
          color:black;
          padding:4px 10px;
          border-radius:8px;
        }
      `}</style>

    </div>
  );
}

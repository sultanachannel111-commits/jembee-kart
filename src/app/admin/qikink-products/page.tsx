"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from "firebase/firestore";

import { Package, Trash2, Search, Percent, Plus, X, Edit3 } from "lucide-react";
import toast from "react-hot-toast";

const SIZE_OPTIONS = ["S", "M", "L", "XL", "XXL"];

export default function AdminQikinkProducts() {
  const [loading, setLoading] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<any[]>([]);

  const [name, setName] = useState("");
  const [qikinkId, setQikinkId] = useState("");
  const [sku, setSku] = useState("");
  const [printTypeId, setPrintTypeId] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [designLink, setDesignLink] = useState("");
  const [mockupLink, setMockupLink] = useState("");

  const [variations, setVariations] = useState<any[]>([
    {
      color: "",
      mainImage: "",
      frontImage: "",
      backImage: "",
      sideImage: "",
      modelImage: "",
      sizes: [{ size: "", sellPrice: "", basePrice: "", stock: "" }]
    }
  ]);

  // 1. Real-time Listeners
  useEffect(() => {
    // Categories Fetch
    const unsubCat = onSnapshot(collection(db, "qikinkCategories"), (snap) => {
      setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    // Products Fetch (Real-time)
    const unsubProd = onSnapshot(collection(db, "products"), (snap) => {
      setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubCat(); unsubProd(); };
  }, []);

  // 2. Image Compression
  const compressImage = (file: any): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e: any) => {
        const img = new Image();
        img.src = e.target.result;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          const maxWidth = 800;
          const scale = maxWidth / img.width;
          canvas.width = maxWidth;
          canvas.height = img.height * scale;
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL("image/jpeg", 0.6));
        };
      };
    });
  };

  const handleImage = async (e: any, i: number, field: string) => {
    const file = e.target.files[0];
    if (!file) return;
    toast.loading("Compressing...", { id: "img" });
    const compressed = await compressImage(file);
    const updated = [...variations];
    updated[i][field] = compressed;
    setVariations(updated);
    toast.success("Image Ready", { id: "img" });
  };

  // 3. Variation Logic
  const addColor = () => {
    setVariations([...variations, {
      color: "", mainImage: "", frontImage: "", backImage: "", sideImage: "", modelImage: "",
      sizes: [{ size: "", sellPrice: "", basePrice: "", stock: "" }]
    }]);
  };

  const addSize = (i: number) => {
    const updated = [...variations];
    updated[i].sizes.push({ size: "", sellPrice: "", basePrice: "", stock: "" });
    setVariations(updated);
  };

  const updateColor = (i: number, field: string, value: any) => {
    const updated = [...variations];
    updated[i][field] = value;
    setVariations(updated);
  };

  const updateSize = (i: number, j: number, field: string, value: any) => {
    const updated = [...variations];
    updated[i].sizes[j][field] = value;
    setVariations(updated);
  };

  const removeColor = (i: number) => {
    if (variations.length > 1) {
      setVariations(variations.filter((_, idx) => idx !== i));
    }
  };

  // 4. Edit & Delete
  const handleEdit = (p: any) => {
    setEditId(p.id);
    setName(p.name);
    setQikinkId(p.qikinkId);
    setSku(p.sku);
    setPrintTypeId(p.printTypeId);
    setCategory(p.category);
    setDescription(p.description);
    setDesignLink(p.designLink);
    setMockupLink(p.mockupLink);

    setVariations(p.variations.map((v: any) => ({
      color: v.color,
      mainImage: v.images?.main || "",
      frontImage: v.images?.front || "",
      backImage: v.images?.back || "",
      sideImage: v.images?.side || "",
      modelImage: v.images?.model || "",
      sizes: v.sizes.map((s: any) => ({
        size: s.size,
        sellPrice: s.sellPrice,
        basePrice: s.basePrice,
        stock: s.stock
      }))
    })));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const deleteProduct = async (id: string) => {
    if (confirm("Permanently delete this product?")) {
      await deleteDoc(doc(db, "products", id));
      toast.success("Product Removed");
    }
  };

  // 5. Final Save Logic
  const saveProduct = async () => {
    if (!name || !category) return toast.error("Name & Category required");

    try {
      setLoading(true);
      const finalVariations = variations.map(v => ({
        color: v.color,
        images: { main: v.mainImage, front: v.frontImage, back: v.backImage, side: v.sideImage, model: v.modelImage },
        sizes: v.sizes.map((s: any) => ({
          size: s.size,
          sellPrice: Number(s.sellPrice) || 0,
          basePrice: Number(s.basePrice) || 0,
          commission: (Number(s.sellPrice) || 0) - (Number(s.basePrice) || 0),
          stock: Number(s.stock) || 0
        }))
      }));

      const payload = {
        name, qikinkId, sku, printTypeId, category,
        designLink, mockupLink, description,
        variations: finalVariations,
        updatedAt: serverTimestamp()
      };

      if (editId) {
        await updateDoc(doc(db, "products", editId), payload);
        toast.success("Updated Successfully ✨");
        setEditId(null);
      } else {
        await addDoc(collection(db, "products"), { ...payload, createdAt: serverTimestamp() });
        toast.success("Product Published 🔥");
      }

      // Reset Form
      setName(""); setQikinkId(""); setSku(""); setPrintTypeId(""); setCategory("");
      setDescription(""); setDesignLink(""); setMockupLink("");
      setVariations([{ color: "", mainImage: "", frontImage: "", backImage: "", sideImage: "", modelImage: "", sizes: [{ size: "", sellPrice: "", basePrice: "", stock: "" }] }]);
      
    } catch (err) {
      toast.error("Error saving product");
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen p-4 md:p-10 bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="glass p-8 rounded-[40px] mb-10 border border-white/5 bg-white/[0.02]">
          <h1 className="text-3xl font-black italic uppercase tracking-tighter flex items-center gap-3">
            <Package className="text-blue-500" size={32} /> Qikink Inventory
          </h1>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[5px] mt-2">Product Management Engine</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
            <input placeholder="Product Title" value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
            <input placeholder="Qikink ID" value={qikinkId} onChange={(e) => setQikinkId(e.target.value)} className="input-field" />
            <input placeholder="SKU Code" value={sku} onChange={(e) => setSku(e.target.value)} className="input-field" />
            
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input-field">
              <option value="">Choose Category</option>
              {categories.map((c: any) => (<option key={c.id} value={c.name}>{c.name}</option>))}
            </select>
            
            <input placeholder="Print Type ID" value={printTypeId} onChange={(e) => setPrintTypeId(e.target.value)} className="input-field" />
            <input placeholder="Design Link (G-Drive/Figma)" value={designLink} onChange={(e) => setDesignLink(e.target.value)} className="input-field" />
          </div>
          
          <textarea placeholder="Write product description here..." value={description} onChange={(e) => setDescription(e.target.value)} className="input-field h-24 mt-4 resize-none" />
        </div>

        {/* Variations Section */}
        {variations.map((v, i) => (
          <div key={i} className="bg-white/[0.03] border border-white/10 p-6 rounded-[35px] mb-6 relative group transition-all hover:border-blue-500/30">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-xs">{i + 1}</div>
                <input placeholder="Color Name" value={v.color} onChange={(e) => updateColor(i, "color", e.target.value)} className="bg-transparent border-b border-white/10 outline-none font-bold uppercase text-sm focus:border-blue-500 py-1" />
              </div>
              <button onClick={() => removeColor(i)} className="text-red-400 hover:text-red-300 transition p-2"><Trash2 size={20} /></button>
            </div>

            {/* Image Uploads */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
              {["mainImage", "frontImage", "backImage", "sideImage", "modelImage"].map(field => (
                <div key={field} className="flex flex-col items-center gap-3">
                  <label className="text-[8px] font-black uppercase tracking-widest text-gray-500">{field.replace("Image","")}</label>
                  <div className="relative w-full aspect-square rounded-2xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center overflow-hidden group/img">
                    {v[field] ? (
                      <>
                        <img src={v[field]} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-all">
                          <label htmlFor={`file-${i}-${field}`} className="cursor-pointer text-[10px] font-bold uppercase tracking-wider">Change</label>
                        </div>
                      </>
                    ) : (
                      <label htmlFor={`file-${i}-${field}`} className="cursor-pointer flex flex-col items-center gap-2 opacity-40 hover:opacity-100 transition">
                        <Plus size={20} />
                        <span className="text-[8px] font-bold uppercase">Upload</span>
                      </label>
                    )}
                    <input type="file" onChange={(e) => handleImage(e, i, field)} className="hidden" id={`file-${i}-${field}`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Sizes Table */}
            <div className="space-y-3">
              <p className="text-[9px] font-black uppercase tracking-[3px] text-gray-500 mb-2 ml-1">Price & Inventory</p>
              {v.sizes.map((s: any, j: number) => (
                <div key={j} className="grid grid-cols-2 md:grid-cols-5 gap-4 bg-black/40 p-4 rounded-2xl border border-white/5">
                  <select value={s.size} onChange={(e) => updateSize(i, j, "size", e.target.value)} className="bg-transparent text-xs font-bold outline-none border-r border-white/10">
                    <option value="" className="bg-black">Size</option>
                    {SIZE_OPTIONS.map(size => (<option key={size} value={size} className="bg-black">{size}</option>))}
                  </select>
                  <input type="number" placeholder="Sell Price" value={s.sellPrice} onChange={(e) => updateSize(i, j, "sellPrice", e.target.value)} className="bg-transparent text-xs font-bold outline-none" />
                  <input type="number" placeholder="Base Price" value={s.basePrice} onChange={(e) => updateSize(i, j, "basePrice", e.target.value)} className="bg-transparent text-xs font-bold outline-none" />
                  <input type="number" placeholder="Stock" value={s.stock} onChange={(e) => updateSize(i, j, "stock", e.target.value)} className="bg-transparent text-xs font-bold outline-none" />
                  <div className="text-right flex items-center justify-end gap-2">
                    <span className="text-[8px] text-gray-500 font-bold">PROFIT:</span>
                    <span className={`text-xs font-black ${ (s.sellPrice - s.basePrice) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ₹{(s.sellPrice || 0) - (s.basePrice || 0)}
                    </span>
                  </div>
                </div>
              ))}
              <button onClick={() => addSize(i)} className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-blue-300 transition mt-2 ml-1">+ Add Size</button>
            </div>
          </div>
        ))}

        {/* Global Buttons */}
        <div className="flex gap-4 sticky bottom-6 z-40">
          <button onClick={addColor} className="flex-1 bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-white/10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[3px] transition-all">
            + New Color Variant
          </button>
          <button onClick={saveProduct} disabled={loading} className="flex-[2] bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/20 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[3px] transition-all disabled:opacity-50">
            {loading ? "Saving to Cloud..." : editId ? "Update Product ✨" : "Publish to Store 🔥"}
          </button>
          {editId && <button onClick={() => { setEditId(null); setName(""); }} className="bg-red-500/20 text-red-500 p-4 rounded-2xl"><X size={20}/></button>}
        </div>

        {/* Product Listing List */}
        <div className="mt-20 glass p-8 rounded-[40px] bg-white/[0.02] border border-white/5">
          <div className="relative mb-8">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18}/>
            <input placeholder="Search products by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 text-sm outline-none focus:border-blue-500/50 transition-all" />
          </div>

          <div className="grid gap-3">
            {filtered.map((p: any) => (
              <div key={p.id} className="flex justify-between items-center bg-white/5 p-5 rounded-3xl border border-white/5 group hover:bg-white/[0.08] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-black overflow-hidden flex-shrink-0 border border-white/10">
                    <img src={p.variations?.[0]?.images?.main} className="w-full h-full object-cover opacity-60 group-hover:opacity-100" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-tight">{p.name}</p>
                    <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{p.category} • {p.variations?.length} VARIANTS</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(p)} className="p-3 bg-blue-500/10 text-blue-400 rounded-xl hover:bg-blue-500 hover:text-white transition"><Edit3 size={16}/></button>
                  <button onClick={() => deleteProduct(p.id)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition"><Trash2 size={16}/></button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style jsx>{`
        .input-field {
          width: 100%;
          padding: 16px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          color: white;
          font-size: 12px;
          font-weight: 700;
          outline: none;
          transition: all 0.2s;
        }
        .input-field:focus {
          background: rgba(255, 255, 255, 0.07);
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.05);
        }
      `}</style>
    </div>
  );
}

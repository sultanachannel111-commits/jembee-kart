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

import { Package, Trash2, Search, Percent } from "lucide-react";

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

  useEffect(() => {
    loadCategories();
    loadProducts();
  }, []);

  const loadCategories = async () => {
    const snap = await getDocs(collection(db, "qikinkCategories"));
    setCategories(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const loadProducts = async () => {
    const snap = await getDocs(collection(db, "products"));
    setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

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
    const compressed = await compressImage(file);
    const updated = [...variations];
    updated[i][field] = compressed;
    setVariations(updated);
  };

  const addColor = () => {
    setVariations([
      ...variations,
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
    if (!confirm("Delete this variant?")) return;
    setVariations(variations.filter((_, idx) => idx !== i));
  };

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
        sellPrice: s.sellPrice || "",
        basePrice: s.basePrice || "",
        stock: s.stock
      }))
    })));
  };

  const saveProduct = async () => {
    if (!name || !category) {
      alert("Fill required fields");
      return;
    }

    try {
      setLoading(true);

      const finalVariations = variations.map(v => ({
        color: v.color,
        images: {
          main: v.mainImage,
          front: v.frontImage,
          back: v.backImage,
          side: v.sideImage,
          model: v.modelImage
        },
        sizes: v.sizes.map((s: any) => {
            const sPrice = Number(s.sellPrice) || 0;
            const bPrice = Number(s.basePrice) || 0;
            return {
                size: s.size,
                sellPrice: sPrice,
                basePrice: bPrice,
                commission: sPrice - bPrice, // Logic Added
                stock: Number(s.stock) || 0
            };
        })
      }));

      const productData = {
        name, qikinkId, sku, printTypeId, category,
        designLink, mockupLink, description,
        variations: finalVariations,
        updatedAt: serverTimestamp()
      };

      if (editId) {
        await updateDoc(doc(db, "products", editId), productData);
        alert("✅ Updated Successfully");
      } else {
        await addDoc(collection(db, "products"), {
          ...productData,
          createdAt: serverTimestamp()
        });
        alert("🔥 Product Added Successfully");
      }

      loadProducts();
    } catch (err) {
      console.error(err);
      alert("❌ Error Saving Product");
    } finally {
      setLoading(false);
    }
  };

  const filtered = products.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 bg-gradient-to-br from-black via-gray-900 to-black text-white">
      <div className="glass max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <Package className="text-blue-400" /> Qikink Admin Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Product Name" value={name} onChange={(e) => setName(e.target.value)} className="input" />
            <input placeholder="Qikink ID" value={qikinkId} onChange={(e) => setQikinkId(e.target.value)} className="input" />
            <input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} className="input" />
            <input placeholder="Print Type ID" value={printTypeId} onChange={(e) => setPrintTypeId(e.target.value)} className="input" />
            
            <select value={category} onChange={(e) => setCategory(e.target.value)} className="input">
                <option value="">Select Category</option>
                {categories.map((c: any) => (<option key={c.id} value={c.name}>{c.name}</option>))}
            </select>
            
            <input placeholder="Design Link" value={designLink} onChange={(e) => setDesignLink(e.target.value)} className="input" />
        </div>

        <textarea placeholder="Product Description" value={description} onChange={(e) => setDescription(e.target.value)} className="input h-24 mt-4" />

        {variations.map((v, i) => (
          <div key={i} className="variant border border-white/10 p-4 rounded-xl mt-6 bg-white/5">
            <div className="flex justify-between items-center mb-4">
                <input placeholder="Color Name (e.g. Black)" value={v.color} onChange={(e) => updateColor(i, "color", e.target.value)} className="input max-w-xs" />
                <button onClick={() => removeColor(i)} className="text-red-400 flex items-center gap-1 hover:text-red-300 transition">
                    <Trash2 size={18} /> Remove Variant
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
              {["mainImage", "frontImage", "backImage", "sideImage", "modelImage"].map(field => (
                <div key={field} className="flex flex-col items-center gap-2">
                  <label className="text-[10px] uppercase opacity-50">{field.replace("Image","")}</label>
                  <input type="file" onChange={(e) => handleImage(e, i, field)} className="hidden" id={`file-${i}-${field}`} />
                  <label htmlFor={`file-${i}-${field}`} className="cursor-pointer bg-white/10 p-2 rounded-lg hover:bg-white/20 transition text-xs">Upload</label>
                  {v[field] && <img src={v[field]} className="preview w-16 h-16 object-cover rounded shadow-lg border border-white/20" />}
                </div>
              ))}
            </div>

            <div className="space-y-3">
                {v.sizes.map((s: any, j: number) => (
                <div key={j} className="grid grid-cols-2 md:grid-cols-5 gap-3 items-end bg-black/30 p-3 rounded-lg">
                    <div>
                        <label className="text-xs opacity-50">Size</label>
                        <select value={s.size} onChange={(e) => updateSize(i, j, "size", e.target.value)} className="input mt-1">
                            <option value="">Select</option>
                            {SIZE_OPTIONS.map(size => (<option key={size} value={size}>{size}</option>))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs opacity-50">Sell Price</label>
                        <input type="number" placeholder="0" value={s.sellPrice} onChange={(e) => updateSize(i, j, "sellPrice", e.target.value)} className="input mt-1" />
                    </div>

                    <div>
                        <label className="text-xs opacity-50">Base Price</label>
                        <input type="number" placeholder="0" value={s.basePrice} onChange={(e) => updateSize(i, j, "basePrice", e.target.value)} className="input mt-1" />
                    </div>

                    <div>
                        <label className="text-xs opacity-50">Stock</label>
                        <input type="number" placeholder="0" value={s.stock} onChange={(e) => updateSize(i, j, "stock", e.target.value)} className="input mt-1" />
                    </div>

                    <div className="flex flex-col justify-center items-center pb-2">
                        <span className="text-[10px] text-gray-400 uppercase">Commission</span>
                        <span className={`font-bold text-sm ${ (Number(s.sellPrice) - Number(s.basePrice)) > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            ₹{(Number(s.sellPrice) || 0) - (Number(s.basePrice) || 0)}
                        </span>
                    </div>
                </div>
                ))}
            </div>

            <button onClick={() => addSize(i)} className="text-blue-400 text-sm mt-3 font-medium hover:underline">+ Add Another Size</button>
          </div>
        ))}

        <div className="flex gap-4 mt-8">
            <button onClick={addColor} className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl font-medium transition">
            + Add New Color Variant
            </button>
            <button onClick={saveProduct} disabled={loading} className="flex-[2] bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 disabled:opacity-50 transition">
            {loading ? "Processing..." : editId ? "Update Product" : "Publish Product"}
            </button>
        </div>
      </div>

      {/* LISTING SECTION */}
      <div className="glass max-w-4xl mx-auto mt-8">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 text-gray-400" size={20}/>
          <input placeholder="Search products by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="input pl-10" />
        </div>

        <div className="grid gap-2">
            {filtered.length > 0 ? filtered.map((p: any) => (
            <div key={p.id} className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:border-white/20 transition">
                <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-gray-500">{p.category} • {p.variations?.length} Variants</p>
                </div>
                <button onClick={() => handleEdit(p)} className="bg-yellow-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold text-sm transition">
                Edit
                </button>
            </div>
            )) : <p className="text-center py-10 text-gray-500">No products found.</p>}
        </div>
      </div>

      <style jsx>{`
        .glass {
          backdrop-filter: blur(20px);
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 30px;
          border-radius: 24px;
        }
        .input {
          width: 100%;
          padding: 12px;
          border-radius: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: white;
          transition: all 0.2s;
        }
        .input:focus {
          outline: none;
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
}

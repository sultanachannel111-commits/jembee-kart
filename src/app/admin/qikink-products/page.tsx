"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  getDocs
} from "firebase/firestore";

import {
  Package,
  Image,
  Tag,
  Layers,
  IndianRupee,
  PlusCircle
} from "lucide-react";

export default function AdminQikinkProducts() {

  const [name,setName] = useState("");
  const [qikinkId,setQikinkId] = useState("");
  const [image,setImage] = useState("");

  const [basePrice,setBasePrice] = useState("");
  const [sellPrice,setSellPrice] = useState("");

  const [description,setDescription] = useState("");

  const [stock,setStock] = useState("");

  const [category,setCategory] = useState("");
  const [categories,setCategories] = useState<any[]>([]);

  const [type,setType] = useState("");
  const [options,setOptions] = useState("");

  /* =======================
     LOAD CATEGORIES
  ======================= */

  useEffect(()=>{
    loadCategories();
  },[]);

  const loadCategories = async()=>{

    try{

      const snap = await getDocs(
        collection(db,"qikinkCategories")
      );

      const list = snap.docs.map(doc=>({
        id:doc.id,
        ...doc.data()
      }));

      setCategories(list);

    }catch(err){
      console.log("Category load error",err);
    }

  };

  /* =======================
     SAVE PRODUCT
  ======================= */

  const saveProduct = async()=>{

    if(!name || !qikinkId || !category){
      alert("Please fill required fields");
      return;
    }

    try{

      await addDoc(
        collection(db,"products"),   // 👈 बस यही change किया है
        {

          name,
          qikinkId,
          category,
          image,

          basePrice:Number(basePrice),
          sellPrice:Number(sellPrice),

          description,

          stock:Number(stock),

          variations:{
            type:type,
            options: options ? options.split(",") : []
          },

          createdAt:serverTimestamp()

        }
      );

      alert("Product Added Successfully 🎉");

      setName("");
      setQikinkId("");
      setImage("");

      setBasePrice("");
      setSellPrice("");

      setDescription("");

      setStock("");

      setType("");
      setOptions("");

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

  {/* PRODUCT NAME */}

  <div>
  <label className="font-semibold mb-1 block">
  Product Name
  </label>

  <input
  value={name}
  onChange={(e)=>setName(e.target.value)}
  placeholder="Oversized T Shirt"
  className="border w-full p-3 rounded-lg"
  />
  </div>


  {/* QIKINK PRODUCT ID */}

  <div>

  <label className="font-semibold mb-1 block">
  Qikink Product ID
  </label>

  <input
  value={qikinkId}
  onChange={(e)=>setQikinkId(e.target.value)}
  placeholder="QK1022"
  className="border w-full p-3 rounded-lg"
  />

  </div>


  {/* CATEGORY */}

  <div>

  <label className="font-semibold mb-1 block flex items-center gap-2">
  <Layers size={18}/>
  Qikink Category
  </label>

  <select
  value={category}
  onChange={(e)=>setCategory(e.target.value)}
  className="border w-full p-3 rounded-lg"
  >

  <option value="">Select Category</option>

  {categories.map((c:any)=>(

  <option key={c.id} value={c.name}>
  {c.name}
  </option>

  ))}

  </select>

  </div>


  {/* IMAGE */}

  <div>

  <label className="font-semibold mb-1 block flex items-center gap-2">
  <Image size={18}/>
  Product Image
  </label>

  <input
  value={image}
  onChange={(e)=>setImage(e.target.value)}
  placeholder="https://image-link.jpg"
  className="border w-full p-3 rounded-lg"
  />

  </div>


  {/* IMAGE PREVIEW */}

  {image && (

  <div className="flex justify-center">

  <img
  src={image}
  className="w-32 h-32 rounded-xl shadow object-cover"
  />

  </div>

  )}


  {/* BASE PRICE */}

  <div>

  <label className="font-semibold mb-1 block flex items-center gap-2">
  <IndianRupee size={18}/>
  Qikink Base Price
  </label>

  <input
  type="number"
  value={basePrice}
  onChange={(e)=>setBasePrice(e.target.value)}
  placeholder="100"
  className="border w-full p-3 rounded-lg"
  />

  </div>


  {/* SELL PRICE */}

  <div>

  <label className="font-semibold mb-1 block">
  Sell Price
  </label>

  <input
  type="number"
  value={sellPrice}
  onChange={(e)=>setSellPrice(e.target.value)}
  placeholder="299"
  className="border w-full p-3 rounded-lg"
  />

  </div>


  {/* DESCRIPTION */}

  <div>

  <label className="font-semibold mb-1 block">
  Product Description
  </label>

  <textarea
  value={description}
  onChange={(e)=>setDescription(e.target.value)}
  placeholder="Write product description"
  className="border w-full p-3 rounded-lg"
  />

  </div>


  {/* STOCK */}

  <div>

  <label className="font-semibold mb-1 block">
  Stock Quantity
  </label>

  <input
  type="number"
  value={stock}
  onChange={(e)=>setStock(e.target.value)}
  placeholder="Enter stock"
  className="border w-full p-3 rounded-lg"
  />

  </div>


  {/* VARIATION */}

  <div>

  <label className="font-semibold mb-1 block">
  Variation Type
  </label>

  <select
  value={type}
  onChange={(e)=>setType(e.target.value)}
  className="border p-2 w-full mb-3 rounded"
  >

  <option value="">Select Variation</option>
  <option value="Size">Size</option>
  <option value="Color">Color</option>
  <option value="Number">Number</option>
  <option value="Age">Age</option>
  <option value="Custom">Custom</option>

  </select>

  <input
  value={options}
  onChange={(e)=>setOptions(e.target.value)}
  placeholder="Options (S,M,L / Red,Blue)"
  className="border p-2 w-full rounded"
  />

  </div>


  {/* BUTTON */}

  <button
  onClick={saveProduct}
  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl mt-4"
  >

  <PlusCircle size={20}/>
  Add Product

  </button>

  </div>

  </div>

  </div>

  );

}

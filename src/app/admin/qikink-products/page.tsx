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
  const [sku,setSku] = useState("");
  const [printTypeId,setPrintTypeId] = useState("");

  const [image,setImage] = useState("");
  const [frontImage,setFrontImage] = useState("");
  const [backImage,setBackImage] = useState("");
  const [sideImage,setSideImage] = useState("");
  const [modelImage,setModelImage] = useState("");

  const [designLink,setDesignLink] = useState("");
  const [mockupLink,setMockupLink] = useState("");

  const [basePrice,setBasePrice] = useState("");
  const [sellPrice,setSellPrice] = useState("");

  const [description,setDescription] = useState("");
  const [stock,setStock] = useState("");

  const [category,setCategory] = useState("");
  const [categories,setCategories] = useState<any[]>([]);

  const [variationType,setVariationType] = useState("");
  const [options,setOptions] = useState("");

  const profit =
  Number(sellPrice || 0) - Number(basePrice || 0);

  useEffect(()=>{

    loadCategories();

    const main = localStorage.getItem("image_main");
    const front = localStorage.getItem("image_front");
    const back = localStorage.getItem("image_back");
    const side = localStorage.getItem("image_side");
    const model = localStorage.getItem("image_model");

    if(main) setImage(main);
    if(front) setFrontImage(front);
    if(back) setBackImage(back);
    if(side) setSideImage(side);
    if(model) setModelImage(model);

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
      console.log(err);
    }

  };

  const saveProduct = async()=>{

    if(!name || !qikinkId || !category){
      alert("Please fill required fields");
      return;
    }

    try{

      await addDoc(collection(db,"products"),{

        name,
        qikinkId,
        sku,
        printTypeId,
        category,

        image,
        frontImage,
        backImage,
        sideImage,
        modelImage,

        designLink,
        mockupLink,

        basePrice:Number(basePrice),
        sellPrice:Number(sellPrice),
        profit,

        description,
        stock:Number(stock),

        variations:{
          type:variationType,
          options: options ? options.split(",") : []
        },

        supplier:"qikink",
        createdAt:serverTimestamp()

      });

      alert("Product Added Successfully 🎉");

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

          <input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder="Product Name"
          className="border w-full p-3 rounded-lg"
          />

          <input
          value={qikinkId}
          onChange={(e)=>setQikinkId(e.target.value)}
          placeholder="Qikink Product ID"
          className="border w-full p-3 rounded-lg"
          />

          <input
          value={sku}
          onChange={(e)=>setSku(e.target.value)}
          placeholder="SKU"
          className="border w-full p-3 rounded-lg"
          />

          <input
          value={printTypeId}
          onChange={(e)=>setPrintTypeId(e.target.value)}
          placeholder="Print Type ID"
          className="border w-full p-3 rounded-lg"
          />

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

          {/* PRODUCT IMAGE */}

          <input
          value={image ? "Image Uploaded" : ""}
          readOnly
          onClick={()=>window.location.href="/admin/upload-image?type=main"}
          placeholder="Click to upload product image"
          className="border w-full p-3 rounded-lg bg-gray-100 cursor-pointer"
          />

          {image && <img src={image} className="w-24 mt-2 rounded"/>}

          {/* FRONT IMAGE */}

          <input
          value={frontImage ? "Image Uploaded" : ""}
          readOnly
          onClick={()=>window.location.href="/admin/upload-image?type=front"}
          placeholder="Click to upload front image"
          className="border w-full p-3 rounded-lg bg-gray-100 cursor-pointer"
          />

          {frontImage && <img src={frontImage} className="w-24 mt-2 rounded"/>}

          {/* BACK IMAGE */}

          <input
          value={backImage ? "Image Uploaded" : ""}
          readOnly
          onClick={()=>window.location.href="/admin/upload-image?type=back"}
          placeholder="Click to upload back image"
          className="border w-full p-3 rounded-lg bg-gray-100 cursor-pointer"
          />

          {backImage && <img src={backImage} className="w-24 mt-2 rounded"/>}

          {/* SIDE IMAGE */}

          <input
          value={sideImage ? "Image Uploaded" : ""}
          readOnly
          onClick={()=>window.location.href="/admin/upload-image?type=side"}
          placeholder="Click to upload side image"
          className="border w-full p-3 rounded-lg bg-gray-100 cursor-pointer"
          />

          {sideImage && <img src={sideImage} className="w-24 mt-2 rounded"/>}

          {/* MODEL IMAGE */}

          <input
          value={modelImage ? "Image Uploaded" : ""}
          readOnly
          onClick={()=>window.location.href="/admin/upload-image?type=model"}
          placeholder="Click to upload model image"
          className="border w-full p-3 rounded-lg bg-gray-100 cursor-pointer"
          />

          {modelImage && <img src={modelImage} className="w-24 mt-2 rounded"/>}

          <input
          value={designLink}
          onChange={(e)=>setDesignLink(e.target.value)}
          placeholder="Design Link"
          className="border w-full p-3 rounded-lg"
          />

          <input
          value={mockupLink}
          onChange={(e)=>setMockupLink(e.target.value)}
          placeholder="Mockup Link"
          className="border w-full p-3 rounded-lg"
          />

          <input
          type="number"
          value={basePrice}
          onChange={(e)=>setBasePrice(e.target.value)}
          placeholder="Qikink Base Price"
          className="border w-full p-3 rounded-lg"
          />

          <input
          type="number"
          value={sellPrice}
          onChange={(e)=>setSellPrice(e.target.value)}
          placeholder="Sell Price"
          className="border w-full p-3 rounded-lg"
          />

          <input
          value={profit}
          readOnly
          className="border w-full p-3 rounded-lg bg-gray-100"
          />

          <textarea
          value={description}
          onChange={(e)=>setDescription(e.target.value)}
          placeholder="Product Description"
          className="border w-full p-3 rounded-lg"
          />

          <input
          type="number"
          value={stock}
          onChange={(e)=>setStock(e.target.value)}
          placeholder="Stock Quantity"
          className="border w-full p-3 rounded-lg"
          />

          <button
          onClick={saveProduct}
          className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl mt-4"
          >

          <PlusCircle size={20}/>
          Add Product

          </button>

        </div>

      </div>

    </div>

  );

}

"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function AddProduct() {

  const router = useRouter();

  const [categories,setCategories] = useState<any[]>([]);

  const [form,setForm] = useState({

    name:"",
    image:"",
    category:"",
    basePrice:"",
    sellingPrice:""

  });

  useEffect(()=>{

    loadCategories();

  },[]);

  const loadCategories = async ()=>{

    const snap = await getDocs(collection(db,"categories"));

    setCategories(
      snap.docs.map(doc=>({

        id:doc.id,
        ...doc.data()

      }))
    );

  };

  const handleChange = (e:any)=>{

    setForm({

      ...form,
      [e.target.name]:e.target.value

    });

  };

  const handleSubmit = async (e:any)=>{

    e.preventDefault();

    await addDoc(collection(db,"products"),{

      name:form.name,
      image:form.image,
      category:form.category,

      basePrice:Number(form.basePrice),
      sellingPrice:Number(form.sellingPrice),

      status:"approved",
      isActive:true,

      createdAt:serverTimestamp()

    });

    router.push("/admin/products");

  };

  return (

    <div className="p-6 max-w-xl">

      <h1 className="text-2xl font-bold mb-6">
        Add Product
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white shadow p-6 rounded-xl space-y-4"
      >

        <input
          name="name"
          placeholder="Product Name"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="image"
          placeholder="Image Link"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        {/* CATEGORY SELECT */}

        <select
          name="category"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        >

          <option value="">
            Select Category
          </option>

          {categories.map((c)=>(
            <option
              key={c.id}
              value={c.name}
            >
              {c.name}
            </option>
          ))}

        </select>

        <input
          name="basePrice"
          type="number"
          placeholder="Base Price"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <input
          name="sellingPrice"
          type="number"
          placeholder="Selling Price"
          onChange={handleChange}
          className="w-full border p-2 rounded"
        />

        <button
          type="submit"
          className="bg-purple-600 text-white px-4 py-2 rounded"
        >
          Add Product
        </button>

      </form>

    </div>

  );

}

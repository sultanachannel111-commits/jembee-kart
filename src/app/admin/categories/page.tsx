"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";

export default function AdminCategories() {

  const [name,setName] = useState("");
  const [image,setImage] = useState("");
  const [categories,setCategories] = useState<any[]>([]);
  const [editId,setEditId] = useState<string | null>(null);
  const [search,setSearch] = useState("");

  /* ==========================
     LOAD CATEGORIES
  ========================== */

  useEffect(()=>{

    const unsub = onSnapshot(
      collection(db,"qikinkCategories"),
      (snap)=>{

        const list = snap.docs.map((d)=>({
          id:d.id,
          ...d.data()
        }));

        setCategories(list);

      }
    );

    return ()=>unsub();

  },[]);

  /* ==========================
     SAVE CATEGORY
  ========================== */

  const saveCategory = async ()=>{

    if(!name || !image){
      alert("Enter name and image");
      return;
    }

    const exists = categories.find(
      (c:any)=>c.name.toLowerCase()===name.toLowerCase()
    );

    if(exists && !editId){
      alert("Category already exists");
      return;
    }

    if(editId){

      await updateDoc(
        doc(db,"qikinkCategories",editId),
        {
          name,
          image
        }
      );

      setEditId(null);

    } else {

      await addDoc(
        collection(db,"qikinkCategories"),
        {
          name,
          image,
          isActive:true,
          createdAt:serverTimestamp()
        }
      );

    }

    setName("");
    setImage("");

  };

  /* ==========================
     EDIT
  ========================== */

  const editCategory = (cat:any)=>{

    setName(cat.name);
    setImage(cat.image);
    setEditId(cat.id);

  };

  /* ==========================
     DELETE
  ========================== */

  const deleteCategory = async (id:string)=>{

    const ok = confirm("Delete this category?");

    if(!ok) return;

    await deleteDoc(
      doc(db,"qikinkCategories",id)
    );

  };

  /* ==========================
     TOGGLE ACTIVE
  ========================== */

  const toggleActive = async (cat:any)=>{

    await updateDoc(
      doc(db,"qikinkCategories",cat.id),
      {
        isActive:!cat.isActive
      }
    );

  };

  /* ==========================
     FILTER
  ========================== */

  const filtered = categories.filter((c:any)=>
    c.name?.toLowerCase().includes(
      search.toLowerCase()
    )
  );

  /* ==========================
     UI
  ========================== */

  return (

    <div className="p-6">

      {/* TITLE */}

      <h1 className="text-3xl font-bold mb-6">
        Qikink Categories
      </h1>


      {/* SEARCH */}

      <input
        placeholder="Search category"
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        className="border p-2 rounded w-full mb-6"
      />


      {/* ADD FORM */}

      <div className="bg-white shadow p-6 rounded-xl mb-8">

        <h2 className="font-semibold mb-3">
          {editId ? "Edit Category" : "Add Category"}
        </h2>

        <input
          value={name}
          onChange={(e)=>setName(e.target.value)}
          placeholder="Category Name"
          className="border px-3 py-2 rounded w-full mb-3"
        />

        <input
          value={image}
          onChange={(e)=>setImage(e.target.value)}
          placeholder="Image URL"
          className="border px-3 py-2 rounded w-full mb-3"
        />

        {/* IMAGE PREVIEW */}

        {image && (

          <img
            src={image}
            className="w-24 h-24 object-cover rounded-full mb-3"
          />

        )}

        <button
          onClick={saveCategory}
          className="bg-black text-white px-4 py-2 rounded"
        >
          {editId ? "Update Category" : "Add Category"}
        </button>

      </div>


      {/* CATEGORY GRID */}

      <div className="grid md:grid-cols-4 gap-6">

        {filtered.map((c:any)=>(

          <div
            key={c.id}
            className="bg-white p-5 rounded-xl shadow hover:shadow-lg transition text-center"
          >

            <img
              src={c.image}
              className="w-20 h-20 rounded-full object-cover mx-auto"
            />

            <p className="mt-3 font-semibold">
              {c.name}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {c.isActive ? "Active" : "Hidden"}
            </p>

            <div className="flex justify-center gap-4 mt-4">

              <button
                onClick={()=>editCategory(c)}
                className="text-blue-600"
              >
                Edit
              </button>

              <button
                onClick={()=>deleteCategory(c.id)}
                className="text-red-600"
              >
                Delete
              </button>

              <button
                onClick={()=>toggleActive(c)}
                className="text-gray-600"
              >
                {c.isActive ? "Hide" : "Show"}
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}

"use client";

import { useState, useEffect } from "react";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminFestivalPage() {

  const [image,setImage] = useState("");
  const [title,setTitle] = useState("");
  const [active,setActive] = useState(false);
  const [loading,setLoading] = useState(true);
  const [saving,setSaving] = useState(false);

  /* =========================
     FETCH FESTIVAL
  ========================= */

  useEffect(()=>{

    const fetchFestival = async ()=>{

      const snap = await getDoc(
        doc(db,"settings","festival")
      );

      if(snap.exists()){

        const data = snap.data();

        setImage(data.image || "");
        setTitle(data.title || "");
        setActive(data.active || false);

      }

      setLoading(false);

    };

    fetchFestival();

  },[]);

  /* =========================
     SAVE
  ========================= */

  const saveFestival = async ()=>{

    setSaving(true);

    await setDoc(
      doc(db,"settings","festival"),
      {
        image,
        title,
        active,
        updatedAt:new Date()
      }
    );

    setSaving(false);

    alert("Festival Updated Successfully 🎉");

  };

  if(loading){

    return(
      <div className="p-6 text-gray-500">
        Loading festival settings...
      </div>
    );

  }

  return (

    <div className="p-6 max-w-2xl">

      {/* HEADER */}

      <div className="mb-8">

        <h1 className="text-3xl font-bold text-pink-600">
          Festival Banner
        </h1>

        <p className="text-gray-500 text-sm">
          Manage homepage festival promotion banner
        </p>

      </div>


      {/* FORM CARD */}

      <div className="bg-white shadow rounded-xl p-6 space-y-5">

        {/* TITLE */}

        <div>

          <label className="text-sm font-semibold text-gray-600">
            Festival Title
          </label>

          <input
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            placeholder="Example: Diwali Sale"
            className="border px-4 py-2 rounded w-full mt-1"
          />

        </div>


        {/* IMAGE URL */}

        <div>

          <label className="text-sm font-semibold text-gray-600">
            Banner Image URL
          </label>

          <input
            value={image}
            onChange={(e)=>setImage(e.target.value)}
            placeholder="https://image-link.jpg"
            className="border px-4 py-2 rounded w-full mt-1"
          />

        </div>


        {/* IMAGE PREVIEW */}

        {image && (

          <div>

            <p className="text-sm text-gray-500 mb-2">
              Preview
            </p>

            <img
              src={image}
              className="w-full h-56 object-cover rounded-lg"
            />

          </div>

        )}


        {/* ACTIVE TOGGLE */}

        <label className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">

          <span className="text-sm font-medium text-gray-700">
            Show banner on homepage
          </span>

          <input
            type="checkbox"
            checked={active}
            onChange={(e)=>setActive(e.target.checked)}
            className="w-5 h-5"
          />

        </label>


        {/* SAVE BUTTON */}

        <button
          onClick={saveFestival}
          disabled={saving}
          className="w-full bg-pink-600 text-white py-3 rounded-lg hover:bg-pink-700 transition"
        >
          {saving ? "Saving..." : "Save Festival Banner"}
        </button>

      </div>

    </div>

  );

}

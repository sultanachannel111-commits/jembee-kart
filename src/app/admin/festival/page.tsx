"use client";

import { useState, useEffect } from "react";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
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

      try{

        const snap = await getDoc(
          doc(db,"settings","festival")
        );

        if(snap.exists()){

          const data:any = snap.data();

          setImage(data.image || "");
          setTitle(data.title || "");
          setActive(data.active || false);

        }

      }catch(err){
        console.error("Festival fetch error:",err);
      }

      setLoading(false);

    };

    fetchFestival();

  },[]);


  /* =========================
     SAVE FESTIVAL
  ========================= */

  const saveFestival = async ()=>{

    if(!image || !title){
      alert("Title and Image required");
      return;
    }

    try{

      setSaving(true);

      await setDoc(
        doc(db,"settings","festival"),
        {
          image:image,
          title:title,
          active:active,
          updatedAt:serverTimestamp()
        },
        { merge:true }
      );

      alert("Festival banner saved successfully 🎉");

    }catch(err){

      console.error("Festival save error:",err);
      alert("Error saving banner");

    }

    setSaving(false);

  };


  /* =========================
     LOADING
  ========================= */

  if(loading){

    return(
      <div className="p-6 text-gray-500">
        Loading festival settings...
      </div>
    );

  }


  /* =========================
     UI
  ========================= */

  return (

    <div className="p-6 max-w-2xl mx-auto">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-pink-600">
          🎉 Festival Banner
        </h1>
        <p className="text-gray-500 text-sm">
          Manage homepage festival promotion banner
        </p>
      </div>


      {/* CARD */}
      <div className="bg-white shadow-lg rounded-2xl p-5 space-y-5">


        {/* TITLE */}
        <div>
          <label className="text-sm font-semibold text-gray-600">
            Festival Title
          </label>

          <input
            value={title}
            onChange={(e)=>setTitle(e.target.value)}
            placeholder="Example: Diwali Sale"
            className="border px-4 py-2 rounded-lg w-full mt-1 focus:outline-none focus:ring-2 focus:ring-pink-400"
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
            className="border px-4 py-2 rounded-lg w-full mt-1 focus:outline-none focus:ring-2 focus:ring-pink-400"
          />
        </div>


        {/* 🔥 PREVIEW (FIXED SMALL SIZE) */}
        {image && (
          <div>
            <p className="text-sm text-gray-500 mb-2">
              Preview
            </p>

            <div className="relative">
              <img
                src={image}
                alt="festival preview"
                className="w-full h-32 object-cover rounded-xl shadow-md"
              />

              {/* TEXT OVERLAY */}
              <div className="absolute bottom-0 left-0 w-full p-3 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl">
                <p className="text-white font-semibold text-sm">
                  {title}
                </p>
              </div>
            </div>
          </div>
        )}


        {/* ACTIVE SWITCH */}
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
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 text-white py-3 rounded-xl shadow-md hover:scale-95 transition"
        >
          {saving ? "Saving..." : "Save Festival Banner"}
        </button>

      </div>

    </div>

  );

}

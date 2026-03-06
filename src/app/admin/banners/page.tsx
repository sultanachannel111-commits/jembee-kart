"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function AdminBanners() {

  const [image,setImage] = useState("");
  const [order,setOrder] = useState(1);
  const [banners,setBanners] = useState<any[]>([]);

  /* =========================
     LOAD BANNERS
  ========================= */

  useEffect(()=>{

    const q = query(
      collection(db,"banners"),
      orderBy("order","asc")
    );

    const unsub = onSnapshot(q,(snap)=>{

      setBanners(
        snap.docs.map((d)=>({
          id:d.id,
          ...d.data()
        }))
      );

    });

    return ()=>unsub();

  },[]);

  /* =========================
     ADD BANNER
  ========================= */

  const addBanner = async ()=>{

    if(!image){
      alert("Enter banner image URL");
      return;
    }

    await addDoc(collection(db,"banners"),{

      image,
      order:Number(order),
      active:true,
      createdAt:serverTimestamp()

    });

    setImage("");
    setOrder(1);

  };

  /* =========================
     TOGGLE ACTIVE
  ========================= */

  const toggleActive = async (id:string,active:boolean)=>{

    await updateDoc(
      doc(db,"banners",id),
      { active:!active }
    );

  };

  /* =========================
     DELETE
  ========================= */

  const deleteBanner = async (id:string)=>{

    const ok = confirm("Delete this banner?");

    if(!ok) return;

    await deleteDoc(
      doc(db,"banners",id)
    );

  };

  return (

    <div className="p-6">

      {/* HEADER */}

      <h1 className="text-3xl font-bold text-pink-600 mb-8">
        Banner Management
      </h1>


      {/* ADD BANNER */}

      <div className="bg-white p-6 rounded-xl shadow mb-10">

        <h2 className="font-semibold mb-4">
          Add New Banner
        </h2>

        <input
          type="text"
          placeholder="Banner Image URL"
          value={image}
          onChange={(e)=>setImage(e.target.value)}
          className="border p-3 w-full rounded mb-4"
        />

        {/* IMAGE PREVIEW */}

        {image && (

          <img
            src={image}
            className="w-full h-40 object-cover rounded mb-4"
          />

        )}

        <input
          type="number"
          placeholder="Order (1,2,3...)"
          value={order}
          onChange={(e)=>setOrder(Number(e.target.value))}
          className="border p-3 w-full rounded mb-4"
        />

        <button
          onClick={addBanner}
          className="bg-pink-600 text-white px-6 py-2 rounded hover:bg-pink-700"
        >
          Add Banner
        </button>

      </div>


      {/* BANNER LIST */}

      <div className="grid md:grid-cols-3 gap-6">

        {banners.map((banner:any)=>(

          <div
            key={banner.id}
            className="bg-white p-4 rounded-xl shadow hover:shadow-lg transition"
          >

            {/* IMAGE */}

            <img
              src={banner.image}
              className="w-full h-40 object-cover rounded mb-4"
            />

            {/* ORDER */}

            <p className="text-sm text-gray-500 mb-3">
              Order: {banner.order}
            </p>


            {/* BUTTONS */}

            <div className="flex justify-between">

              <button
                onClick={()=>
                  toggleActive(banner.id,banner.active)
                }
                className={`px-3 py-1 rounded text-white ${
                  banner.active
                    ? "bg-green-500"
                    : "bg-gray-400"
                }`}
              >
                {banner.active ? "Active" : "Inactive"}
              </button>

              <button
                onClick={()=>
                  deleteBanner(banner.id)
                }
                className="bg-red-500 text-white px-3 py-1 rounded"
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </div>

  );

}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  getDocs
} from "firebase/firestore";

import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import ReviewSection from "@/components/product/ReviewSection";

export default function ProductPage() {

  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  const [product,setProduct] = useState<any>(null);
  const [loading,setLoading] = useState(true);
  const [user,setUser] = useState<any>(null);

  const [selectedColor,setSelectedColor] = useState(0);
  const [selectedSize,setSelectedSize] = useState<any>(null);

  const [currentImage,setCurrentImage] = useState(0);
  const [showViewer,setShowViewer] = useState(false);

  const [similar,setSimilar] = useState<any[]>([]);

  // PINCODE
  const [pincode,setPincode] = useState("");
  const [pinStatus,setPinStatus] = useState("");

  // TIMER (2 hours)
  const [timeLeft,setTimeLeft] = useState(7200);

  // AUTH
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,(u)=>setUser(u));
    return ()=>unsub();
  },[]);

  // FETCH PRODUCT
  useEffect(()=>{
    const fetchProduct = async()=>{
      const snap = await getDoc(doc(db,"products",id));

      if(snap.exists()){
        const data:any = { id:snap.id, ...snap.data() };
        setProduct(data);

        const first = data?.variations?.[0];
        setSelectedSize(first?.sizes?.[0] || null);

        fetchSimilar(data.category);

        // recently viewed
        const recent = JSON.parse(localStorage.getItem("recent") || "[]");
        const updated = [data, ...recent.filter((p:any)=>p.id!==data.id)].slice(0,5);
        localStorage.setItem("recent",JSON.stringify(updated));
      }

      setLoading(false);
    };

    if(id) fetchProduct();
  },[id]);

  // TIMER LOGIC
  useEffect(()=>{
    if(!product?.isTrending) return;

    const t = setInterval(()=>{
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    },1000);

    return ()=>clearInterval(t);
  },[product]);

  // AFFILIATE
  useEffect(()=>{
    if(!ref) return;

    localStorage.setItem("affiliate",ref);

    const u = auth.currentUser;
    if(!u) return;

    setDoc(doc(db,"userAffiliate",u.uid),{
      refCode: ref,
      updatedAt: new Date()
    },{merge:true});

  },[ref]);

  const fetchSimilar = async(category:string)=>{
    const snap = await getDocs(collection(db,"products"));
    const data = snap.docs
      .map(d=>({id:d.id,...d.data()}))
      .filter((p:any)=>p.category===category && p.id!==id)
      .slice(0,6);

    setSimilar(data);
  };

  if(loading) return <div className="p-5">Loading...</div>;
  if(!product) return <div className="p-5">Not found</div>;

  const variant = product?.variations?.[selectedColor] || {};

  const images = [
    variant?.images?.main,
    variant?.images?.front,
    variant?.images?.back
  ].filter(Boolean);

  const price =
    Number(selectedSize?.sellPrice) ||
    Number(product?.price) || 0;

  const stock = Number(selectedSize?.stock) || 0;

  // FORMAT TIMER
  const formatTime = ()=>{
    const h = Math.floor(timeLeft/3600);
    const m = Math.floor((timeLeft%3600)/60);
    return `${h}h ${m}m`;
  };

  // PINCODE CHECK
  const checkPincode = ()=>{
    if(pincode.length !== 6) return alert("Invalid");

    if(pincode.startsWith("8")){
      setPinStatus("fast");
    } else {
      setPinStatus("slow");
    }
  };

  // DELIVERY DATE
  const getDelivery = ()=>{
    const d = new Date();
    d.setDate(d.getDate()+4);
    return d.toDateString();
  };

  // ADD CART
  const handleAddToCart = async()=>{
    if(!user) return router.push("/login");
    if(!selectedSize) return alert("Select size");

    await addDoc(collection(db,"carts",user.uid,"items"),{
      productId: product.id,
      name: product.name,
      image: images[0],
      size: selectedSize.size,
      price,
      quantity:1
    });

    alert("Added");
  };

  // BUY NOW
  const handleBuyNow = ()=>{
    localStorage.setItem("buy-now",JSON.stringify({
      id: product.id,
      name: product.name,
      image: images[0],
      price
    }));

    router.push("/checkout");
  };

  // WHATSAPP
  const whatsapp = ()=>{
    const msg = `Hi I want ${product.name} ₹${price}`;
    window.open(`https://wa.me/?text=${msg}`);
  };

  return (
    <div className="pb-28">

      {/* TRENDING */}
      {product?.isTrending && (
        <div className="bg-red-500 text-white text-center text-xs py-1">
          🔥 Trending Product
        </div>
      )}

      {/* IMAGE */}
      <div className="relative">
        <img
          src={images[currentImage]}
          onClick={()=>setShowViewer(true)}
          className="w-full h-[300px] object-contain"
        />

        {/* arrows */}
        <button onClick={()=>setCurrentImage(i=>i>0?i-1:i)}
          className="absolute left-2 top-1/2 bg-white px-2">‹</button>

        <button onClick={()=>setCurrentImage(i=>i<images.length-1?i+1:i)}
          className="absolute right-2 top-1/2 bg-white px-2">›</button>
      </div>

      {/* dots */}
      <div className="flex justify-center gap-2 mt-2">
        {images.map((_:any,i:number)=>(
          <div key={i} className={`w-2 h-2 rounded-full ${i===currentImage?"bg-blue-500":"bg-gray-300"}`}/>
        ))}
      </div>
      {/* 🔥 VARIANT THUMBNAILS */}
<div className="flex gap-3 mt-3 px-4">
  {product?.variations?.map((v:any,i:number)=>(
    <img
      key={i}
      src={v?.images?.main}
      onClick={()=>{
        setSelectedColor(i);
        setSelectedSize(v?.sizes?.[0] || null);
        setCurrentImage(0);
      }}
      className={`w-14 h-14 rounded-xl object-cover border-2 cursor-pointer transition ${
        selectedColor === i
          ? "border-blue-600 scale-105 shadow"
          : "border-gray-200"
      }`}
    />
  ))}
</div>

      {/* FULL VIEW */}
      {showViewer && (
        <div onClick={()=>setShowViewer(false)}
          className="fixed inset-0 bg-black flex items-center justify-center z-50">
          <img src={images[currentImage]} className="max-h-full"/>
        </div>
      )}

      <div className="p-4 space-y-4">

        <h1 className="font-bold text-lg">{product.name}</h1>

        <div className="text-2xl font-bold text-green-600">₹{price}</div>

        {/* TIMER */}
        {product?.isTrending && (
          <div className="bg-orange-100 p-2 rounded text-sm">
            ⏳ Offer ends in {formatTime()}
          </div>
        )}

        {/* STOCK */}
        {stock < 5 && stock>0 && (
          <div className="text-red-500 font-bold">
            Only {stock} left 🔥
          </div>
        )}

        {/* SIZE */}
        <div className="grid grid-cols-3 gap-2">
          {variant?.sizes?.map((s:any,i:number)=>(
            <div key={i}
              onClick={()=>setSelectedSize(s)}
              className={`p-2 border rounded text-center ${
                selectedSize?.size===s.size?"bg-blue-500 text-white":""
              }`}>
              {s.size}
            </div>
          ))}
        </div>

        {/* PINCODE */}
        <div className="glass p-3 rounded-xl">
          <input
            value={pincode}
            onChange={(e)=>setPincode(e.target.value)}
            placeholder="Enter pincode"
            className="border p-2 w-full"
          />
          <button onClick={checkPincode} className="mt-2 bg-black text-white px-4 py-1 rounded">
            Check
          </button>

          {pinStatus==="fast" && <p>⚡ Fast delivery</p>}
          {pinStatus==="slow" && <p>🚚 Normal delivery</p>}

          <p className="text-sm mt-2">Delivery by {getDelivery()}</p>

          <div className="mt-2 text-xs">🔒 Secure • 🚚 COD</div>
        </div>

        {/* DESCRIPTION */}
        <div className="bg-white p-3 rounded-xl shadow">
          {product.description}
        </div>

        {/* SIMILAR */}
        <h3 className="font-bold text-lg">You may also like</h3>

        <div className="flex gap-3 overflow-x-auto">
          {similar.map((p:any)=>(
            <div key={p.id}
              onClick={()=>router.push(`/product/${p.id}`)}
              className="min-w-[120px]">
              <img src={p?.variations?.[0]?.images?.main}/>
              <p>{p.name}</p>
            </div>
          ))}
        </div>

        <ReviewSection product={product} />

      </div>

      {/* 🔥 PREMIUM BOTTOM BAR */}
<div className="fixed bottom-0 left-0 w-full bg-white border-t px-3 py-3 flex gap-3 z-50">

  <button
    onClick={handleAddToCart}
    className="flex-1 py-3 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold bg-white active:scale-95"
  >
    Add to Cart
  </button>

  <button
    onClick={handleBuyNow}
    className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-blue-500 to-blue-700 shadow-lg active:scale-95"
  >
    Buy Now
  </button>

</div>

    </div>
  );
}

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

  // 🔐 AUTH
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,(u)=>setUser(u));
    return ()=>unsub();
  },[]);

  // 🔥 FETCH PRODUCT
  useEffect(()=>{
    const fetchProduct = async()=>{
      const snap = await getDoc(doc(db,"products",id));

      if(snap.exists()){
        const data:any = { id:snap.id, ...snap.data() };
        setProduct(data);

        const first = data?.variations?.[0];
        setSelectedSize(first?.sizes?.[0] || null);

        fetchSimilar(data.category);
      }

      setLoading(false);
    };

    if(id) fetchProduct();
  },[id]);
  // 🔥 AFFILIATE TRACKING
useEffect(() => {

  const saveAffiliate = async () => {

    if (!ref) return;

    // 🔥 localStorage save
    localStorage.setItem("affiliate", ref);

    const user = auth.currentUser;

    if (!user) return;

    try {

      await setDoc(
        doc(db, "userAffiliate", user.uid),
        {
          refCode: ref,
          updatedAt: new Date()
        },
        { merge: true }
      );

      console.log("🔥 Affiliate saved:", ref);

    } catch (err) {
      console.log(err);
    }

  };

  saveAffiliate();

}, [ref]);

  // 🔥 SIMILAR
  const fetchSimilar = async (category:string)=>{
    const snap = await getDocs(collection(db,"products"));

    const data = snap.docs
      .map(d=>({id:d.id,...d.data()}))
      .filter((p:any)=>p.category === category && p.id !== id)
      .slice(0,6);

    setSimilar(data);
  };

  if(loading) return <div className="p-5">Loading...</div>;
  if(!product) return <div className="p-5">Product not found</div>;

  const variant = product?.variations?.[selectedColor] || {};

  const images = [
    variant?.images?.main,
    variant?.images?.front,
    variant?.images?.back,
    variant?.images?.side,
    variant?.images?.model
  ].filter(Boolean);

  // 🔥 PRICE FIX
  const price =
    Number(selectedSize?.sellPrice) ||
    Number(selectedSize?.price) ||
    Number(variant?.sizes?.[0]?.sellPrice) ||
    Number(variant?.sizes?.[0]?.price) ||
    Number(product?.price) ||
    0;

  const stock = Number(selectedSize?.stock) || 0;
  // 🚚 DELIVERY DATE
const getDeliveryDate = () => {
  const today = new Date();

  const min = new Date(today);
  min.setDate(today.getDate() + 3);

  const max = new Date(today);
  max.setDate(today.getDate() + 6);

  const options: any = { weekday: "short", day: "numeric", month: "short" };

  return {
    min: min.toLocaleDateString("en-IN", options),
    max: max.toLocaleDateString("en-IN", options)
  };
};

const delivery = getDeliveryDate();

  // 🛒 CART
  const handleAddToCart = async () => {

  if (!user) return router.push(`/login?redirect=/product/${id}`);
  if (!selectedSize) return alert("Select size");

  // 🔥 REF CODE
  const refCode =
    typeof window !== "undefined"
      ? localStorage.getItem("affiliate")
      : null;

  let sellerId = null;

  if (refCode) {
    try {
      const snap = await getDoc(doc(db, "affiliateLinks", refCode));
      if (snap.exists()) {
        sellerId = snap.data().sellerId;
      }
    } catch (err) {
      console.log(err);
    }
  }

  const finalPrice =
    Number(selectedSize?.sellPrice) ||
    Number(selectedSize?.price) ||
    Number(variant?.sizes?.[0]?.sellPrice) ||
    Number(product?.price) ||
    0;

  await addDoc(collection(db,"carts",user.uid,"items"),{
    productId: product.id,
    name: product.name,
    image: images?.[0] || "",
    size: selectedSize.size,

    // 💰 PRICE FIX
    price: finalPrice,
    sellPrice: finalPrice,
    basePrice: Number(selectedSize?.basePrice) || 0,

    quantity: 1,

    // 🔥 AFFILIATE
    affiliateCode: refCode,
    sellerId: sellerId
  });

  alert("Added to cart");
  router.push("/cart");
};

  // ⚡ BUY
  const handleBuyNow = async () => {

  if (!user) return router.push(`/login?redirect=/product/${id}`);
  if (!selectedSize) return alert("Select size");

  // 🔥 affiliate code (IMPORTANT)
  const refCode =
    typeof window !== "undefined"
      ? localStorage.getItem("affiliate")
      : null;

  const item = {
    id: product.id,
    name: product.name,
    image: images?.[0] || "",
    size: selectedSize.size,
    quantity: 1,

    // 🔥 PRICE FIX
    price:
      Number(selectedSize?.sellPrice) ||
      Number(selectedSize?.price) ||
      Number(variant?.sizes?.[0]?.sellPrice) ||
      Number(product?.price) ||
      0,

    variations: product.variations || [],

    // 🔥 AFFILIATE ADD
    affiliateCode: refCode || null
  };

  console.log("🔥 BUY NOW SAVE:", item);

  localStorage.setItem("buy-now", JSON.stringify(item));

  router.push("/checkout");
};

  // 🔗 SHARE
  const handleShare = ()=>{
    navigator.share?.({
      title: product.name,
      url: window.location.href
    });
  };

  // 🔥 SLIDER FIX (one by one)
  const handleScroll = (e:any)=>{
    const index = Math.round(
      e.target.scrollLeft / e.target.clientWidth
    );
    setCurrentImage(index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white pb-28">

      {/* IMAGE SLIDER */}
      <div
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
      >
        {images.map((img:any,i:number)=>(
          <div key={i} className="min-w-full snap-center">
            <img
              src={img}
              onClick={()=>setShowViewer(true)}
              className="w-full h-[320px] object-contain"
            />
          </div>
        ))}
      </div>

      {/* 🔥 ZOOM VIEW */}
      {showViewer && (
        <div className="fixed inset-0 bg-black z-50 flex flex-col">
          <button
            onClick={()=>setShowViewer(false)}
            className="text-white text-xl p-4"
          >
            ✕
          </button>

          <div className="flex-1 flex items-center justify-center">
            <img
              src={images[currentImage]}
              className="max-w-full max-h-full"
            />
          </div>
        </div>
      )}

      {/* SHARE */}
      <button
        onClick={handleShare}
        className="absolute top-4 right-4 bg-white p-2 rounded-full shadow"
      >
        🔗
      </button>

      {/* DOTS */}
      <div className="flex justify-center gap-2 mt-2">
        {images.map((_,i)=>(
          <div key={i} className={`w-2 h-2 rounded-full ${
            currentImage===i ? "bg-blue-600" : "bg-gray-300"
          }`}/>
        ))}
      </div>

      <div className="p-4">

        {/* COLOR */}
        <div className="flex gap-3 overflow-x-auto">
          {product?.variations?.map((v:any,i:number)=>(
            <img
              key={i}
              src={v?.images?.main}
              onClick={()=>{
                setSelectedColor(i);
                setSelectedSize(v?.sizes?.[0] || null);
              }}
              className={`w-16 h-16 rounded-xl border ${
                selectedColor===i ? "border-blue-600" : ""
              }`}
            />
          ))}
        </div>

        {/* NAME */}
        <h1 className="text-xl font-bold mt-4">{product.name}</h1>

        {/* MAIN PRICE */}
        <div className="mt-2 text-3xl font-bold text-green-600">
          ₹{price}
        </div>

        {/* SIZE */}
        <div className="mt-5">
          <h3 className="font-semibold mb-3">Select Size</h3>

          <div className="grid grid-cols-3 gap-3">
            {variant?.sizes?.map((s:any,i:number)=>(
              <div
                key={i}
                onClick={()=>setSelectedSize(s)}
                className={`p-3 rounded-xl border text-center ${
                  selectedSize?.size===s.size
                    ? "bg-blue-600 text-white"
                    : "bg-white"
                }`}
              >
                {s.size}
              </div>
            ))}
          </div>
        </div>

        {/* ❌ SIZE PRICE REMOVED */}

        {/* DESCRIPTION */}
        <div className="mt-4 bg-white/60 backdrop-blur p-4 rounded-2xl shadow">
          {product.description || "Premium product"}
        </div>
        {/* 🚚 DELIVERY DATE */}
<div className="mt-4 mb-2 p-4 rounded-2xl 
                bg-white/60 backdrop-blur 
                border border-gray-200 shadow-sm">

  <div className="flex items-center gap-2 text-sm text-gray-600">
    🚚 <span className="font-medium">Delivery</span>
  </div>

  <p className="mt-1 text-xl font-bold bg-gradient-to-r from-black to-gray-600 bg-clip-text text-transparent">
    {delivery.min} - {delivery.max}
  </p>

  <p className="text-xs text-green-600 mt-1">
    ✔ Free Delivery • Cash on Delivery available
  </p>

</div>

        {/* SIMILAR */}
        <div className="mt-6">
          <h3 className="font-bold mb-3">You may also like</h3>

          <div className="flex gap-3 overflow-x-auto">
            {similar.map((p:any)=>(
              <div
                key={p.id}
                onClick={()=>router.push(`/product/${p.id}`)}
                className="min-w-[140px] bg-white p-2 rounded-xl shadow"
              >
                <img
                  src={p?.variations?.[0]?.images?.main}
                  className="h-32 w-full object-cover rounded"
                />
                <p className="text-sm">{p.name}</p>
                <p className="text-green-600 font-bold">
                  ₹{p?.variations?.[0]?.sizes?.[0]?.sellPrice || 0}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
      {/* ⭐ REVIEWS ADD HERE */}
<ReviewSection product={product} />


      {/* BUTTONS */}
      <div className="fixed bottom-0 left-0 w-full flex gap-3 p-3 bg-white border-t">
        <button
          onClick={handleAddToCart}
          className="w-1/2 py-3 rounded-xl border border-blue-600 text-blue-600"
        >
          Add to Cart
        </button>

        <button
          onClick={handleBuyNow}
          className="w-1/2 py-3 rounded-xl bg-blue-600 text-white"
        >
          Buy Now
        </button>
      </div>

    </div>
  );
}

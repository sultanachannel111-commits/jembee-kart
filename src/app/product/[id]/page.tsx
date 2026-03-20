"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ProductPage() {

  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [product,setProduct] = useState<any>(null);
  const [loading,setLoading] = useState(true);
  const [user,setUser] = useState<any>(null);

  const [selectedColor,setSelectedColor] = useState(0);
  const [selectedSize,setSelectedSize] = useState<any>(null);

  const [currentImage,setCurrentImage] = useState(0);
  const [showViewer,setShowViewer] = useState(false);

  // 🔐 AUTH
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,(u)=>{
      console.log("USER:", u);
      setUser(u);
    });
    return ()=>unsub();
  },[]);

  // 🔥 FETCH PRODUCT
  useEffect(()=>{
    const fetchProduct = async()=>{
      try {
        const snap = await getDoc(doc(db,"products",id));

        if(snap.exists()){
          const data:any = { id:snap.id, ...snap.data() };
          setProduct(data);

          if(data?.variations?.length){
            const firstVariant = data.variations[0];
            setSelectedColor(0);
            setSelectedSize(firstVariant?.sizes?.[0] || null);
          }
        }

      } catch (err) {
        console.log("FETCH ERROR:", err);
      }

      setLoading(false);
    };

    if(id) fetchProduct();
  },[id]);

  if(loading) return <div className="p-5">Loading...</div>;
  if(!product) return <div className="p-5">Product not found</div>;

  const variant = product?.variations?.[selectedColor] || {};

  // 🔥 IMAGE ARRAY SAFE
  const images = [
    variant?.images?.main,
    variant?.images?.front,
    variant?.images?.back,
    variant?.images?.side,
    variant?.images?.model
  ].filter(Boolean);

  // 🔥 PRICE FIX (NO ZERO BUG)
  const price =
    Number(selectedSize?.price) ||
    Number(variant?.sellPrice) ||
    Number(variant?.basePrice) ||
    Number(product?.price) ||
    0;

  const stock = Number(selectedSize?.stock) || 0;

  // 🛒 ADD TO CART
  const handleAddToCart = async () => {

    if (!user) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }

    if (!selectedSize) {
      alert("Select size");
      return;
    }

    try {

      await addDoc(
        collection(db, "carts", user.uid, "items"),
        {
          productId: product.id,
          name: product.name,
          image: images?.[0] || product?.image || "",
          size: selectedSize.size,
          price: Number(price || 0),
          quantity: 1,
          createdAt: new Date()
        }
      );

      alert("✅ Added to Cart");

      // 🔥 REDIRECT
      router.push("/cart");

    } catch (err) {
      console.log("CART ERROR:", err);
      alert("❌ Cart error");
    }
  };

  // ⚡ BUY NOW
  const handleBuyNow = async () => {

    if (!user) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }

    if (!selectedSize) {
      alert("Select size");
      return;
    }

    try {

      const orderRef = await addDoc(
        collection(db, "orders"),
        {
          userId: user.uid,
          productId: product.id,
          name: product.name,
          image: images?.[0] || "",
          size: selectedSize.size,
          price: Number(price || 0),
          status: "pending",
          createdAt: new Date()
        }
      );

      router.push(`/checkout?orderId=${orderRef.id}`);

    } catch (err) {
      console.log("ORDER ERROR:", err);
      alert("❌ Order error");
    }
  };

  // 🔥 SLIDER SCROLL
  const handleScroll = (e:any)=>{
    const scrollLeft = e.target.scrollLeft;
    const width = e.target.clientWidth;
    const index = Math.round(scrollLeft / width);
    setCurrentImage(index);
  };

  return (
    <div className="bg-white min-h-screen">

      {/* 🔥 IMAGE SLIDER */}
      <div
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory"
      >
        {images.map((img:any,i:number)=>(
          <img
            key={i}
            src={img}
            onClick={()=>setShowViewer(true)}
            className="w-full h-[350px] object-contain snap-center flex-shrink-0"
          />
        ))}
      </div>

      {/* 🔥 DOTS */}
      <div className="flex justify-center gap-2 mt-2">
        {images.map((_,i)=>(
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              currentImage===i ? "bg-blue-600" : "bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* 🔥 FULLSCREEN VIEW */}
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

      <div className="p-4">

        {/* 🔥 COLOR SELECT */}
        <div className="flex gap-3 mt-3 overflow-x-auto">
          {product?.variations?.map((v:any,i:number)=>(
            <img
              key={i}
              src={v?.images?.main || ""}
              onClick={()=>{
                setSelectedColor(i);
                setSelectedSize(v?.sizes?.[0] || null);
                setCurrentImage(0);
              }}
              className={`w-16 h-16 rounded-xl border ${
                selectedColor===i ? "border-black" : "border-gray-300"
              }`}
            />
          ))}
        </div>

        {/* NAME */}
        <h1 className="text-xl font-bold mt-4">
          {product?.name}
        </h1>

        {/* PRICE */}
        <div className="mt-2">
          <span className="text-3xl font-bold">₹{price}</span>
          <span className="text-green-600 ml-2 text-sm">Best Price</span>
        </div>

        {/* STOCK */}
        <p className={`mt-1 ${
          stock>0 ? "text-green-600" : "text-red-500"
        }`}>
          {stock>0 ? `In Stock (${stock})` : "Out of Stock"}
        </p>

        {/* SIZE */}
        <div className="mt-5">
          <h3 className="font-semibold mb-3">Select Size</h3>

          <div className="grid grid-cols-3 gap-3">
            {variant?.sizes?.map((s:any,i:number)=>(
              <div
                key={i}
                onClick={()=>s.stock>0 && setSelectedSize(s)}
                className={`p-3 rounded-xl border text-center ${
                  selectedSize?.size===s.size
                    ? "bg-black text-white"
                    : ""
                } ${
                  s.stock===0
                    ? "opacity-40 line-through"
                    : "cursor-pointer"
                }`}
              >
                <div>{s.size}</div>
                <div className="text-sm">₹{s.price}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 🔥 BUTTONS */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={handleAddToCart}
            className="w-full border border-black py-3 rounded-xl"
          >
            Add to Cart
          </button>

          <button
            onClick={handleBuyNow}
            disabled={stock===0}
            className="w-full bg-black text-white py-3 rounded-xl"
          >
            Buy Now
          </button>
        </div>

      </div>

    </div>
  );
}

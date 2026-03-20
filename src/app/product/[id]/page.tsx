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
  const [zoom,setZoom] = useState(false);

  // 🔐 AUTH
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,(u)=>{
      setUser(u);
    });
    return ()=>unsub();
  },[]);

  // 🔥 FETCH PRODUCT
  useEffect(()=>{
    const fetchProduct = async()=>{
      const snap = await getDoc(doc(db,"products",id));

      if(snap.exists()){
        const data:any = { id:snap.id, ...snap.data() };
        setProduct(data);

        if(data?.variations?.length){
          setSelectedColor(0);
          setSelectedSize(data.variations[0].sizes[0]);
        }
      }

      setLoading(false);
    };

    if(id) fetchProduct();
  },[id]);

  if(loading) return <div className="p-5">Loading...</div>;
  if(!product) return <div className="p-5">Product not found</div>;

  const variant = product.variations[selectedColor];

  // 🔥 IMAGE ARRAY
  const images = [
    variant?.images?.main,
    variant?.images?.front,
    variant?.images?.back,
    variant?.images?.side,
    variant?.images?.model
  ].filter(Boolean);

  const price = selectedSize?.price || variant?.sellPrice || 0;
  const stock = selectedSize?.stock || 0;

  // 👉 ADD TO CART
  const handleAddToCart = async ()=>{

    if(!user){
      alert("Login required 🔐");
      return;
    }

    if(!selectedSize){
      alert("Select size");
      return;
    }

    try{

      await addDoc(
        collection(db,"carts",user.uid,"items"),
        {
          productId: product.id,
          name: product.name,
          image: images[0],
          size: selectedSize.size,
          price: selectedSize.price,
          quantity: 1,
          createdAt: new Date()
        }
      );

      alert("Added to Cart 🛒");

    }catch(err){
      console.log(err);
      alert("Error");
    }
  };

  // 👉 BUY NOW
  const handleBuyNow = async ()=>{

    if(!user){
      alert("Login required 🔐");
      return;
    }

    if(!selectedSize){
      alert("Select size");
      return;
    }

    try{

      const docRef = await addDoc(
        collection(db,"orders"),
        {
          userId: user.uid,
          productId: product.id,
          name: product.name,
          image: images[0],
          size: selectedSize.size,
          price: selectedSize.price,
          status: "pending",
          createdAt: new Date()
        }
      );

      router.push(`/checkout?orderId=${docRef.id}`);

    }catch(err){
      console.log(err);
      alert("Error");
    }
  };

  return (
    <div className="p-4">

      {/* 🔥 IMAGE SLIDER */}
      <div className="relative bg-gray-100 rounded-2xl overflow-hidden">

        <img
          src={images[currentImage]}
          onClick={()=>setZoom(!zoom)}
          className={`w-full h-[320px] object-contain transition ${
            zoom ? "scale-150" : ""
          }`}
        />

        {/* DOTS */}
        <div className="absolute bottom-2 w-full flex justify-center gap-2">
          {images.map((_,i)=>(
            <div
              key={i}
              onClick={()=>setCurrentImage(i)}
              className={`w-2 h-2 rounded-full ${
                currentImage===i ? "bg-blue-600" : "bg-gray-400"
              }`}
            />
          ))}
        </div>

      </div>

      {/* 🔥 COLOR SELECT */}
      <div className="flex gap-3 mt-4 overflow-x-auto">
        {product.variations.map((v:any,i:number)=>(
          <img
            key={i}
            src={v.images?.main}
            onClick={()=>{
              setSelectedColor(i);
              setSelectedSize(v.sizes[0]);
              setCurrentImage(0);
            }}
            className={`w-16 h-16 rounded-xl border ${
              selectedColor===i
                ? "border-black"
                : "border-gray-300"
            }`}
          />
        ))}
      </div>

      {/* NAME */}
      <h1 className="text-xl font-bold mt-4">
        {product.name}
      </h1>

      {/* PRICE */}
      <div className="mt-2 flex items-center gap-2">
        <span className="text-3xl font-bold">₹{price}</span>
        <span className="text-green-600 text-sm">Best Price</span>
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
          {variant?.sizes.map((s:any,i:number)=>(
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
          className="w-full border border-black py-3 rounded-xl font-semibold"
        >
          Add to Cart
        </button>

        <button
          onClick={handleBuyNow}
          disabled={stock===0}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold"
        >
          Buy Now
        </button>

      </div>

    </div>
  );
}

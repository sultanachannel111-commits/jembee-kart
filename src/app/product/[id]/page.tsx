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

  // AUTH
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,(u)=>setUser(u));
    return ()=>unsub();
  },[]);

  // FETCH
  useEffect(()=>{
    const fetchProduct = async()=>{
      const snap = await getDoc(doc(db,"products",id));

      if(snap.exists()){
        const data:any = { id:snap.id, ...snap.data() };
        setProduct(data);

        if(data?.variations?.length){
          const v = data.variations[0];
          setSelectedSize(v?.sizes?.[0] || null);
        }
      }

      setLoading(false);
    };

    if(id) fetchProduct();
  },[id]);

  if(loading) return <div className="p-5">Loading...</div>;
  if(!product) return <div className="p-5">Product not found</div>;

  const variant = product.variations[selectedColor];

  const images = Object.values(variant.images || {}).filter(Boolean);

  const price =
    Number(selectedSize?.sellPrice) ||
    Number(selectedSize?.price) ||
    0;

  const stock = Number(selectedSize?.stock) || 0;

  // ADD TO CART
  const handleAddToCart = async () => {

    if (!user) return router.push(`/login?redirect=/product/${id}`);
    if (!selectedSize) return alert("Select size");

    await addDoc(collection(db,"carts",user.uid,"items"),{
      productId: product.id,
      name: product.name,
      image: images[0],
      size: selectedSize.size,

      price: price,
      sellPrice: price,

      quantity: 1,
      createdAt: new Date()
    });

    alert("✅ Added to cart");
  };

  // BUY NOW
  const handleBuyNow = async () => {

    if (!user) return router.push(`/login?redirect=/product/${id}`);
    if (!selectedSize) return alert("Select size");

    const ref = await addDoc(collection(db,"orders"),{
      userId: user.uid,
      productId: product.id,
      name: product.name,
      image: images[0],
      size: selectedSize.size,
      price: price,
      status: "pending",
      createdAt: new Date()
    });

    router.push(`/checkout?orderId=${ref.id}`);
  };

  const handleScroll = (e:any)=>{
    const index = Math.round(e.target.scrollLeft / e.target.clientWidth);
    setCurrentImage(index);
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white min-h-screen pb-24">

      {/* IMAGE SLIDER */}
      <div
        onScroll={handleScroll}
        className="flex overflow-x-auto snap-x snap-mandatory"
      >
        {images.map((img:any,i:number)=>(
          <img
            key={i}
            src={img}
            onClick={()=>setShowViewer(true)}
            className="w-full h-[380px] object-contain snap-center flex-shrink-0"
          />
        ))}
      </div>

      {/* DOTS */}
      <div className="flex justify-center gap-2 mt-2">
        {images.map((_,i)=>(
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              currentImage===i?"bg-black":"bg-gray-300"
            }`}
          />
        ))}
      </div>

      {/* FULLSCREEN VIEW */}
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

      {/* CONTENT */}
      <div className="p-4">

        <h1 className="text-xl font-semibold">{product.name}</h1>

        {/* PRICE */}
        <div className="mt-2 flex items-center gap-2">
          <span className="text-3xl font-bold">₹{price}</span>
          <span className="text-green-600 text-sm">Best Price</span>
        </div>

        {/* STOCK */}
        <p className={`mt-1 ${
          stock>0?"text-green-600":"text-red-500"
        }`}>
          {stock>0?"In Stock":"Out of Stock"}
        </p>

        {/* COLORS */}
        <div className="flex gap-3 mt-4 overflow-x-auto">
          {product.variations.map((v:any,i:number)=>(
            <img
              key={i}
              src={v.images.main}
              onClick={()=>{
                setSelectedColor(i);
                setSelectedSize(v.sizes[0]);
                setCurrentImage(0);
              }}
              className={`w-16 h-16 rounded-xl border ${
                selectedColor===i?"border-black":"border-gray-300"
              }`}
            />
          ))}
        </div>

        {/* SIZE */}
        <div className="mt-5">
          <h3 className="font-semibold mb-2">Select Size</h3>

          <div className="grid grid-cols-3 gap-3">
            {variant.sizes.map((s:any,i:number)=>(
              <div
                key={i}
                onClick={()=>s.stock>0 && setSelectedSize(s)}
                className={`p-3 rounded-xl text-center border transition ${
                  selectedSize?.size===s.size
                    ? "bg-black text-white scale-105"
                    : "bg-white"
                } ${
                  s.stock===0 ? "opacity-40 line-through" : ""
                }`}
              >
                <div>{s.size}</div>
                <div className="text-sm">
                  ₹{s.sellPrice || s.price}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* STICKY BUTTONS */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t p-3 flex gap-3">

        <button
          onClick={handleAddToCart}
          className="w-1/2 border border-black py-3 rounded-xl font-medium"
        >
          Add to Cart
        </button>

        <button
          onClick={handleBuyNow}
          disabled={stock===0}
          className="w-1/2 bg-black text-white py-3 rounded-xl font-medium"
        >
          Buy Now
        </button>

      </div>

    </div>
  );
}

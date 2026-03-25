"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, setDoc, addDoc, collection, getDocs } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import ReviewSection from "@/components/product/ReviewSection";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Truck, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Timer, 
  TrendingUp, 
  Share2, 
  MessageCircle 
} from "lucide-react";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const searchParams = useSearchParams();
  const ref = searchParams.get("ref");

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [showViewer, setShowViewer] = useState(false);
  const [similar, setSimilar] = useState<any[]>([]);
  const [pincode, setPincode] = useState("");
  const [pinStatus, setPinStatus] = useState("");
  // --- NEW FEATURES STATES ---
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hrs: 2, mins: 45, secs: 10 });
  const [zoomStyle, setZoomStyle] = useState({ display: "none", left: 0, top: 0, x: 0, y: 0 });

  // 🔐 AUTH & RECENTLY VIEWED
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // 🔥 FETCH PRODUCT & TIMER LOGIC
  useEffect(() => {
    const fetchProduct = async () => {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) {
        const data: any = { id: snap.id, ...snap.data() };
        setProduct(data);
        const first = data?.variations?.[0];
        setSelectedSize(first?.sizes?.[0] || null);
        fetchSimilar(data.category);
        
        // Save to Recently Viewed
        const recent = JSON.parse(localStorage.getItem("recent_viewed") || "[]");
        const updated = [data, ...recent.filter((p: any) => p.id !== data.id)].slice(0, 10);
        localStorage.setItem("recent_viewed", JSON.stringify(updated));
      }
      setLoading(false);
    };
    if (id) fetchProduct();

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        return { hrs: prev.hrs - 1, mins: 59, secs: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [id]);

  // 🚚 PINCODE & DELIVERY
  const checkPincode = () => {
    if (pincode.length === 6) {
      const date = new Date();
      date.setDate(date.getDate() + 4); // Expect 4 days delivery
      setDeliveryDate(date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' }));
    } else {
      alert("Enter valid pincode");
    }
  };

  // 🔍 ZOOM ON HOVER
  const handleMouseMove = (e: any) => {
    const { left, top, width, height } = e.target.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomStyle({ display: "block", left: e.pageX, top: e.pageY, x, y });
  };

  const variant = product?.variations?.[selectedColor] || {};
  const images = [variant?.images?.main, variant?.images?.front, variant?.images?.back].filter(Boolean);
  const price = Number(selectedSize?.sellPrice) || Number(product?.price) || 0;
  const stock = Number(selectedSize?.stock) || 0;

  // 🟢 WHATSAPP TRIGGER
  const triggerWhatsApp = () => {
    const msg = `Hi, I'm interested in ${product.name} (Size: ${selectedSize?.size}). Price: ₹${price}. URL: ${window.location.href}`;
    window.open(`https://wa.me/917061369212?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (loading) return <div className="h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#f8fafc] pb-32">
      
      {/* 🔝 HEADER CHIPS */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 animate-pulse">
          <TrendingUp size={12} /> TRENDING #1
        </span>
      </div>

      {/* 🖼️ IMAGE SECTION */}
      <div className="relative bg-white group overflow-hidden">
        <div 
          className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar"
          onScroll={(e: any) => setCurrentImage(Math.round(e.target.scrollLeft / e.target.clientWidth))}
        >
          {images.map((img: any, i: number) => (
            <div key={i} className="min-w-full snap-center relative cursor-zoom-in">
              <img
                src={img}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setZoomStyle({ ...zoomStyle, display: "none" })}
                onClick={() => setShowViewer(true)}
                className="w-full h-[450px] object-contain transition-transform duration-500 hover:scale-105"
              />
            </div>
          ))}
        </div>
        
        {/* SLIDER ARROWS */}
        <button className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronLeft />
        </button>
        <button className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
          <ChevronRight />
        </button>
      </div>

      <div className="max-w-md mx-auto px-4 -mt-4 relative z-20">
        
        {/* 💎 PREMIUM UI CARD */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-5 shadow-2xl border border-white/40">
          
          {/* URGENCY TIMER */}
          <div className="flex items-center gap-2 text-orange-600 bg-orange-50 p-2 rounded-lg mb-4 text-sm font-medium">
            <Timer size={16} /> 
            Offer ends in: {timeLeft.hrs}h {timeLeft.mins}m {timeLeft.secs}s
          </div>

          <div className="flex justify-between items-start">
            <h1 className="text-2xl font-bold text-slate-800">{product.name}</h1>
            <button onClick={() => navigator.share?.({url: window.location.href})} className="p-2 bg-slate-100 rounded-full">
              <Share2 size={18} />
            </button>
          </div>

          <div className="mt-3 flex items-baseline gap-3">
            <span className="text-3xl font-black text-blue-600">₹{price}</span>
            <span className="text-slate-400 line-through">₹{price + 500}</span>
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded">SAVE 20%</span>
          </div>

          {/* STOCK WARNING */}
          {stock > 0 && stock < 5 && (
            <p className="mt-3 text-red-500 font-bold text-sm flex items-center gap-1 animate-bounce">
              🔥 Only {stock} left! Hurry up!
            </p>
          )}

          {/* COLOR SELECTOR */}
          <div className="mt-6">
            <p className="text-sm font-semibold mb-2">Select Style</p>
            <div className="flex gap-3">
              {product?.variations?.map((v: any, i: number) => (
                <img
                  key={i}
                  src={v?.images?.main}
                  onClick={() => setSelectedColor(i)}
                  className={`w-14 h-14 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                    selectedColor === i ? "border-blue-600 scale-110 shadow-lg" : "border-transparent"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* SIZE SELECTOR */}
          <div className="mt-6">
            <p className="text-sm font-semibold mb-2">Select Size</p>
            <div className="flex flex-wrap gap-2">
              {variant?.sizes?.map((s: any, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedSize(s)}
                  className={`px-5 py-2 rounded-xl border-2 font-medium transition-all ${
                    selectedSize?.size === s.size 
                    ? "bg-blue-600 border-blue-600 text-white shadow-lg" 
                    : "bg-white border-slate-100 text-slate-600"
                  }`}
                >
                  {s.size}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 🚚 DELIVERY & PINCODE SECTION */}
        <div className="mt-4 bg-white rounded-2xl p-5 shadow-md">
          <p className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Truck size={18} className="text-blue-500" /> Check Delivery
          </p>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Enter Pincode" 
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button onClick={checkPincode} className="text-blue-600 font-bold px-2">CHECK</button>
          </div>
          {deliveryDate && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-green-600 font-medium">
              Delivery by {deliveryDate} | <span className="text-slate-500 font-normal">Cash on Delivery Available</span>
            </motion.p>
          )}
        </div>

        {/* 🛡️ TRUST BADGES */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="bg-green-50/50 p-3 rounded-xl flex items-center gap-2 border border-green-100">
            <ShieldCheck className="text-green-600" size={20} />
            <span className="text-[10px] font-bold text-green-800">100% SECURE<br/>PAYMENTS</span>
          </div>
          <div className="bg-blue-50/50 p-3 rounded-xl flex items-center gap-2 border border-blue-100">
            <Truck className="text-blue-600" size={20} />
            <span className="text-[10px] font-bold text-blue-800">FREE SHIPPING<br/>ON PREPAID</span>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="mt-6">
          <h3 className="font-bold text-slate-800 mb-2">Product Details</h3>
          <div className="text-slate-600 text-sm leading-relaxed bg-white p-4 rounded-2xl">
            {product.description || "Crafted with premium materials for maximum comfort and durability."}
          </div>
        </div>

        {/* ⭐ REVIEWS */}
        <ReviewSection product={product} />

        {/* 🔗 RECENTLY VIEWED SLIDER */}
        <RecentlyViewed />
      </div>

      {/* 🛒 BOTTOM ACTION BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t p-4 flex gap-3 z-40">
        <button 
          onClick={triggerWhatsApp}
          className="p-3 rounded-2xl bg-green-50 text-green-600 border border-green-200"
        >
          <MessageCircle size={24} />
        </button>
        <button
          onClick={() => {/* logic */}}
          className="flex-1 py-4 rounded-2xl font-bold bg-slate-900 text-white shadow-xl active:scale-95 transition-transform"
        >
          ADD TO CART
        </button>
        <button
          onClick={() => {/* logic */}}
          className="flex-1 py-4 rounded-2xl font-bold bg-blue-600 text-white shadow-xl shadow-blue-200 active:scale-95 transition-transform"
        >
          BUY NOW
        </button>
      </div>

      {/* 🧐 FULL SCREEN ZOOM VIEWER */}
      <AnimatePresence>
        {showViewer && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white z-[100] flex flex-col"
          >
            <div className="p-4 flex justify-between items-center border-b">
              <span className="font-bold">{currentImage + 1} / {images.length}</span>
              <button onClick={() => setShowViewer(false)} className="p-2 bg-slate-100 rounded-full">✕</button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-4">
               <img src={images[currentImage]} className="max-w-full max-h-[80vh] object-contain" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// 🕒 RECENTLY VIEWED COMPONENT
function RecentlyViewed() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem("recent_viewed") || "[]").slice(1));
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="mt-8 pb-10">
      <h3 className="font-bold mb-4">Recently Viewed</h3>
      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
        {items.map((p: any, i: number) => (
          <div key={i} className="min-w-[120px] bg-white p-2 rounded-2xl shadow-sm border border-slate-100">
            <img src={p?.variations?.[0]?.images?.main} className="h-24 w-full object-cover rounded-xl" />
            <p className="text-[10px] font-bold mt-2 truncate">{p.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

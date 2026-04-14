"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, addDoc, collection, getDocs, query, where, limit } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import ReviewSection from "@/components/product/ReviewSection";
import toast from "react-hot-toast";
import { ShoppingCart, Zap, Share2, X, Heart, ShieldCheck, Eye, Flame, ChevronRight, Truck } from "lucide-react";

export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Safe ID extraction for Next.js 13/14/15
  const id = params?.id;
  const ref = searchParams.get("ref");
  const reviewRef = useRef(null);

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [similar, setSimilar] = useState([]);

  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [showViewer, setShowViewer] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState(null);
  const [checkingPin, setCheckingPin] = useState(false);
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    if (ref) localStorage.setItem("affiliate", ref);
    setViewCount(Math.floor(Math.random() * 15) + 5);
  }, [ref]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      try {
        const snap = await getDoc(doc(db, "products", id));
        if (snap.exists()) {
          const data = { id: snap.id, ...snap.data() };
          setProduct(data);
          setSelectedSize(data?.variations?.[selectedColor]?.sizes?.[0] || null);
          
          const q = query(collection(db, "products"), where("category", "==", data.category), limit(6));
          const similarSnap = await getDocs(q);
          setSimilar(similarSnap.docs.map(d => ({ id: d.id, ...d.data() })).filter(p => p.id !== id));

          const offerSnap = await getDocs(collection(db, "offers"));
          const activeOffer = offerSnap.docs
            .map(d => d.data())
            .find(o => o.active && (o.productId === id || o.category === data.category));
          if (activeOffer) setDiscount(Number(activeOffer.discount));
        }
      } catch (err) { 
        console.error(err);
        toast.error("Failed to load"); 
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
  }, [id, selectedColor]);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/product/${id}${ref ? `?ref=${ref}` : ""}`;
    if (navigator.share) {
      navigator.share({ title: product.name, url: shareUrl });
    } else {
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link Copied!");
    }
  };

  const checkPincode = async () => {
    if (pincode.length !== 6) return toast.error("Invalid PIN");
    setCheckingPin(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data[0].Status === "Success") {
        setDeliveryInfo({ place: data[0].PostOffice[0].District, days: 3 });
      } else { toast.error("Service not available"); }
    } catch (e) { toast.error("Check failed"); }
    setCheckingPin(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black text-blue-600 animate-pulse uppercase italic">Jembee Kart Loading...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center font-bold">Product not found</div>;

  const variant = product?.variations?.[selectedColor] || {};
  const images = [variant?.images?.main, variant?.images?.front, variant?.images?.back, variant?.images?.side, variant?.images?.model].filter(Boolean);

  const originalPrice = Number(selectedSize?.sellPrice || selectedSize?.price || product.price || 0);
  const finalPrice = Math.max(1, Math.round(originalPrice - (originalPrice * discount) / 100));
  const stock = Number(selectedSize?.stock) || 0;

  const handleAction = async (type) => {
    if (!user) return router.push(`/login?redirect=/product/${id}`);
    if (!selectedSize) return toast.error("Please select a size");

    const itemData = {
      productId: product.id,
      name: product.name,
      image: images[0],
      quantity: 1,
      price: finalPrice,
      size: selectedSize.size,
      color: variant.color || "Default",
      addedAt: new Date()
    };

    if (type === 'cart') {
      try {
        await addDoc(collection(db, "carts", user.uid, "items"), itemData);
        toast.success("Added to Bag!");
        router.push("/cart");
      } catch (e) { toast.error("Error adding to cart"); }
    } else {
      localStorage.setItem("buy-now", JSON.stringify(itemData));
      router.push("/checkout");
    }
  };

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Photo Viewer */}
      {showViewer && (
        <div className="fixed inset-0 bg-black z-[100] flex flex-col">
          <div className="flex justify-between p-6">
             <span className="text-white font-bold text-sm uppercase tracking-widest">{currentImage + 1} / {images.length}</span>
             <button onClick={() => setShowViewer(false)} className="text-white"><X size={32}/></button>
          </div>
          <img src={images[currentImage]} className="flex-1 object-contain" alt="viewer" />
        </div>
      )}

      {/* 1. Dynamic Image Gallery */}
      <div className="relative aspect-[4/5] bg-slate-100 overflow-hidden">
        <div className="absolute top-6 right-6 z-10 flex flex-col gap-3">
          <button onClick={handleShare} className="p-3 bg-white/90 rounded-full shadow-xl"><Share2 size={18} /></button>
          <button className="p-3 bg-white/90 rounded-full shadow-xl text-red-500"><Heart size={18} /></button>
        </div>
        
        {stock < 5 && stock > 0 && (
          <div className="absolute top-6 left-6 z-10 bg-orange-500 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 animate-bounce">
            <Flame size={12} fill="white" /> Selling Fast
          </div>
        )}

        <div className="flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar" 
             onScroll={(e) => setCurrentImage(Math.round(e.target.scrollLeft / e.target.clientWidth))}>
          {images.map((img, i) => (
            <img key={i} src={img} onClick={() => setShowViewer(true)} className="min-w-full h-full object-cover snap-center" alt={`product-${i}`} />
          ))}
        </div>
        
        <div className="absolute bottom-6 w-full flex justify-center gap-1.5">
          {images.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${currentImage === i ? "w-8 bg-blue-600" : "w-2 bg-black/20"}`} />
          ))}
        </div>
      </div>

      <div className="p-6 space-y-8">
        <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] uppercase tracking-tighter">
          <Eye size={14} /> {viewCount} people are looking at this right now
        </div>

        {/* 2. Color Selection */}
        <div className="space-y-3">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Available Colors</p>
          <div className="flex gap-3 overflow-x-auto no-scrollbar">
            {product?.variations?.map((v, i) => (
              <button key={i} onClick={() => setSelectedColor(i)}
                className={`w-16 h-16 rounded-2xl border-2 transition-all p-1 flex-shrink-0 ${selectedColor === i ? "border-blue-600 bg-blue-50" : "border-slate-100"}`}>
                <img src={v?.images?.main} className="w-full h-full object-cover rounded-xl" alt="color" />
              </button>
            ))}
          </div>
        </div>

        {/* 3. Header Info */}
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tighter leading-none">{product.name}</h1>
          <div className="flex items-center gap-2" onClick={() => reviewRef.current?.scrollIntoView({ behavior: 'smooth' })}>
            <div className="flex bg-green-600 text-white px-2 py-0.5 rounded font-black text-[10px]">4.8 ★</div>
            <p className="text-[10px] font-bold text-slate-400 uppercase underline decoration-dotted">See {product.reviewsCount || '142'} Verified Reviews</p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <span className="text-4xl font-black text-blue-600 tracking-tighter uppercase italic">₹{finalPrice}</span>
            <span className="text-slate-300 line-through text-xl font-bold italic tracking-tighter">₹{originalPrice}</span>
            {discount > 0 && <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest animate-pulse">{discount}% OFF</span>}
          </div>
        </div>

        {/* 4. Size Selection */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Size: {selectedSize?.size || 'Select'}</p>
            <button className="text-[10px] font-black text-blue-600 uppercase flex items-center">Size Guide <ChevronRight size={12} /></button>
          </div>
          <div className="grid grid-cols-5 gap-2">
            {variant?.sizes?.map((s, i) => (
              <button key={i} onClick={() => setSelectedSize(s)}
                className={`py-4 rounded-2xl font-black text-sm border-2 transition-all ${selectedSize?.size === s.size ? "bg-black text-white border-black" : "bg-white text-slate-900 border-slate-100"}`}>
                {s.size}
              </button>
            ))}
          </div>
          {stock < 10 && stock > 0 && <p className="text-[10px] font-black text-orange-500 uppercase tracking-tighter">⚡ Low Stock: Only {stock} items left!</p>}
        </div>

        {/* 5. Trust & Shipping */}
        <div className="bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 space-y-6">
           <div className="flex justify-around border-b border-slate-200 pb-4">
              {['7 Days Return', 'Free Shipping', 'Verified'].map(t => (
                <div key={t} className="flex flex-col items-center gap-1">
                  <ShieldCheck size={16} className="text-blue-600" />
                  <span className="text-[8px] font-black uppercase text-slate-400">{t}</span>
                </div>
              ))}
           </div>
           <div className="space-y-3">
             <div className="flex items-center gap-2"><Truck size={14} className="text-slate-400" /> <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pincode Check</span></div>
             <div className="flex gap-2">
               <input type="number" placeholder="Enter PIN" value={pincode} onChange={(e)=>setPincode(e.target.value)} className="flex-1 bg-white rounded-xl px-4 py-3 text-xs font-bold shadow-sm" />
               <button onClick={checkPincode} className="bg-slate-900 text-white px-6 rounded-xl font-black text-[10px] uppercase">{checkingPin ? '...' : 'Check'}</button>
             </div>
             {deliveryInfo && <p className="text-[11px] text-green-600 font-black italic uppercase">🚀 Fast Delivery to {deliveryInfo.place} by Wednesday</p>}
           </div>
        </div>

        {/* 6. Specifications */}
        <div className="space-y-4">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Specifications</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase">Fabric</p><p className="text-xs font-bold text-slate-900">100% Premium Cotton</p></div>
            <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase">Weight</p><p className="text-xs font-bold text-slate-900">220 GSM (Heavy)</p></div>
            <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase">Fit</p><p className="text-xs font-bold text-slate-900">Oversized / Relaxed</p></div>
            <div className="bg-slate-50 p-4 rounded-2xl"><p className="text-[8px] font-black text-slate-400 uppercase">Print</p><p className="text-xs font-bold text-slate-900">High-Density Puff</p></div>
          </div>
        </div>

        {/* 7. Similar Items */}
        {similar.length > 0 && (
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">More from Jembee Kart</p>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
              {similar.map((p) => (
                <div key={p.id} onClick={() => router.push(`/product/${p.id}`)} className="min-w-[150px] space-y-2 group">
                  <div className="relative overflow-hidden rounded-2xl aspect-[3/4]">
                     <img src={p.variations?.[0]?.images?.main} className="w-full h-full object-cover group-active:scale-110 transition-transform" alt="similar" />
                  </div>
                  <p className="text-[10px] font-black uppercase truncate">{p.name}</p>
                  <p className="text-xs font-black text-blue-600 italic leading-none">₹{p.price}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div ref={reviewRef}>
           <ReviewSection productId={product.id} />
        </div>
      </div>

      {/* 8. Sticky Bottom Bar */}
      <div className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-xl border-t p-4 flex gap-3 z-50">
        <button disabled={stock === 0} onClick={() => handleAction('cart')}
          className="flex-1 py-4 rounded-2xl font-black text-xs uppercase border-2 border-slate-900 tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
          <ShoppingCart size={18} /> Bag
        </button>
        <button disabled={stock === 0} onClick={() => handleAction('buy')}
          className="flex-1 py-4 rounded-2xl font-black text-xs uppercase bg-blue-600 text-white shadow-xl shadow-blue-200 tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all">
          <Zap size={18} fill="white" /> {stock === 0 ? "Sold Out" : "Buy Now"}
        </button>
      </div>
    </div>
  );
}

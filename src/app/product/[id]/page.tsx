"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  doc,
  getDoc,
  setDoc,
  addDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import ReviewSection from "@/components/product/ReviewSection";
import toast from "react-hot-toast";

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
  const [discount, setDiscount] = useState(0);

  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);
  const [checkingPin, setCheckingPin] = useState(false);

  // 🔐 AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // 🔥 AFFILIATE STORE
  useEffect(() => {
    if (!ref) return;
    localStorage.setItem("refSeller", ref);
  }, [ref]);

  // 🔥 FETCH PRODUCT
  useEffect(() => {
    const fetchProduct = async () => {
      const snap = await getDoc(doc(db, "products", id));
      if (snap.exists()) {
        const data: any = { id: snap.id, ...snap.data() };
        setProduct(data);
        const first = data?.variations?.[0];
        setSelectedSize(first?.sizes?.[0] || null);
        fetchSimilar(data.category);
      }
      setLoading(false);
    };
    if (id) fetchProduct();
  }, [id]);

  // 🔥 OFFER FETCH
  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const snap = await getDocs(collection(db, "offers"));
        const offers = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((o: any) => o.active && new Date(o.endDate).getTime() > Date.now());

        const matched = offers.find((o: any) => {
          if (o.type === "product" && o.productId === product?.id) return true;
          if (o.type === "category" && o.category?.toLowerCase() === product?.category?.toLowerCase()) return true;
          return false;
        });

        if (matched) setDiscount(Number(matched.discount || 0));
      } catch (err) {
        console.log("Offer error", err);
      }
    };
    if (product) fetchOffer();
  }, [product]);

  // 🔥 AFFILIATE FIX
  useEffect(() => {
    const saveAffiliate = async () => {
      if (!ref) return;
      try {
        localStorage.setItem("affiliate", ref);
        const user = auth.currentUser;
        if (user) {
          await setDoc(doc(db, "userAffiliate", user.uid), {
            refCode: ref,
            updatedAt: new Date(),
          }, { merge: true });
        }
      } catch (err) { console.log(err); }
    };
    saveAffiliate();
  }, [ref]);

  // 🔥 SIMILAR
  const fetchSimilar = async (category: string) => {
    const snap = await getDocs(collection(db, "products"));
    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p: any) => p.category === category && p.id !== id)
      .slice(0, 6);
    setSimilar(data);
  };

  // 🚚 PINCODE CHECK
  const checkPincode = async () => {
    if (!pincode || pincode.length !== 6) return alert("Please enter a valid 6-digit PIN code.");
    setCheckingPin(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];
        setDeliveryInfo({
          place: postOffice.District,
          state: postOffice.State,
          deliveryDays: Math.floor(Math.random() * 3) + 3,
        });
      } else {
        setDeliveryInfo(null);
        alert("Delivery not available at this PIN.");
      }
    } catch (err) { alert("Error checking PIN."); }
    setCheckingPin(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50">Loading Premium Experience...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Product not found</div>;

  const variant = product?.variations?.[selectedColor] || {};
  const images = [
    variant?.images?.main,
    variant?.images?.front,
    variant?.images?.back,
    variant?.images?.side,
    variant?.images?.model,
  ].filter(Boolean);

  const price = Number(selectedSize?.sellPrice) || Number(selectedSize?.price) || Number(variant?.sizes?.[0]?.sellPrice) || Number(variant?.sizes?.[0]?.price) || Number(product?.price) || 0;
  const finalPrice = Math.max(1, Math.round(price - (price * discount) / 100));
  const stock = Number(selectedSize?.stock) || 0;

  const handleAddToCart = async () => {
    if (!user) return router.push(`/login?redirect=/product/${id}`);
    if (!selectedSize) return alert("Select size");
    const basePrice = selectedSize?.sellPrice || selectedSize?.price || product?.price || 0;
    await addDoc(collection(db, "carts", user.uid, "items"), {
      productId: product.id,
      name: product.name,
      image: images?.[0] || "",
      quantity: 1,
      category: product.category,
      price: basePrice,
      variations: [{ ...variant, sizes: [selectedSize] }],
      discount: discount || 0
    });
    toast.success("Added to cart 🛒");
    setTimeout(() => router.push("/cart"), 1200);
  };

  const handleBuyNow = async () => {
    if (!user) return router.push(`/login?redirect=/product/${id}`);
    if (!selectedSize) return alert("Select size");
    const buyNowData = {
      id: product.id,
      productId: product.id,
      name: product.name,
      image: images?.[0] || "",
      quantity: 1,
      price: finalPrice,
      basePrice: Number(selectedSize?.basePrice) || Number(product?.basePrice) || Number(selectedSize?.price) || 0,
      category: product.category,
      variations: [{ ...variant, sizes: [selectedSize] }]
    };
    localStorage.setItem("buy-now", JSON.stringify(buyNowData));
    router.push("/checkout");
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-32">
      {/* IMAGE SECTION */}
      <div className="relative bg-white rounded-b-[40px] shadow-sm overflow-hidden">
        <div onScroll={(e: any) => setCurrentImage(Math.round(e.target.scrollLeft / e.target.clientWidth))}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar"
        >
          {images.map((img: any, i: number) => (
            <div key={i} className="min-w-full snap-center flex justify-center p-4">
              <img src={img} onClick={() => setShowViewer(true)} className="w-full h-[400px] object-contain rounded-3xl" />
            </div>
          ))}
        </div>

        {/* FLOATING DOTS */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/10 backdrop-blur-md px-3 py-1.5 rounded-full">
          {images.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${currentImage === i ? "w-6 bg-blue-600" : "w-1.5 bg-white/60"}`} />
          ))}
        </div>

        <button onClick={() => navigator.share?.({ title: product.name, url: window.location.href })}
          className="absolute top-6 right-6 bg-white/80 backdrop-blur-lg p-3 rounded-2xl shadow-xl active:scale-90 transition"
        >
          🔗
        </button>
      </div>

      {/* VIEWER OVERLAY */}
      {showViewer && (
        <div className="fixed inset-0 bg-black/95 z-[100] flex flex-col animate-in fade-in duration-300">
          <button onClick={() => setShowViewer(false)} className="self-end text-white text-3xl p-8">✕</button>
          <div className="flex-1 flex items-center justify-center p-4">
            <img src={images[currentImage]} className="max-w-full max-h-full object-contain" />
          </div>
        </div>
      )}

      {/* PRODUCT DETAILS */}
      <div className="px-5 pt-6 space-y-6">
        
        {/* VARIATION SELECTOR (GLASS) */}
        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
          {product?.variations?.map((v: any, i: number) => (
            <div key={i} onClick={() => { setSelectedColor(i); setSelectedSize(v?.sizes?.[0] || null); }}
              className={`relative min-w-[70px] h-[70px] rounded-2xl border-2 transition-all p-1 ${selectedColor === i ? "border-blue-600 bg-blue-50" : "border-transparent bg-white shadow-sm"}`}
            >
              <img src={v?.images?.main} className="w-full h-full object-cover rounded-xl" />
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-gray-900 leading-tight">{product.name}</h1>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-blue-600">₹{finalPrice}</span>
            {discount > 0 && <span className="text-gray-400 line-through text-lg font-medium">₹{price}</span>}
            {discount > 0 && <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-lg">{discount}% OFF</span>}
          </div>
        </div>

        {/* STOCK STATUS (HURRY ALERT) */}
        <div className="bg-white/60 backdrop-blur-md border border-white p-4 rounded-2xl shadow-sm">
          {stock > 5 && <p className="text-green-600 text-sm font-bold flex items-center gap-2"> <span className="w-2 h-2 bg-green-500 rounded-full animate-ping" /> In Stock & Ready to Ship</p>}
          {stock <= 5 && stock > 0 && (
            <div className="space-y-1">
              <p className="text-orange-600 text-sm font-black flex items-center gap-2 animate-bounce">
                🔥 HURRY! ONLY {stock} LEFT IN STOCK
              </p>
              <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                <div className="bg-orange-500 h-full w-[20%]" />
              </div>
            </div>
          )}
          {stock === 0 && <p className="text-red-600 font-black text-lg">OUT OF STOCK ❌</p>}
        </div>

        {/* TRUST BADGE */}
        <div className="grid grid-cols-3 gap-2 py-2">
          {['Fast Delivery', 'Secure Pay', 'COD'].map((txt) => (
            <div key={txt} className="bg-white p-2 rounded-xl text-[10px] text-center font-bold text-gray-500 border border-gray-100 shadow-sm uppercase tracking-wider">{txt}</div>
          ))}
        </div>

        {/* DELIVERY CHECKER */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-gray-100">
          <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 block">Check Availability</label>
          <div className="flex gap-2">
            <input type="number" placeholder="Enter Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)}
              className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 text-sm font-bold" />
            <button onClick={checkPincode} className="bg-black text-white px-6 rounded-xl font-bold text-sm hover:bg-gray-800 transition">
              {checkingPin ? "..." : "Check"}
            </button>
          </div>
          {deliveryInfo && (
            <div className="mt-4 p-3 bg-green-50 rounded-xl border border-green-100 flex items-center gap-3">
              <span className="text-xl text-green-600">🚚</span>
              <p className="text-green-800 text-xs font-bold leading-tight">
                Express Delivery to {deliveryInfo.place} <br/>
                <span className="text-[10px] opacity-70">Estimated: {deliveryInfo.deliveryDays}-{deliveryInfo.deliveryDays + 2} business days</span>
              </p>
            </div>
          )}
        </div>

        {/* SIZE SELECTOR */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">Select Size</h3>
            <span className="text-blue-600 text-xs font-bold underline cursor-pointer">Size Guide</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {variant?.sizes?.map((s: any, i: number) => (
              <button key={i} onClick={() => setSelectedSize(s)}
                className={`py-3 rounded-2xl font-bold transition-all border-2 ${selectedSize?.size === s.size ? "bg-black text-white border-black shadow-lg scale-105" : "bg-white text-gray-600 border-gray-100 hover:border-gray-300"}`}
              >
                {s.size}
              </button>
            ))}
          </div>
        </div>

        {/* DESCRIPTION */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest mb-3">Product Description</h3>
          <p className="text-gray-600 leading-relaxed text-sm">{product.description || "Indulge in premium quality with this meticulously crafted piece, designed for those who value both style and durability."}</p>
        </div>

        {/* REVIEWS */}
        <div className="pb-10">
          <ReviewSection productId={product.id} />
        </div>

        {/* SIMILAR PRODUCTS */}
        <div className="space-y-4">
           <h3 className="font-black text-gray-800 uppercase text-xs tracking-widest">You May Also Like</h3>
           <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
             {similar.map((p: any) => (
               <div key={p.id} onClick={() => router.push(`/product/${p.id}`)}
                 className="min-w-[160px] bg-white p-3 rounded-3xl shadow-sm border border-gray-100 active:scale-95 transition"
               >
                 <img src={p?.variations?.[0]?.images?.main} className="h-32 w-full object-cover rounded-2xl mb-3" />
                 <p className="text-xs font-bold text-gray-800 truncate px-1">{p.name}</p>
                 <p className="text-blue-600 font-black text-sm px-1 mt-1">₹{p?.variations?.[0]?.sizes?.[0]?.sellPrice || 0}</p>
               </div>
             ))}
           </div>
        </div>
      </div>

      {/* STICKY FOOTER BUTTONS */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-gray-100 p-4 flex gap-3 z-50">
        <button disabled={stock === 0} onClick={handleAddToCart}
          className={`w-1/2 py-4 rounded-2xl font-black text-sm transition-all ${stock === 0 ? "bg-gray-100 text-gray-400" : "bg-white border-2 border-black text-black active:scale-95 shadow-sm"}`}
        >
          ADD TO CART
        </button>
        <button disabled={stock === 0} onClick={handleBuyNow}
          className={`w-1/2 py-4 rounded-2xl font-black text-sm transition-all shadow-xl ${stock === 0 ? "bg-gray-400 text-white cursor-not-allowed" : "bg-blue-600 text-white active:scale-95 hover:bg-blue-700"}`}
        >
          {stock === 0 ? "SOLD OUT" : "BUY NOW ⚡"}
        </button>
      </div>
    </div>
  );
}

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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

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

  useEffect(() => {
    const fetchOffer = async () => {
      if (!product) return;
      try {
        const snap = await getDocs(collection(db, "offers"));
        const offers = snap.docs
          .map((d) => ({ id: d.id, ...d.data() }))
          .filter((o: any) => o.active && new Date(o.endDate).getTime() > Date.now());

        const matched = offers.find((o: any) => {
          if (o.type === "product" && o.productId === product.id) return true;
          if (o.type === "category" && o.category?.toLowerCase() === product.category?.toLowerCase()) return true;
          return false;
        });

        if (matched) setDiscount(Number(matched.discount || 0));
      } catch (err) { console.log("Offer error", err); }
    };
    fetchOffer();
  }, [product]);

  useEffect(() => {
    if (!ref || !user) return;
    const saveAffiliate = async () => {
      try {
        localStorage.setItem("affiliate", ref);
        await setDoc(doc(db, "userAffiliate", user.uid), {
          refCode: ref,
          updatedAt: new Date(),
        }, { merge: true });
      } catch (err) { console.log(err); }
    };
    saveAffiliate();
  }, [ref, user]);

  const fetchSimilar = async (category: string) => {
    const snap = await getDocs(collection(db, "products"));
    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p: any) => p.category === category && p.id !== id)
      .slice(0, 6);
    setSimilar(data);
  };

  const checkPincode = async () => {
    if (!pincode || pincode.length !== 6) return toast.error("Enter valid 6-digit PIN");
    setCheckingPin(true);
    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();
      if (data[0].Status === "Success") {
        setDeliveryInfo({
          place: data[0].PostOffice[0].District,
          deliveryDays: Math.floor(Math.random() * 3) + 3,
        });
      } else {
        setDeliveryInfo(null);
        toast.error("Not deliverable here");
      }
    } catch (err) { toast.error("Error checking PIN"); }
    setCheckingPin(false);
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-bold text-blue-600">Loading...</div>;
  if (!product) return <div className="h-screen flex items-center justify-center">Product not found</div>;

  const variant = product?.variations?.[selectedColor] || {};
  const images = [variant?.images?.main, variant?.images?.front, variant?.images?.back].filter(Boolean);
  
  // 🔥 FIX: PRICE LOGIC
  const originalPrice = Number(selectedSize?.sellPrice || selectedSize?.price || product.price || 0);
  const finalPrice = Math.max(1, Math.round(originalPrice - (originalPrice * discount) / 100));
  const stock = Number(selectedSize?.stock) || 0;

  const handleAddToCart = async () => {
    if (!user) return router.push(`/login?redirect=/product/${id}`);
    if (!selectedSize) return toast.error("Select size first");
    
    try {
      await addDoc(collection(db, "carts", user.uid, "items"), {
        productId: product.id,
        name: product.name,
        image: images[0],
        quantity: 1,
        price: finalPrice, // Discounted price save kar rahe hain
        originalPrice: originalPrice,
        size: selectedSize.size,
        color: variant.color || "Default",
        addedAt: new Date()
      });
      toast.success("Added to cart! 🛒");
      router.push("/cart");
    } catch (e) { toast.error("Failed to add to cart"); }
  };

  const handleBuyNow = () => {
    if (!user) return router.push(`/login?redirect=/product/${id}`);
    if (!selectedSize) return toast.error("Select size first");

    // 🔥 FIX: BUY-NOW DATA SYNC
    const buyNowData = {
      productId: product.id,
      name: product.name,
      image: images[0],
      quantity: 1,
      price: finalPrice,
      basePrice: originalPrice,
      size: selectedSize.size
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
              <img src={img} onClick={() => setShowViewer(true)} className="w-full h-[350px] object-contain rounded-3xl cursor-pointer" />
            </div>
          ))}
        </div>
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/10 backdrop-blur-md px-3 py-1.5 rounded-full">
          {images.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all ${currentImage === i ? "w-6 bg-blue-600" : "w-1.5 bg-white/60"}`} />
          ))}
        </div>
      </div>

      <div className="px-5 pt-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-gray-900 leading-tight">{product.name}</h1>
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-black text-blue-600">₹{finalPrice}</span>
            {discount > 0 && <span className="text-gray-400 line-through text-lg">₹{originalPrice}</span>}
            {discount > 0 && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-lg">{discount}% OFF</span>}
          </div>
        </div>

        {/* VARIATIONS */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar">
          {product.variations?.map((v: any, i: number) => (
            <div key={i} onClick={() => { setSelectedColor(i); setSelectedSize(v.sizes?.[0] || null); }}
              className={`min-w-[65px] h-[65px] rounded-2xl border-2 p-1 transition-all ${selectedColor === i ? "border-blue-600 bg-blue-50" : "border-gray-100 bg-white"}`}
            >
              <img src={v.images?.main} className="w-full h-full object-cover rounded-xl" />
            </div>
          ))}
        </div>

        {/* PINCODE CHECKER */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Check Delivery</p>
          <div className="flex gap-2">
            <input type="number" placeholder="Enter Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)}
              className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold" />
            <button onClick={checkPincode} className="bg-slate-900 text-white px-6 rounded-xl font-bold text-sm">
              {checkingPin ? "..." : "Check"}
            </button>
          </div>
          {deliveryInfo && (
            <p className="mt-3 text-xs text-green-600 font-bold flex items-center gap-2">
              🚚 Fast delivery to {deliveryInfo.place} in {deliveryInfo.deliveryDays} days
            </p>
          )}
        </div>

        {/* SIZE SELECTOR */}
        <div className="space-y-3">
          <h3 className="font-black text-gray-800 text-xs uppercase tracking-widest">Select Size</h3>
          <div className="grid grid-cols-4 gap-2">
            {variant?.sizes?.map((s: any, i: number) => (
              <button key={i} onClick={() => setSelectedSize(s)}
                className={`py-3 rounded-2xl font-bold border-2 transition-all ${selectedSize?.size === s.size ? "bg-slate-900 text-white border-slate-900" : "bg-white text-gray-500 border-gray-100"}`}
              >
                {s.size}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
          <h3 className="font-black text-gray-800 text-xs uppercase tracking-widest mb-2">Description</h3>
          <p className="text-gray-500 text-sm leading-relaxed">{product.description || "Premium quality product."}</p>
        </div>

        <ReviewSection productId={product.id} />
      </div>

      {/* FOOTER BUTTONS */}
      <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t p-4 flex gap-3 z-50">
        <button disabled={stock === 0} onClick={handleAddToCart}
          className="w-1/2 py-4 rounded-2xl font-black text-xs border-2 border-slate-900 text-slate-900 uppercase tracking-tighter"
        >
          Add to Cart
        </button>
        <button disabled={stock === 0} onClick={handleBuyNow}
          className="w-1/2 py-4 rounded-2xl font-black text-xs bg-blue-600 text-white uppercase tracking-tighter shadow-xl shadow-blue-100"
        >
          {stock === 0 ? "Out of Stock" : "Buy Now ⚡"}
        </button>
      </div>
    </div>
  );
}

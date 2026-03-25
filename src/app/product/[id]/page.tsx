"use client";

import { useEffect, useState, useRef } from "react";
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

  // 🔥 NEW FEATURES
  const [pincode, setPincode] = useState("");
  const [pinStatus, setPinStatus] = useState("");
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null);

  const [timeLeft, setTimeLeft] = useState({
    hrs: 2,
    mins: 0,
    secs: 0
  });

  // 🔐 AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

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

        // recently viewed
        const recent = JSON.parse(localStorage.getItem("recent") || "[]");
        const updated = [data, ...recent.filter((p: any) => p.id !== data.id)].slice(0, 10);
        localStorage.setItem("recent", JSON.stringify(updated));
      }

      setLoading(false);
    };

    if (id) fetchProduct();
  }, [id]);

  // 🔥 AFFILIATE SAVE
  useEffect(() => {
    if (!ref) return;
    localStorage.setItem("affiliate", ref);
  }, [ref]);

  // 🔥 TIMER (only trending or low stock)
  const stock = Number(selectedSize?.stock) || 0;
  const timerEnabled = product?.isTrending || stock <= 5;

  useEffect(() => {
    if (!timerEnabled) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hrs > 0) return { hrs: prev.hrs - 1, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerEnabled]);

  // 🔥 SIMILAR
  const fetchSimilar = async (category: string) => {
    const snap = await getDocs(collection(db, "products"));

    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p: any) => p.category === category && p.id !== id)
      .slice(0, 6);

    setSimilar(data);
  };

  // 🔥 PINCODE
  const checkPincode = () => {
    if (pincode.length !== 6) return alert("Invalid pincode");

    const date = new Date();

    if (pincode.startsWith("8")) {
      date.setDate(date.getDate() + 2);
      setPinStatus("fast");
    } else {
      date.setDate(date.getDate() + 5);
      setPinStatus("slow");
    }

    setDeliveryDate(
      date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short"
      })
    );
  };

  // 🔥 AFFILIATE GET
  const getAffiliate = async () => {
    const refCode = localStorage.getItem("affiliate");
    let sellerId = null;

    if (refCode) {
      const snap = await getDoc(doc(db, "affiliateLinks", refCode));
      if (snap.exists()) sellerId = snap.data().sellerId;
    }

    return { refCode, sellerId };
  };

  const variant = product?.variations?.[selectedColor] || {};

  const images = [
    variant?.images?.main,
    variant?.images?.front,
    variant?.images?.back
  ].filter(Boolean);

  const price =
    Number(selectedSize?.sellPrice) ||
    Number(product?.price) ||
    0;

  // 🛒 CART
  const handleAddToCart = async () => {
    if (!user) return router.push(`/login`);

    const { refCode, sellerId } = await getAffiliate();

    await addDoc(collection(db, "carts", user.uid, "items"), {
      productId: product.id,
      name: product.name,
      image: images?.[0],
      price,
      affiliateCode: refCode,
      sellerId
    });

    alert("Added to cart");
  };

  // ⚡ BUY
  const handleBuyNow = async () => {
    if (!user) return router.push(`/login`);

    const { refCode, sellerId } = await getAffiliate();

    const orderRef = await addDoc(collection(db, "orders"), {
      userId: user.uid,
      productId: product.id,
      price,
      affiliateCode: refCode,
      sellerId
    });

    router.push(`/checkout?orderId=${orderRef.id}`);
  };

  // 📲 WHATSAPP
  const handleWhatsApp = () => {
    const msg = `Hi I want ${product.name} ₹${price}`;
    window.open(`https://wa.me/917061369212?text=${encodeURIComponent(msg)}`);
  };

  if (loading) return <div className="p-10">Loading...</div>;

  return (
    <div className="min-h-screen pb-32 bg-gray-50">

      {/* TRENDING */}
      {product?.isTrending && (
        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          🔥 Trending
        </div>
      )}

      {/* SLIDER */}
      <div className="relative">
        <div
          className="flex overflow-x-auto snap-x"
          onScroll={(e: any) =>
            setCurrentImage(
              Math.round(e.target.scrollLeft / e.target.clientWidth)
            )
          }
        >
          {images.map((img: any, i: number) => (
            <div key={i} className="min-w-full">
              <img
                src={img}
                className="w-full h-[350px] object-contain"
                onClick={() => setShowViewer(true)}
              />
            </div>
          ))}
        </div>

        {/* ARROWS */}
        <button className="absolute left-2 top-1/2 bg-white p-2 rounded-full">
          <ChevronLeft />
        </button>
        <button className="absolute right-2 top-1/2 bg-white p-2 rounded-full">
          <ChevronRight />
        </button>
      </div>

      {/* INFO */}
      <div className="p-4 bg-white rounded-t-3xl -mt-6">

        <h1 className="text-xl font-bold">{product.name}</h1>

        <p className="text-2xl text-green-600 font-bold mt-2">₹{price}</p>

        {/* TIMER */}
        {timerEnabled && (
          <p className="text-orange-500 mt-2">
            ⏳ {timeLeft.hrs}h {timeLeft.mins}m {timeLeft.secs}s left
          </p>
        )}

        {/* STOCK */}
        {stock <= 5 && (
          <p className="text-red-500 font-bold">🔥 Only {stock} left</p>
        )}

        {/* PINCODE */}
        <div className="mt-4 flex gap-2">
          <input
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="Enter pincode"
            className="border p-2 flex-1"
          />
          <button onClick={checkPincode}>Check</button>
        </div>

        {deliveryDate && (
          <p className="text-green-600 mt-2">Delivery by {deliveryDate}</p>
        )}

        {/* TRUST */}
        <div className="flex gap-4 mt-4 text-sm">
          <span>🔒 Secure</span>
          <span>🚚 COD</span>
        </div>

        {/* SIMILAR */}
        <div className="mt-6">
          <h3>You may also like</h3>
          <div className="flex gap-3 overflow-x-auto">
            {similar.map((p: any) => (
              <div key={p.id} className="min-w-[120px]">
                <img src={p?.variations?.[0]?.images?.main} />
                <p>{p.name}</p>
              </div>
            ))}
          </div>
        </div>

        <ReviewSection product={product} />
      </div>

      {/* BUTTONS */}
      <div className="fixed bottom-0 left-0 w-full flex gap-2 p-3 bg-white">
        <button onClick={handleWhatsApp}>💬</button>

        <button onClick={handleAddToCart} className="flex-1 bg-gray-800 text-white">
          Add to Cart
        </button>

        <button onClick={handleBuyNow} className="flex-1 bg-blue-600 text-white">
          Buy Now
        </button>
      </div>

      {/* ZOOM */}
      <AnimatePresence>
        {showViewer && (
          <motion.div className="fixed inset-0 bg-white z-50">
            <button onClick={() => setShowViewer(false)}>X</button>
            <img src={images[currentImage]} />
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

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
  updateDoc,
  increment
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

  // 🔥 NEW STATES
  const [rating, setRating] = useState(4.5);
  const [viewers, setViewers] = useState(12);
  const [sold, setSold] = useState(120);
  const [timer, setTimer] = useState(600); // 10 min

  // 🔐 AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // 🔥 FAKE LIVE SYSTEM
  useEffect(() => {

    setRating((Math.random() * 0.7 + 4.2).toFixed(1) as any);
    setSold(Math.floor(Math.random() * 200 + 50));

    const interval = setInterval(() => {
      setViewers(Math.floor(Math.random() * 20 + 5));
    }, 3000);

    const timerInterval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 600));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(timerInterval);
    };

  }, []);

  // 🔥 PRODUCT FETCH
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

  // 🔥 OFFER
  useEffect(() => {
    const fetchOffer = async () => {
      const snap = await getDocs(collection(db, "offers"));

      const offers = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter((o: any) =>
          o.active &&
          new Date(o.endDate).getTime() > Date.now()
        );

      const matched = offers.find((o: any) =>
        o.productId === product?.id
      );

      if (matched) setDiscount(Number(matched.discount || 0));
    };

    if (product) fetchOffer();
  }, [product]);

  // 🔥 SIMILAR
  const fetchSimilar = async (category: string) => {
    const snap = await getDocs(collection(db, "products"));

    const data = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((p: any) => p.category === category && p.id !== id)
      .slice(0, 6);

    setSimilar(data);
  };

  if (loading) return <>Loading...</>;
  if (!product) return <>Product not found</>;

  const variant = product?.variations?.[selectedColor] || {};

  const price =
    Number(selectedSize?.sellPrice) ||
    Number(product?.price) ||
    0;

  const finalPrice = Math.round(price - (price * discount) / 100);

  const stock = Number(selectedSize?.stock) || 0;

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // 🛒 ADD
  const handleAddToCart = async () => {

    if (!user) return router.push(`/login?redirect=/product/${id}`);
    if (!selectedSize) return alert("Select size");

    await addDoc(collection(db, "carts", user.uid, "items"), {
      productId: product.id,
      name: product.name,
      price,
      quantity: 1
    });

    toast.success("Added to cart 🛒");
    setTimeout(() => router.push("/cart"), 1000);
  };

  // ⚡ BUY
  const handleBuyNow = async () => {

    if (!user) return router.push(`/login?redirect=/product/${id}`);
    if (!selectedSize) return alert("Select size");

    // 🔥 STOCK -1 + SOLD +1
    await updateDoc(doc(db, "products", product.id), {
      sold: increment(1)
    });

    localStorage.setItem("buy-now", JSON.stringify({
      productId: product.id,
      price: finalPrice
    }));

    router.push("/checkout");
  };

  return (
    <div className="p-4">

      <h1 className="text-xl font-bold">{product.name}</h1>

      {/* ⭐ RATING */}
      <div className="flex items-center gap-2 mt-2">
        <span className="text-yellow-500">⭐⭐⭐⭐⭐</span>
        <span>{rating} rating</span>
      </div>

      {/* 👀 VIEWERS */}
      <p className="text-sm text-red-500 mt-1">
        👀 {viewers} people viewing now
      </p>

      {/* 🔥 SOLD */}
      <p className="text-sm text-gray-600">
        🔥 {sold}+ sold
      </p>

      {/* ⏱ TIMER */}
      <p className="text-sm text-red-600 font-semibold">
        ⏱ Offer ends in {formatTime(timer)}
      </p>

      {/* PRICE */}
      <div className="mt-2">
        <span className="text-2xl text-green-600">₹{finalPrice}</span>
        {discount > 0 && (
          <span className="ml-2 line-through text-gray-400">₹{price}</span>
        )}
      </div>

      {/* STOCK */}
      <p className="text-red-500">
        Only {Math.max(1, stock)} left ⚡
      </p>

      {/* REVIEW */}
      <div className="mt-5">
        <ReviewSection productId={product.id} />
      </div>

      {/* BUTTONS */}
      <div className="fixed bottom-0 left-0 w-full flex gap-3 p-3 bg-white">
        <button onClick={handleAddToCart} className="w-1/2 border py-3">
          Add to Cart
        </button>
        <button onClick={handleBuyNow} className="w-1/2 bg-blue-600 text-white py-3">
          Buy Now
        </button>
      </div>

    </div>
  );
}

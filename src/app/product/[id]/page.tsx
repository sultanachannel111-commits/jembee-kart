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

  const [discount, setDiscount] = useState(0);

  // 🔥 NEW STATES
  const [rating, setRating] = useState(4.5);
  const [viewers, setViewers] = useState(10);
  const [sold, setSold] = useState(50);

  // 🔐 AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // 🔥 PRODUCT FETCH (FIXED)
  useEffect(() => {
    const fetchProduct = async () => {

      try {
        const snap = await getDoc(doc(db, "products", id));

        if (snap.exists()) {
          const data: any = { id: snap.id, ...snap.data() };

          console.log("🔥 PRODUCT DATA:", data);

          setProduct(data);

          // ✅ SAFE SIZE FIX
          const firstVar = data?.variations?.[0];
          const firstSize = firstVar?.sizes?.[0];

          setSelectedSize(firstSize || null);
        }

      } catch (err) {
        console.log("❌ PRODUCT ERROR:", err);
      }

      setLoading(false);
    };

    if (id) fetchProduct();
  }, [id]);

  // 🔥 OFFER
  useEffect(() => {
    const fetchOffer = async () => {
      const snap = await getDocs(collection(db, "offers"));

      const match = snap.docs.find(
        (d: any) => d.data()?.productId === product?.id
      );

      if (match) {
        setDiscount(Number(match.data()?.discount || 0));
      }
    };

    if (product) fetchOffer();
  }, [product]);

  // 🔥 FAKE LIVE
  useEffect(() => {

    setRating((Math.random() * 0.7 + 4.2).toFixed(1) as any);
    setSold(Math.floor(Math.random() * 200 + 50));

    const interval = setInterval(() => {
      setViewers(Math.floor(Math.random() * 20 + 5));
    }, 3000);

    return () => clearInterval(interval);

  }, []);

  if (loading) return <div className="p-5">Loading...</div>;
  if (!product) return <div className="p-5">Product not found ❌</div>;

  // ✅ SAFE VARIANT
  const variant = product?.variations?.[selectedColor] || {};

  // ✅ SAFE IMAGE FIX
  const image =
    variant?.images?.main ||
    product?.image ||
    "/no-image.png";

  // 💰 PRICE FIX
  const price =
    Number(selectedSize?.sellPrice) ||
    Number(product?.price) ||
    0;

  const finalPrice = Math.max(
    1,
    Math.round(price - (price * discount) / 100)
  );

  const stock = Number(selectedSize?.stock) || 0;

  // 🛒 ADD
  const handleAddToCart = async () => {

    if (!user) return router.push(`/login?redirect=/product/${id}`);
    if (!selectedSize) return alert("Select size");

    await addDoc(collection(db, "carts", user.uid, "items"), {
      productId: product.id,
      name: product.name,
      image,
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

      {/* IMAGE */}
      <img
        src={image}
        className="w-full h-[300px] object-cover rounded-xl"
      />

      <h1 className="text-xl font-bold mt-3">{product.name}</h1>

      {/* ⭐ RATING */}
      <p className="mt-1">⭐⭐⭐⭐⭐ {rating}</p>

      {/* 👀 VIEWERS */}
      <p className="text-red-500 text-sm">
        👀 {viewers} people viewing
      </p>

      {/* 🔥 SOLD */}
      <p className="text-sm text-gray-500">
        🔥 {sold}+ sold
      </p>

      {/* PRICE */}
      <div className="mt-2">
        <span className="text-2xl text-green-600">₹{finalPrice}</span>
        {discount > 0 && (
          <span className="ml-2 line-through text-gray-400">
            ₹{price}
          </span>
        )}
      </div>

      {/* STOCK */}
      <p className="text-red-500 mt-1">
        Only {Math.max(1, stock)} left ⚡
      </p>

      {/* SIZE */}
      <div className="mt-4 flex gap-2">
        {variant?.sizes?.map((s: any, i: number) => (
          <button
            key={i}
            onClick={() => setSelectedSize(s)}
            className="border px-3 py-1 rounded"
          >
            {s.size}
          </button>
        ))}
      </div>

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

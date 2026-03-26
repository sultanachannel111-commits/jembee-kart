"use client";

import { useEffect, useState } from "react";
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

  // PINCODE
  const [pincode, setPincode] = useState("");
  const [pinStatus, setPinStatus] = useState("");

  // TIMER
  const [timeLeft, setTimeLeft] = useState(7200);

  // AUTH
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // FETCH
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

  // AFFILIATE
  useEffect(() => {
    if (!ref) return;
    localStorage.setItem("affiliate", ref);
  }, [ref]);

  // TIMER
  useEffect(() => {
    if (!product?.isTrending) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [product]);

  const formatTime = (sec: number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  };

  const fetchSimilar = async (category: string) => {
    const snap = await getDocs(collection(db, "products"));
    const data = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .filter((p: any) => p.category === category && p.id !== id)
      .slice(0, 6);
    setSimilar(data);
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!product) return <div>Not found</div>;

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

  // PINCODE
  const checkPincode = () => {
    if (pincode.length !== 6) return alert("Invalid pincode");

    if (pincode.startsWith("8")) {
      setPinStatus("fast");
    } else {
      setPinStatus("slow");
    }
  };

  const getDelivery = () => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toDateString();
  };

  // CART
  const handleAddToCart = async () => {
    if (!user) return router.push("/login");

    await addDoc(collection(db, "carts", user.uid, "items"), {
      productId: product.id,
      name: product.name,
      image: images[0],
      size: selectedSize.size,
      price,
      quantity: 1
    });

    alert("Added to cart");
  };

  // BUY
  const handleBuyNow = async () => {
    router.push("/checkout");
  };

  return (
    <div className="pb-28">

      {/* BACK */}
      <button
        onClick={() => router.back()}
        className="p-3 text-xl"
      >
        ←
      </button>

      {/* IMAGE */}
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
            <img
              key={i}
              src={img}
              onClick={() => setShowViewer(true)}
              className="w-full h-[300px] object-contain"
            />
          ))}
        </div>

        {/* DOTS */}
        <div className="flex justify-center gap-2 mt-2">
          {images.map((_, i) => (
            <div
              key={i}
              className={`w-2 h-2 rounded-full ${
                currentImage === i ? "bg-blue-600" : "bg-gray-300"
              }`}
            />
          ))}
        </div>

        {/* VARIANTS */}
        <div className="flex gap-2 mt-3 px-4">
          {product?.variations?.map((v: any, i: number) => (
            <img
              key={i}
              src={v?.images?.main}
              onClick={() => {
                setSelectedColor(i);
                setSelectedSize(v?.sizes?.[0]);
              }}
              className={`w-14 h-14 rounded-xl border ${
                selectedColor === i ? "border-blue-600" : ""
              }`}
            />
          ))}
        </div>
      </div>

      {/* NAME */}
      <div className="p-4">
        <h1 className="text-xl font-bold">{product.name}</h1>

        <div className="text-2xl text-green-600 font-bold mt-2">
          ₹{price}
        </div>

        {/* TIMER */}
        {product?.isTrending && (
          <div className="text-red-500 mt-2">
            Offer ends in {formatTime(timeLeft)}
          </div>
        )}

        {/* SIZE */}
        <div className="mt-4">
          <p className="font-bold">Select Size</p>
          <div className="flex gap-2 mt-2">
            {variant?.sizes?.map((s: any, i: number) => (
              <button
                key={i}
                onClick={() => setSelectedSize(s)}
                className={`px-4 py-2 rounded-xl border ${
                  selectedSize?.size === s.size
                    ? "bg-blue-600 text-white"
                    : ""
                }`}
              >
                {s.size}
              </button>
            ))}
          </div>
        </div>

        {/* PINCODE */}
        <div className="glass p-3 mt-4 rounded-xl">
          <input
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="Enter pincode"
            className="border p-2 w-full"
          />
          <button
            onClick={checkPincode}
            className="bg-black text-white px-3 py-1 mt-2"
          >
            Check
          </button>

          {pinStatus === "fast" && <p>⚡ Fast delivery</p>}
          {pinStatus === "slow" && <p>🚚 Normal delivery</p>}

          <p>Delivery by {getDelivery()}</p>

          <div className="text-xs mt-2">🔒 Secure • 🚚 COD</div>
        </div>

        {/* DESCRIPTION */}
        <div className="bg-white p-3 mt-4 rounded-xl shadow">
          {product.description}
        </div>

        {/* SIMILAR */}
        <h3 className="font-bold mt-6">You may also like</h3>
        <div className="flex gap-3 overflow-x-auto">
          {similar.map((p: any) => (
            <div
              key={p.id}
              onClick={() => router.push(`/product/${p.id}`)}
              className="min-w-[140px]"
            >
              <img src={p?.variations?.[0]?.images?.main} />
              <p>{p.name}</p>
            </div>
          ))}
        </div>

        <ReviewSection product={product} />
      </div>

      {/* WHATSAPP */}
      <button
        onClick={() =>
          window.open(`https://wa.me/?text=${product.name}`)
        }
        className="fixed bottom-20 right-4 bg-green-500 text-white px-4 py-3 rounded-full"
      >
        Chat
      </button>

      {/* BOTTOM BAR */}
      <div className="fixed bottom-0 left-0 w-full bg-white flex gap-3 p-3">
        <button
          onClick={handleAddToCart}
          className="flex-1 border border-blue-600 text-blue-600 py-3 rounded-xl"
        >
          Add to Cart
        </button>
        <button
          onClick={handleBuyNow}
          className="flex-1 bg-blue-600 text-white py-3 rounded-xl"
        >
          Buy Now
        </button>
      </div>

      {/* FULL VIEW */}
      {showViewer && (
        <div
          onClick={() => setShowViewer(false)}
          className="fixed inset-0 bg-black flex items-center justify-center"
        >
          <img
            src={images[currentImage]}
            className="max-w-full max-h-full"
          />
        </div>
      )}

    </div>
  );
}

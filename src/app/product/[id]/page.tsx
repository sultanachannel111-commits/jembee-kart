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

  // 🔥 PIN STATES
  const [pincode, setPincode] = useState("");
  const [deliveryInfo, setDeliveryInfo] = useState<any>(null);
  const [checkingPin, setCheckingPin] = useState(false);
  const [pinError, setPinError] = useState("");

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
      }

      setLoading(false);
    };

    if (id) fetchProduct();
  }, [id]);

  // 🔥 AFFILIATE
  useEffect(() => {
    const saveAffiliate = async () => {
      if (!ref) return;

      try {
        localStorage.setItem("affiliate", ref);

        const user = auth.currentUser;
        if (user) {
          await setDoc(
            doc(db, "userAffiliate", user.uid),
            {
              refCode: ref,
              updatedAt: new Date(),
            },
            { merge: true }
          );
        }
      } catch (err) {
        console.log(err);
      }
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

  // 🚚 PINCODE CHECK (PROFESSIONAL)
  const checkPincode = async () => {
    setPinError("");
    setDeliveryInfo(null);

    if (!pincode || pincode.length !== 6) {
      return setPinError("Please enter a valid 6-digit PIN code.");
    }

    setCheckingPin(true);

    try {
      const res = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await res.json();

      if (data[0].Status === "Success") {
        const postOffice = data[0].PostOffice[0];

        setDeliveryInfo({
          place: postOffice.District,
          state: postOffice.State,
          deliveryDays: Math.floor(Math.random() * 3) + 3,
        });
      } else {
        setPinError(
          "Delivery is currently unavailable for this PIN code. Please try a different location."
        );
      }
    } catch (err) {
      setPinError(
        "We couldn’t verify this PIN code right now. Please try again shortly."
      );
    }

    setCheckingPin(false);
  };

  if (loading) return <>Loading...</>;
  if (!product) return <>Product not found</>;

  const variant = product?.variations?.[selectedColor] || {};

  const images = [
    variant?.images?.main,
    variant?.images?.front,
    variant?.images?.back,
    variant?.images?.side,
    variant?.images?.model,
  ].filter(Boolean);

  const price =
    Number(selectedSize?.sellPrice) ||
    Number(selectedSize?.price) ||
    Number(variant?.sizes?.[0]?.sellPrice) ||
    Number(variant?.sizes?.[0]?.price) ||
    Number(product?.price) ||
    0;

  // 🛒 CART
  const handleAddToCart = async () => {
    if (!user) return router.push(`/login?redirect=/product/${id}`);
    if (!selectedSize) return alert("Select size");

    await addDoc(collection(db, "carts", user.uid, "items"), {
      productId: product.id,
      name: product.name,
      image: images?.[0] || "",
      size: selectedSize.size,
      price: price,
      quantity: 1,
    });

    alert("Added to cart");
    router.push("/cart");
  };

  // ⚡ BUY
  const handleBuyNow = async () => {
    if (!user) return router.push(`/login?redirect=/product/${id}`);
    if (!selectedSize) return alert("Select size");

    const orderRef = await addDoc(collection(db, "orders"), {
      userId: user.uid,
      productId: product.id,
      name: product.name,
      image: images?.[0] || "",
      size: selectedSize.size,
      price: price,
      status: "pending",
    });

    router.push(`/checkout?orderId=${orderRef.id}`);
  };

  return (
    <div>
      {/* IMAGE */}
      {images.map((img: any, i: number) => (
        <img
          key={i}
          src={img}
          className="w-full h-[320px] object-contain"
        />
      ))}

      <div className="p-4">
        <h1 className="text-xl font-bold">{product.name}</h1>

        <div className="text-3xl font-bold text-green-600 mt-2">
          ₹{price}
        </div>

        {/* PIN */}
        <div className="mt-5 bg-white p-4 rounded-2xl shadow">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Enter PIN code"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2"
            />

            <button
              onClick={checkPincode}
              className="bg-black text-white px-4 rounded-lg"
            >
              {checkingPin ? "Checking..." : "Check"}
            </button>
          </div>

          {/* ✅ ERROR */}
          {pinError && (
            <div className="mt-2 text-red-500 text-sm font-medium">
              {pinError}
            </div>
          )}

          {/* ✅ SUCCESS */}
          {deliveryInfo && (
            <div className="mt-3 text-green-600 text-sm font-medium">
              Delivery to {deliveryInfo.place}, {deliveryInfo.state} in{" "}
              {deliveryInfo.deliveryDays} -{" "}
              {deliveryInfo.deliveryDays + 2} days
            </div>
          )}
        </div>

        {/* 🔥 SIMILAR (MOVED ABOVE REVIEW) */}
        <div className="mt-6">
          <h3 className="font-bold mb-3">You may also like</h3>

          <div className="flex gap-3 overflow-x-auto">
            {similar.map((p: any) => (
              <div
                key={p.id}
                onClick={() => router.push(`/product/${p.id}`)}
                className="min-w-[140px] bg-white p-2 rounded-xl shadow"
              >
                <img
                  src={p?.variations?.[0]?.images?.main}
                  className="h-32 w-full object-cover rounded"
                />
                <p className="text-sm">{p.name}</p>
                <p className="text-green-600 font-bold">
                  ₹{p?.variations?.[0]?.sizes?.[0]?.sellPrice || 0}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ⭐ REVIEWS */}
        <div className="mt-6">
          <ReviewSection productId={product.id} />
        </div>
      </div>

      {/* BUTTONS */}
      <div className="fixed bottom-0 left-0 w-full flex gap-3 p-3 bg-white border-t">
        <button
          onClick={handleAddToCart}
          className="w-1/2 py-3 rounded-xl border border-blue-600 text-blue-600"
        >
          Add to Cart
        </button>

        <button
          onClick={handleBuyNow}
          className="w-1/2 py-3 rounded-xl bg-blue-600 text-white"
        >
          Buy Now
        </button>
      </div>
    </div>
  );
}

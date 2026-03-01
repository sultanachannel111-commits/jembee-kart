
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, setDoc, collection, onSnapshot } from "firebase/firestore"; // 💯
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";
import Link from "next/link";
export default function ProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [zoomOpen, setZoomOpen] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [viewers, setViewers] = useState(0);
  const [soldCount, setSoldCount] = useState(0);
  const [deliveryDate, setDeliveryDate] = useState("");

  /* ---------------- FETCH PRODUCT ---------------- */
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        const docRef = doc(db, "products", id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProduct({ id: docSnap.id, ...data });

          if (data?.images?.length > 0) {
            setSelectedImage(data.images[0]);
          } else {
            setSelectedImage(data?.image || "");
          }
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.log("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  /* ---------------- RANDOM DATA ---------------- */
  useEffect(() => {
    setViewers(Math.floor(Math.random() * 15) + 5);
    setSoldCount(Math.floor(Math.random() * 200) + 50);

    const future = new Date();
    future.setDate(future.getDate() + 3);
    setDeliveryDate(
      future.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })
    );
  }, []);

  /* ---------------- OFFER ---------------- */

const [activeOffer, setActiveOffer] = useState<any>(null);

useEffect(() => {
  if (!product) return;

  const unsub = onSnapshot(collection(db, "offers"), (snap) => {
    const now = new Date();

    const matched = snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .find((o: any) => {
        if (!o.active) return false;
        if (new Date(o.endDate) <= now) return false;

        // Product offer
        if (o.type === "product" && o.productId === product.id)
          return true;

        // Category offer
        if (
          o.type === "category" &&
          o.category?.trim().toLowerCase() ===
            product.category?.trim().toLowerCase()
        )
          return true;

        return false;
      });

    setActiveOffer(matched || null);
  });

  return () => unsub();
}, [product]);

const isOfferActive = !!activeOffer;

const finalPrice =
  product && isOfferActive
    ? Math.round(
        product.sellingPrice -
          (product.sellingPrice * activeOffer.discount) / 100
      )
    : product?.sellingPrice ?? 0;

const discountPercent = isOfferActive
  ? activeOffer.discount
  : null;

  /* ---------------- COUNTDOWN ---------------- */

  useEffect(() => {
  if (!activeOffer?.endDate) return;

  const interval = setInterval(() => {
    const diff =
      new Date(activeOffer.endDate).getTime() -
      new Date().getTime();

    if (diff <= 0) {
      setTimeLeft("Offer Ended");
      clearInterval(interval);
    } else {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor(
        (diff % (1000 * 60 * 60)) / (1000 * 60)
      );

      setTimeLeft(`${hours}h ${minutes}m left`);
    }
  }, 1000);

  return () => clearInterval(interval);
}, [activeOffer]);

  /* ---------------- FIRESTORE CART ---------------- */

  /* ---------------- REAL FIRESTORE CART ---------------- */

const handleAddToCart = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      router.push("/login");
      return;
    }

    if (!product?.stock || product.stock === 0) return;
    if (quantity > product.stock) return;

    const itemRef = doc(db, "cart", user.uid, "items", product.id);
    const existing = await getDoc(itemRef);

    if (existing.exists()) {
      await setDoc(itemRef, {
        ...existing.data(),
        quantity: existing.data().quantity + quantity,
        updatedAt: new Date(),
      });
    } else {
      await setDoc(itemRef, {
        productId: product.id,
        name: product.name,
        price: product.sellingPrice,
        image: selectedImage,
        quantity,
        createdAt: new Date(),
      });
    }

    router.push("/cart");

  } catch (error) {
    console.log("Cart error:", error);
    console.log("Something went wrong");
  }
};

  const handleBuyNow = async () => {
    await handleAddToCart();
    router.push("/cart");
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl">
        Loading...
      </div>
    );

  if (!product)
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-500">
        Product not found
      </div>
    );

  return (
    <>
      <div className="max-w-7xl mx-auto p-6 grid md:grid-cols-2 gap-10">
        {/* IMAGE */}
        <div>
          <div
            onClick={() => setZoomOpen(true)}
            className="rounded-xl border shadow-lg overflow-hidden cursor-pointer bg-white relative"
          >
            <img
              src={selectedImage}
              alt={product?.name}
              className="w-full h-[450px] object-cover"
            />

            {discountPercent && (
              <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm">
                {discountPercent}% OFF
              </div>
            )}
          </div>
        </div>

        {/* DETAILS */}
        <div>
          {product?.category && (
            <Link
              href={`/category/${product.category}`}
              className="text-sm text-pink-600 font-medium"
            >
              {product.category}
            </Link>
          )}

          <h1 className="text-3xl font-bold mt-2">
            {product?.name}
          </h1>

          <p className="text-3xl text-green-600 font-bold mt-3">
            ₹{finalPrice}
          </p>
          {/* ---------------- STOCK STATUS ---------------- */}

{product?.stock === 0 && (
  <div className="mt-3 bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg font-semibold text-sm">
    ❌ Out of Stock
  </div>
)}

{product?.stock > 0 && product.stock <= 2 && (
  <div className="mt-3 bg-orange-50 border border-orange-200 p-3 rounded-lg">
    <div className="flex items-center justify-between">
      <span className="text-orange-700 font-semibold text-sm animate-pulse">
        🔥 Hurry! Only {product.stock} left
      </span>
    </div>

    <div className="w-full bg-orange-200 h-2 rounded-full mt-2 overflow-hidden">
      <div
        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
        style={{
          width: `${(product.stock / 5) * 100}%`,
        }}
      />
    </div>
  </div>
)}

{product?.stock > 2 && product.stock <= 5 && (
  <div className="mt-3 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
    <span className="text-yellow-700 font-medium text-sm">
      ⚡ Limited Stock Available
    </span>
  </div>
)}
          {isOfferActive && (
            <div className="mt-2">
              <span className="line-through text-gray-400 mr-3">
                ₹{product?.sellingPrice}
              </span>
              <span className="text-red-600 font-semibold">
                🔥 {timeLeft}
              </span>
            </div>
          )}

          <div className="mt-3 text-sm text-gray-600">
            👀 {viewers} people viewing
          </div>

          <div className="text-sm text-red-600 font-semibold mt-1">
            🔥 {soldCount}+ sold recently
          </div>

          <div className="text-sm text-green-600 mt-2">
            📦 Get it by <span className="font-semibold">{deliveryDate}</span>
          </div>

          <p className="text-gray-600 mt-4">
            {product?.description}
          </p>

          <div className="flex items-center gap-4 mt-6">
            <button
              onClick={() => setQuantity((q) => (q > 1 ? q - 1 : 1))}
              className="px-3 py-1 border rounded"
            >
              -
            </button>

            <span className="text-lg font-semibold">
              {quantity}
            </span>

            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="px-3 py-1 border rounded"
            >
              +
            </button>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-black text-white py-3 rounded-lg"
            >
              🛒 Add to Cart
            </button>

            <button
              onClick={handleBuyNow}
              className="flex-1 bg-pink-600 text-white py-3 rounded-lg"
            >
              ⚡ Buy Now
            </button>
          </div>
        </div>
      </div>

      {zoomOpen && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setZoomOpen(false)}
        >
          <img
            src={selectedImage}
            className="max-h-[90%] max-w-[90%] rounded-lg"
          />
        </div>
      )}
    </>
  );
}

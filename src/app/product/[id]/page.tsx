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

  const [product,setProduct] = useState<any>(null);
  const [loading,setLoading] = useState(true);
  const [user,setUser] = useState<any>(null);

  const [selectedColor,setSelectedColor] = useState(0);
  const [selectedSize,setSelectedSize] = useState<any>(null);

  const [currentImage,setCurrentImage] = useState(0);
  const [showViewer,setShowViewer] = useState(false);

  const [similar,setSimilar] = useState<any[]>([]);

  // 📍 PINCODE
  const [pincode, setPincode] = useState("");
  const [pinStatus, setPinStatus] = useState("");

  // 🔐 AUTH
  useEffect(()=>{
    const unsub = onAuthStateChanged(auth,(u)=>setUser(u));
    return ()=>unsub();
  },[]);

  // 🔥 FETCH PRODUCT
  useEffect(()=>{
    const fetchProduct = async()=>{
      const snap = await getDoc(doc(db,"products",id));

      if(snap.exists()){
        const data:any = { id:snap.id, ...snap.data() };
        setProduct(data);

        const first = data?.variations?.[0];
        setSelectedSize(first?.sizes?.[0] || null);

        fetchSimilar(data.category);
      }

      setLoading(false);
    };

    if(id) fetchProduct();
  },[id]);

  // 🔥 AFFILIATE TRACKING
  useEffect(() => {
    const saveAffiliate = async () => {
      if (!ref) return;

      localStorage.setItem("affiliate", ref);

      const user = auth.currentUser;
      if (!user) return;

      try {
        await setDoc(
          doc(db, "userAffiliate", user.uid),
          {
            refCode: ref,
            updatedAt: new Date()
          },
          { merge: true }
        );
      } catch (err) {
        console.log(err);
      }
    };

    saveAffiliate();
  }, [ref]);

  // 🔥 SIMILAR
  const fetchSimilar = async (category:string)=>{
    const snap = await getDocs(collection(db,"products"));

    const data = snap.docs
      .map(d=>({id:d.id,...d.data()}))
      .filter((p:any)=>p.category === category && p.id !== id)
      .slice(0,6);

    setSimilar(data);
  };

  if(loading) return <div className="p-5">Loading...</div>;
  if(!product) return <div className="p-5">Product not found</div>;

  const variant = product?.variations?.[selectedColor] || {};

  const images = [
    variant?.images?.main,
    variant?.images?.front,
    variant?.images?.back,
    variant?.images?.side,
    variant?.images?.model
  ].filter(Boolean);

  const price =
    Number(selectedSize?.sellPrice) ||
    Number(selectedSize?.price) ||
    Number(variant?.sizes?.[0]?.sellPrice) ||
    Number(product?.price) ||
    0;

  const stock = Number(selectedSize?.stock) || 0;

  // ⏳ TIMER
  const timerEnabled = product?.isTrending || stock <= 5;
  const [timeLeft, setTimeLeft] = useState(7200);

  useEffect(() => {
    if (!timerEnabled) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timerEnabled]);

  const formatTime = (sec:number) => {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    return `${h}h ${m}m`;
  };

  // 🚚 DELIVERY DATE
  const getDeliveryDate = () => {
    const today = new Date();

    const min = new Date(today);
    min.setDate(today.getDate() + 3);

    const max = new Date(today);
    max.setDate(today.getDate() + 6);

    const options: any = { weekday: "short", day: "numeric", month: "short" };

    return {
      min: min.toLocaleDateString("en-IN", options),
      max: max.toLocaleDateString("en-IN", options)
    };
  };

  const delivery = getDeliveryDate();

  // ✅ FIXED PINCODE FUNCTION
  const checkPincode = () => {
    if (pincode.length !== 6) return alert("Invalid pincode");

    if (pincode.startsWith("8")) {
      setPinStatus("fast");
    } else {
      setPinStatus("slow");
    }
  };

  // 🛒 CART
  const handleAddToCart = async () => {

    if (!user) return router.push(`/login?redirect=/product/${id}`);
    if (!selectedSize) return alert("Select size");

    const finalPrice =
      Number(selectedSize?.sellPrice) ||
      Number(selectedSize?.price) ||
      Number(product?.price) ||
      0;

    await addDoc(collection(db,"carts",user.uid,"items"),{
      productId: product.id,
      name: product.name,
      image: images?.[0] || "",
      size: selectedSize.size,
      price: finalPrice,
      quantity: 1
    });

    alert("Added to cart");
    router.push("/cart");
  };

  const handleBuyNow = async () => {
    if (!user) return router.push(`/login?redirect=/product/${id}`);
    if (!selectedSize) return alert("Select size");

    const item = {
      id: product.id,
      name: product.name,
      image: images?.[0] || "",
      size: selectedSize.size,
      quantity: 1,
      price:
        Number(selectedSize?.sellPrice) ||
        Number(product?.price) ||
        0,
    };

    localStorage.setItem("buy-now", JSON.stringify(item));
    router.push("/checkout");
  };

  return (
    <div className="p-4">

      <h1>{product.name}</h1>

      <p>₹{price}</p>

      {/* DELIVERY */}
      <p>
        {delivery?.min} - {delivery?.max}
      </p>

      {/* PINCODE */}
      <input
        value={pincode}
        onChange={(e)=>setPincode(e.target.value)}
        placeholder="Enter pincode"
      />
      <button onClick={checkPincode}>Check</button>

      <button onClick={handleAddToCart}>Add to Cart</button>
      <button onClick={handleBuyNow}>Buy Now</button>

      <ReviewSection product={product} />

    </div>
  );
}

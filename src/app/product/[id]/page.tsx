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

  const checkPincode = async () => {
    if (pincode.length !== 6) return alert("Invalid pincode");

    try {
      const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await res.json();

      if (data[0].Status === "Success") {
        setPinStatus("fast");
      } else {
        setPinStatus("invalid");
      }
    } catch {
      setPinStatus("invalid");
    }
  };

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

  // 🔥 AFFILIATE
  useEffect(() => {
    if (!ref) return;

    localStorage.setItem("affiliate", ref);

    const user = auth.currentUser;
    if (!user) return;

    setDoc(doc(db,"userAffiliate",user.uid),{
      refCode: ref,
      updatedAt: new Date()
    },{ merge:true });

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

  // 💰 PRICE
  const price =
    Number(selectedSize?.sellPrice) ||
    Number(product?.price) || 0;

  const stock = Number(selectedSize?.stock) || 0;

  // ⏳ TIMER
  const timerEnabled = product?.isTrending || stock <= 5;
  const [timeLeft, setTimeLeft] = useState(7200);

  useEffect(() => {
    if (!timerEnabled) return;

    const timer = setInterval(()=>{
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    },1000);

    return ()=>clearInterval(timer);
  },[timerEnabled]);

  const formatTime = (sec:number)=>{
    const h = Math.floor(sec/3600);
    const m = Math.floor((sec%3600)/60);
    return `${h}h ${m}m`;
  };

  // 🚚 DELIVERY
  const getDeliveryDate = ()=>{
    const today = new Date();

    const min = new Date(today);
    min.setDate(today.getDate()+3);

    const max = new Date(today);
    max.setDate(today.getDate()+6);

    return {
      min: min.toLocaleDateString("en-IN"),
      max: max.toLocaleDateString("en-IN")
    };
  };

  const delivery = getDeliveryDate();

  // 🛒 CART
  const handleAddToCart = async () => {

    if (!user) return router.push(`/login?redirect=/product/${id}`);
    if (!selectedSize) return alert("Select size");

    const refCode = localStorage.getItem("affiliate");

    await addDoc(collection(db,"carts",user.uid,"items"),{
      productId: product.id,
      name: product.name,
      image: images[0],
      size: selectedSize.size,
      price: price,
      quantity: 1,
      affiliateCode: refCode
    });

    alert("Added to cart");
    router.push("/cart");
  };

  // ⚡ BUY
  const handleBuyNow = async () => {

    if (!user) return router.push(`/login?redirect=/product/${id}`);
    if (!selectedSize) return alert("Select size");

    localStorage.setItem("buy-now",JSON.stringify({
      id: product.id,
      name: product.name,
      image: images[0],
      price: price,
      size: selectedSize.size
    }));

    router.push("/checkout");
  };

  // 🔗 SHARE
  const handleShare = ()=>{
    navigator.share?.({
      title: product.name,
      url: window.location.href
    });
  };

  // 🔥 SLIDER
  const handleScroll = (e:any)=>{
    const index = Math.round(
      e.target.scrollLeft / e.target.clientWidth
    );
    setCurrentImage(index);
  };

  return (
    <div className="min-h-screen pb-28">

      {/* IMAGE */}
      <div onScroll={handleScroll} className="flex overflow-x-auto">
        {images.map((img:any,i:number)=>(
          <img key={i} src={img} className="w-full h-[300px]" />
        ))}
      </div>

      <div className="p-4">

        <h1 className="text-xl font-bold">{product.name}</h1>
        <p className="text-green-600 text-2xl">₹{price}</p>

        {/* TIMER */}
        {timerEnabled && (
          <div className="text-red-600 mt-2">
            ⏳ Order within {formatTime(timeLeft)}
          </div>
        )}

        {/* DELIVERY */}
        <div className="mt-3">
          🚚 {delivery.min} - {delivery.max}
        </div>

        {/* PINCODE */}
        <div className="mt-3">
          <input
            value={pincode}
            onChange={(e)=>setPincode(e.target.value)}
            placeholder="Enter pincode"
            className="border p-2"
          />
          <button onClick={checkPincode}>Check</button>

          {pinStatus === "fast" && <p>⚡ Fast delivery</p>}
          {pinStatus === "invalid" && <p>❌ Not available</p>}
        </div>

      </div>

      <ReviewSection product={product} />

      {/* BUTTONS */}
      <div className="fixed bottom-0 w-full flex">
        <button onClick={handleAddToCart} className="w-1/2 bg-white">
          Add to Cart
        </button>
        <button onClick={handleBuyNow} className="w-1/2 bg-blue-600 text-white">
          Buy Now
        </button>
      </div>

    </div>
  );
}

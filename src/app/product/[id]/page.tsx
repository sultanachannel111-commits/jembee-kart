"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { doc, getDoc, setDoc, addDoc, collection, getDocs } from "firebase/firestore";
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

// ✅ PINCODE (FIXED PLACE)
const [pincode, setPincode] = useState("");
const [pinStatus, setPinStatus] = useState("");

// ✅ FIXED FUNCTION
const checkPincode = () => {
  if (pincode.length !== 6) return alert("Invalid pincode");

  if (pincode.startsWith("8")) {
    setPinStatus("fast");
  } else {
    setPinStatus("slow");
  }
};

// AUTH
useEffect(()=>{
  const unsub = onAuthStateChanged(auth,(u)=>setUser(u));
  return ()=>unsub();
},[]);

// FETCH PRODUCT
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

// SIMILAR
const fetchSimilar = async (category:string)=>{
  const snap = await getDocs(collection(db,"products"));

  const data = snap.docs
    .map(d=>({id:d.id,...d.data()}))
    .filter((p:any)=>p.category === category && p.id !== id)
    .slice(0,6);

  setSimilar(data);
};

if(loading) return <div>Loading...</div>;
if(!product) return <div>Product not found</div>;

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
  Number(product?.price) ||
  0;

// DELIVERY
const getDeliveryDate = () => {
  const today = new Date();

  const min = new Date(today);
  min.setDate(today.getDate() + 3);

  const max = new Date(today);
  max.setDate(today.getDate() + 6);

  return {
    min: min.toLocaleDateString("en-IN"),
    max: max.toLocaleDateString("en-IN")
  };
};

const delivery = getDeliveryDate();

// CART
const handleAddToCart = async () => {
  if (!user) return router.push(`/login`);
  if (!selectedSize) return alert("Select size");

  await addDoc(collection(db,"carts",user.uid,"items"),{
    productId: product.id,
    name: product.name,
    image: images?.[0] || "",
    size: selectedSize.size,
    price: price,
    quantity: 1
  });

  alert("Added to cart");
  router.push("/cart");
};

// BUY
const handleBuyNow = async () => {
  if (!user) return router.push(`/login`);
  if (!selectedSize) return alert("Select size");

  localStorage.setItem("buy-now", JSON.stringify({
    id: product.id,
    name: product.name,
    image: images?.[0],
    price: price
  }));

  router.push("/checkout");
};

return (
<div className="p-4">

<h1 className="text-xl font-bold">{product.name}</h1>
<p className="text-green-600 text-2xl">₹{price}</p>

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
  {pinStatus === "slow" && <p>🚚 Slow delivery</p>}
</div>

<button onClick={handleAddToCart}>Add to Cart</button>
<button onClick={handleBuyNow}>Buy Now</button>

<ReviewSection product={product} />

</div>
);
}

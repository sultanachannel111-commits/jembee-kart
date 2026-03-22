"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, addDoc, collection } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function ProductPage() {

const params = useParams();
const router = useRouter();
const id = params?.id as string;

const [product,setProduct] = useState<any>(null);
const [loading,setLoading] = useState(true);
const [user,setUser] = useState<any>(null);

const [selectedColor,setSelectedColor] = useState(0);
const [selectedSize,setSelectedSize] = useState<any>(null);

const [currentImage,setCurrentImage] = useState(0);
const [showViewer,setShowViewer] = useState(false);

// AUTH
useEffect(()=>{
const unsub = onAuthStateChanged(auth,(u)=>setUser(u));
return ()=>unsub();
},[]);

// FETCH
useEffect(()=>{
const fetchProduct = async()=>{
const snap = await getDoc(doc(db,"products",id));

if(snap.exists()){
const data:any = { id:snap.id, ...snap.data() };
setProduct(data);

const first = data?.variations?.[0];
setSelectedSize(first?.sizes?.[0] || null);
}

setLoading(false);
};

if(id) fetchProduct();
},[id]);

if(loading) return <div className="p-5">Loading...</div>;
if(!product) return <div className="p-5">Product not found</div>;

const variant = product?.variations?.[selectedColor] || {};

// IMAGES
const images = [
variant?.images?.main,
variant?.images?.front,
variant?.images?.back,
variant?.images?.side,
variant?.images?.model
].filter(Boolean);

// 🔥 FINAL PRICE FIX
const price =
Number(selectedSize?.sellPrice) ||
Number(selectedSize?.price) ||
Number(variant?.sizes?.[0]?.sellPrice) ||
Number(variant?.sizes?.[0]?.price) ||
Number(product?.price) ||
0;

const stock = Number(selectedSize?.stock) || 0;

// ADD TO CART
const handleAddToCart = async () => {
if (!user) return router.push(`/login?redirect=/product/${id}`);
if (!selectedSize) return alert("Select size");

await addDoc(collection(db,"carts",user.uid,"items"),{
productId: product.id,
name: product.name,
image: images?.[0] || "",
size: selectedSize.size,
price: price,
sellPrice: price,
quantity: 1
});

alert("Added to cart");
router.push("/cart");
};

// BUY NOW
const handleBuyNow = async () => {
if (!user) return router.push(`/login?redirect=/product/${id}`);
if (!selectedSize) return alert("Select size");

const orderRef = await addDoc(collection(db,"orders"),{
userId: user.uid,
productId: product.id,
name: product.name,
image: images?.[0] || "",
size: selectedSize.size,
price: price,
status: "pending"
});

router.push(`/checkout?orderId=${orderRef.id}`);
};

// SHARE
const handleShare = ()=>{
navigator.share?.({
title: product.name,
url: window.location.href
});
};

// SCROLL
const handleScroll = (e:any)=>{
const scrollLeft = e.target.scrollLeft;
const width = e.target.clientWidth;
setCurrentImage(Math.round(scrollLeft / width));
};

return (
<div className="bg-gradient-to-br from-gray-100 to-white min-h-screen pb-28">

{/* IMAGE */}
<div onScroll={handleScroll} className="flex overflow-x-auto snap-x">
{images.map((img:any,i:number)=>(
<img
key={i}
src={img}
onClick={()=>setShowViewer(true)}
className="w-full h-[320px] object-contain snap-center"
/>
))}
</div>

{/* SHARE */}
<button
onClick={handleShare}
className="absolute top-4 right-4 bg-white/80 backdrop-blur p-2 rounded-full shadow"
>
🔗
</button>

{/* DOTS */}
<div className="flex justify-center gap-2 mt-2">
{images.map((_,i)=>(
<div key={i} className={`w-2 h-2 rounded-full ${
currentImage===i ? "bg-blue-600" : "bg-gray-300"
}`}/>
))}
</div>

<div className="p-4">

{/* NAME */}
<h1 className="text-xl font-bold">{product.name}</h1>

{/* PRICE */}
<div className="mt-2">
<span className="text-3xl font-bold text-green-600">₹{price}</span>
<span className="text-sm text-gray-500 ml-2">Best Price</span>
</div>

{/* STOCK */}
<p className={`mt-1 ${stock>0?"text-green-600":"text-red-500"}`}>
{stock>0 ? `In Stock (${stock})` : "Out of Stock"}
</p>

{/* SIZE */}
<div className="mt-5">
<h3 className="font-semibold mb-3">Select Size</h3>

<div className="grid grid-cols-3 gap-3">

{variant?.sizes?.map((s:any,i:number)=>(
<div
key={i}
onClick={()=>s.stock>0 && setSelectedSize(s)}
className={`p-3 rounded-xl border text-center transition ${
selectedSize?.size===s.size
? "bg-blue-600 text-white"
: "bg-white"
}`}
>

{/* SIZE */}
<div className="font-bold">{s.size}</div>

{/* PRICE */}
<div className="text-sm mt-1">
₹{s.sellPrice || s.price || 0}
</div>

{/* DESCRIPTION */}
<div className="text-[10px] mt-1 text-gray-500">
Premium Quality
</div>

</div>
))}

</div>
</div>

{/* DESCRIPTION BOX */}
<div className="mt-6 bg-white/60 backdrop-blur p-4 rounded-2xl shadow">
{product.description || "Premium quality product with best fabric."}
</div>

</div>

{/* BUTTONS */}
<div className="fixed bottom-0 left-0 w-full flex gap-3 p-3 bg-white border-t">

<button
onClick={handleAddToCart}
className="w-1/2 py-3 rounded-xl border border-blue-600 text-blue-600 font-semibold"
>
Add to Cart
</button>

<button
onClick={handleBuyNow}
className="w-1/2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold"
>
Buy Now
</button>

</div>

</div>
);
}

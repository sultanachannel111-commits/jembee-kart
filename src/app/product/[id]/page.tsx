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
import toast from "react-hot-toast";

export default function ProductPage() {
const params = useParams();
const router = useRouter();
const id = params?.id as string;
const searchParams = useSearchParams();
const ref = searchParams.get("ref");

const [product, setProduct] = useState(null);
const [loading, setLoading] = useState(true);
const [user, setUser] = useState(null);

const [selectedColor, setSelectedColor] = useState(0);
const [selectedSize, setSelectedSize] = useState(null);

const [currentImage, setCurrentImage] = useState(0);
const [showViewer, setShowViewer] = useState(false);

const [similar, setSimilar] = useState<any[]>([]);
// ✅ LINE 38 (YAHAN ADD KARO)
const [discount, setDiscount] = useState(0);

// 🔥 NEW STATES
const [pincode, setPincode] = useState("");
const [deliveryInfo, setDeliveryInfo] = useState<any>(null);
const [checkingPin, setCheckingPin] = useState(false);

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
// 🔥 OFFER FETCH (LINE 72 PAR ADD KARO)
useEffect(() => {
const fetchOffer = async () => {
try {
const snap = await getDocs(collection(db, "offers"));

const offers = snap.docs  
    .map(d => ({ id: d.id, ...d.data() }))  
    .filter((o: any) =>  
      o.active &&  
      new Date(o.endDate).getTime() > Date.now()  
    );  

  const matched = offers.find((o: any) => {  

    if (o.type === "product" && o.productId === product?.id)  
      return true;  

    if (  
      o.type === "category" &&  
      o.category?.toLowerCase() === product?.category?.toLowerCase()  
    )  
      return true;  

    return false;  
  });  

  if (matched) {  
    setDiscount(Number(matched.discount || 0));  
  }  

} catch (err) {  
  console.log("Offer error", err);  
}

};

if (product) fetchOffer();
}, [product]);

// 🔥 AFFILIATE FIX
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

    console.log("✅ Affiliate saved:", ref);  
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

// 🚚 PINCODE CHECK
const checkPincode = async () => {
if (!pincode || pincode.length !== 6) {
return alert("Please enter a valid 6-digit PIN code.");
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
    setDeliveryInfo(null);  
    alert(  
      "We’re sorry, but delivery is not available at this PIN code. Please enter a different location."  
    );  
  }  
} catch (err) {  
  alert("Unable to verify PIN code at the moment. Please try again.");  
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
const finalPrice = Math.max(
1,
Math.round(price - (price * discount) / 100)
);

const stock = Number(selectedSize?.stock) || 0;

// 🛒 CART
const handleAddToCart = async () => {
if (!user) return router.push(`/login?redirect=/product/${id}`);
if (!selectedSize) return alert("Select size");

const basePrice =
selectedSize?.sellPrice ||
selectedSize?.price ||
product?.price ||
0;

await addDoc(collection(db, "carts", user.uid, "items"), {

productId: product.id,
name: product.name,
image: images?.[0] || "",
quantity: 1,
category: product.category,

price: basePrice, // 🔥 MAIN FIX

variations: [
{
...variant,
sizes: [selectedSize]
}
],

discount: discount || 0
});

// ✅ YAHI LIKHNA HAI (IMPORTANT)
toast.success("Added to cart 🛒");

// ✅ delay (warna dikhega nahi)
setTimeout(() => {
router.push("/cart");
}, 1200);
};

// ⚡ BUY (FIXED)
const handleBuyNow = async () => {
if (!user) return router.push(`/login?redirect=/product/${id}`);
if (!selectedSize) return alert("Select size");

const buyNowData = {
id: product.id,
productId: product.id, // 🔥 ADD THIS
name: product.name,
image: images?.[0] || "",
quantity: 1,

price: finalPrice, // 🔥 ADD THIS

category: product.category,

variations: [
{
...variant,
sizes: [selectedSize]
}
]
};

console.log("🔥 BUY NOW SAVE:", buyNowData);

localStorage.setItem("buy-now", JSON.stringify(buyNowData));

router.push("/checkout");
};

const handleShare = () => {
navigator.share?.({
title: product.name,
url: window.location.href,
});
};

const handleScroll = (e: any) => {
const index = Math.round(
e.target.scrollLeft / e.target.clientWidth
);
setCurrentImage(index);
};

return (
<div>
{/* IMAGE SLIDER */}
<div  
onScroll={handleScroll}  
className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth"  
>
{images.map((img: any, i: number) => (
<div key={i} className="min-w-full snap-center">
<img
src={img}
onClick={() => setShowViewer(true)}
className="w-full h-[320px] object-contain"
/>
</div>
))}
</div>

{/* ZOOM */}  
  {showViewer && (  
    <div className="fixed inset-0 bg-black z-50 flex flex-col">  
      <button  
        onClick={() => setShowViewer(false)}  
        className="text-white text-xl p-4"  
      >  
        ✕  
      </button>  

      <div className="flex-1 flex items-center justify-center">  
        <img  
          src={images[currentImage]}  
          className="max-w-full max-h-full"  
        />  
      </div>  
    </div>  
  )}  

  {/* SHARE */}  
  <button  
    onClick={handleShare}  
    className="absolute top-4 right-4 bg-white p-2 rounded-full shadow"  
  >  
    🔗  
  </button>  

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

  <div className="p-4">  
    {/* COLOR */}  
    <div className="flex gap-3 overflow-x-auto">  
      {product?.variations?.map((v: any, i: number) => (  
        <img  
          key={i}  
          src={v?.images?.main}  
          onClick={() => {  
            setSelectedColor(i);  
            setSelectedSize(v?.sizes?.[0] || null);  
          }}  
          className={`w-16 h-16 rounded-xl border ${  
            selectedColor === i ? "border-blue-600" : ""  
          }`}  
        />  
      ))}  
    </div>  

    <h1 className="text-xl font-bold mt-4">{product.name}</h1>  

    <div className="mt-2 text-3xl font-bold text-green-600">  
      ₹{finalPrice}  
    </div>
      {/* 🔥 STOCK */}
<div className="mt-2">

  {stock > 5 && (
    <p className="text-green-600 text-sm font-medium">
      In Stock ✅
    </p>
  )}

  {stock <= 5 && stock > 0 && (
    <p className="text-red-500 text-sm font-semibold animate-pulse">
      ⚡ Only {stock} left
    </p>
  )}

  {stock === 0 && (
    <p className="text-red-600 font-bold">
      Out of Stock ❌
    </p>
  )}

</div>

    {/* ⭐ TRUST LINE */}  
    <div className="mt-2 text-sm text-gray-600 font-medium">

🚚 Fast Delivery | 🔒 Secure Payment | 💵 COD Available (shipping charge)

</div>  {/* 🚚 PIN */}  
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

      {deliveryInfo && (  
        <div className="mt-3 text-green-600 text-sm font-medium">  
          Delivery to {deliveryInfo.place}, {deliveryInfo.state} in{" "}  
          {deliveryInfo.deliveryDays} -{" "}  
          {deliveryInfo.deliveryDays + 2} days  
        </div>  
      )}  
    </div>  

    {/* SIZE */}  
    <div className="mt-5">  
      <h3 className="font-semibold mb-3">Select Size</h3>  

      <div className="grid grid-cols-3 gap-3">  
        {variant?.sizes?.map((s: any, i: number) => (  
          <div  
            key={i}  
            onClick={() => setSelectedSize(s)}  
            className={`p-3 rounded-xl border text-center ${  
              selectedSize?.size === s.size  
                ? "bg-blue-600 text-white"  
                : "bg-white"  
            }`}  
          >  
            {s.size}  
          </div>  
        ))}  
      </div>  
    </div>  

    {/* DESCRIPTION */}  
    <div className="mt-4 bg-white/60 backdrop-blur p-4 rounded-2xl shadow">  
      {product.description || "Premium product"}  
    </div>  

    {/* ⭐ REVIEWS */}  
    <div className="mt-6">  
      <ReviewSection productId={product.id} />  
    </div>  

    {/* SIMILAR */}  
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
              ₹  
              {p?.variations?.[0]?.sizes?.[0]?.sellPrice || 0}  
            </p>  
          </div>  
        ))}  
      </div>  
    </div>  
  </div>  

  {/* BUTTONS */}  
  <div className="fixed bottom-0 left-0 w-full flex gap-3 p-3 bg-white border-t">  
    <button
  disabled={stock === 0}
  onClick={handleAddToCart}
  className={`w-1/2 py-3 rounded-xl font-semibold transition ${
    stock === 0
      ? "bg-gray-300 text-gray-500"
      : "border border-blue-600 text-blue-600 active:scale-95"
  }`}
>
  Add to Cart
</button>

<button
  disabled={stock === 0}
  onClick={handleBuyNow}
  className={`w-1/2 py-3 rounded-xl font-semibold transition ${
    stock === 0
      ? "bg-gray-400 text-white"
      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg active:scale-95"
  }`}
>
  {stock === 0 ? "Out of Stock ❌" : "Buy Now ⚡"}
</button>  
  </div>  
</div>

);
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";

export default function ProductPage() {

const params = useParams();
const router = useRouter();
const id = params?.id as string;
const { addToCart } = useCart();

const [product,setProduct] = useState<any>(null);
const [loading,setLoading] = useState(true);
const [quantity,setQuantity] = useState(1);
const [adding,setAdding] = useState(false);
const [showPopup,setShowPopup] = useState(false);

useEffect(()=>{

if(!id) return;

const fetchProduct = async()=>{

try{

const snap = await getDoc(doc(db,"products",id));

if(snap.exists()){
setProduct({id:snap.id,...snap.data()});
}else{
setProduct(null);
}

}catch(error){
console.log(error);
}

setLoading(false);

};

fetchProduct();

},[id]);

if(loading){
return(
<div className="min-h-screen flex items-center justify-center">
Loading...
</div>
);
}

if(!product){
return(
<div className="min-h-screen flex items-center justify-center">
Product not found ❌
</div>
);
}

const outOfStock = !product.stock || product.stock <= 0;

/* ========================
ADD TO CART
======================== */

const handleAddToCart = async()=>{

if(outOfStock) return;

setAdding(true);

await addToCart({
...product,
quantity
});

setShowPopup(true);

setTimeout(()=>{
router.push("/");
},500);

};

/* ========================
BUY NOW → CHECKOUT
======================== */

const buyNow = ()=>{

// productId checkout को भेजेंगे
router.push(`/checkout?productId=${product.id}`);

};

return(

<div className="min-h-screen p-6 pt-[100px] bg-gradient-to-b from-pink-100 to-white">

{/* IMAGE */}

{(product.image || product.imageUrl) && (

<img
src={product.image || product.imageUrl}
className="w-full h-80 object-cover rounded-xl"
/>

)}

{/* NAME */}

<h1 className="text-2xl font-bold mt-6">
{product.name}
</h1>

{/* PRICE */}

<p className="text-2xl font-bold mt-3">
₹{product.sellPrice || product.price}
</p>

{/* STOCK */}

<p className={`mt-2 font-semibold ${outOfStock ? "text-red-600" : "text-green-600"}`}>
{outOfStock ? "Out of Stock" : `In Stock (${product.stock})`}
</p>

{/* QUANTITY */}

{!outOfStock && (

<div className="flex items-center gap-4 mt-6">

<button
onClick={()=>setQuantity(q=>Math.max(1,q-1))}
className="bg-gray-200 px-4 py-2 rounded-lg"
>
-
</button>

<span className="text-lg font-bold">
{quantity}
</span>

<button
onClick={()=>setQuantity(q=>q < product.stock ? q+1 : q)}
className="bg-gray-200 px-4 py-2 rounded-lg"
>
+
</button>

</div>

)}

{/* DESCRIPTION */}

{product.description && (

<div className="mt-6 text-gray-700 whitespace-pre-line">
{product.description}
</div>

)}

{/* BUTTONS */}

<div className="flex gap-4 mt-8">

<button
disabled={outOfStock || adding}
onClick={handleAddToCart}
className={`px-6 py-3 rounded-xl w-full transition-all ${
outOfStock
? "bg-gray-400 cursor-not-allowed"
: adding
? "bg-gray-500"
: "bg-pink-600 text-white hover:bg-pink-700"
}`}
>

{adding ? "Adding..." : "Add to Cart"}

</button>

<button
disabled={outOfStock}
onClick={buyNow}
className={`px-6 py-3 rounded-xl w-full ${
outOfStock
? "bg-gray-400 cursor-not-allowed"
: "bg-black text-white"
}`}
>

Pay Now

</button>

</div>

{/* POPUP */}

{showPopup && (

<div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-5 py-3 rounded-lg shadow-lg">
Added to Cart ✅
</div>

)}

</div>

);

}

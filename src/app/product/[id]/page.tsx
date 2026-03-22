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

        if(data?.variations?.length){
          const v = data.variations[0];
          setSelectedSize(v?.sizes?.[0] || null);
        }
      }

      setLoading(false);
    };

    if(id) fetchProduct();
  },[id]);

  if(loading) return <div>Loading...</div>;
  if(!product) return <div>Not found</div>;

  const variant = product.variations[selectedColor];

  // ✅ FINAL PRICE FIX
  const price = (() => {

    if (selectedSize?.sellPrice && selectedSize.sellPrice > 0)
      return Number(selectedSize.sellPrice);

    if (selectedSize?.price && selectedSize.price > 0)
      return Number(selectedSize.price);

    if (variant?.sizes?.length) {
      const first = variant.sizes[0];

      if (first.sellPrice) return Number(first.sellPrice);
      if (first.price) return Number(first.price);
    }

    return 0;

  })();

  // ADD TO CART
  const handleAddToCart = async () => {

    if (!user) return router.push(`/login?redirect=/product/${id}`);
    if (!selectedSize) return alert("Select size");

    await addDoc(collection(db,"carts",user.uid,"items"),{
      productId: product.id,
      name: product.name,
      size: selectedSize.size,

      price: Number(selectedSize?.sellPrice || selectedSize?.price || 0),
      sellPrice: Number(selectedSize?.sellPrice || 0),

      quantity: 1,
      createdAt: new Date()
    });

    alert("Added to cart");
  };

  return (
    <div className="p-4">

      <h1>{product.name}</h1>

      <h2>₹{price}</h2>

      {/* SIZE */}
      {variant.sizes.map((s:any,i:number)=>(
        <button
          key={i}
          onClick={()=>setSelectedSize(s)}
        >
          {s.size} - ₹{s.sellPrice || s.price}
        </button>
      ))}

      <button onClick={handleAddToCart}>
        Add to Cart
      </button>

    </div>
  );
}

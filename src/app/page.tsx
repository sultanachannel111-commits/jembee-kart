"use client";

import Header from "@/components/home/Header";
import SearchBar from "@/components/home/SearchBar";
import BannerSlider from "@/components/home/BannerSlider";
import CategoryList from "@/components/home/CategoryList";
import ProductGrid from "@/components/home/ProductGrid";
import BottomNav from "@/components/home/BottomNav";
import FestivalBanner from "@/components/home/FestivalBanner";
import FlashSale from "@/components/home/FlashSale";

import { correctSearch } from "@/lib/typoCorrect";
import { getTrendingProducts } from "@/services/trendingService";
import { getClearanceProducts } from "@/services/clearanceService";
import { getRecommendedProducts } from "@/services/recommendService";
import { getLightningDeals } from "@/services/lightningService";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function HomePage() {

  const [theme,setTheme] = useState<any>({});
  const [categories,setCategories] = useState<any[]>([]);
  const [banners,setBanners] = useState<any[]>([]);
  const [products,setProducts] = useState<any[]>([]);

  const [festival,setFestival] = useState<any>(null);
  const [slide,setSlide] = useState(0);
  const [search,setSearch] = useState("");

  const [selectedCategory,setSelectedCategory] = useState("All");
  const [ratings,setRatings] = useState<any>({});
  const [timeLeft,setTimeLeft] = useState<any>(null);

  const [trending,setTrending] = useState<any[]>([]);
  const [clearance,setClearance] = useState<any[]>([]);
  const [recommended,setRecommended] = useState<any[]>([]);
  const [lightning,setLightning] = useState<any[]>([]);

  const trendingSearch = [
    "black tshirt","oversize tshirt","hoodie","anime tshirt","couple tshirt"
  ];

  // 🔥 FINAL PRICE FIX FUNCTION
  const getPrice = (data:any)=>{

    // 1. variation → size → sellPrice (MAIN)
    if (data?.variations?.length) {
      const v = data.variations[0];

      if (v?.sizes?.length) {
        const s = v.sizes[0];

        if (s?.sellPrice && s.sellPrice > 0) return Number(s.sellPrice);
        if (s?.price && s.price > 0) return Number(s.price);
      }
    }

    // 2. fallback
    if (data?.sellPrice && data.sellPrice > 0) return Number(data.sellPrice);
    if (data?.price && data.price > 0) return Number(data.price);

    return 0;
  };

  // 🔥 LOAD DATA
  useEffect(()=>{
    loadData();
  },[]);

  const loadData = async()=>{

    // CATEGORY
    const catSnap = await getDocs(collection(db,"qikinkCategories"));
    setCategories([
      { id:"all",name:"All",image:"https://cdn-icons-png.flaticon.com/512/3081/3081559.png"},
      ...catSnap.docs.map(d=>({id:d.id,...d.data()}))
    ]);

    // BANNERS
    const bannerSnap = await getDocs(collection(db,"banners"));
    setBanners(bannerSnap.docs.map(d=>({id:d.id,...d.data()})));

    // PRODUCTS
    const productSnap = await getDocs(collection(db,"products"));

    const productsData = productSnap.docs.map(d=>{
      const data = d.data();

      return {
        id:d.id,
        ...data,
        price:getPrice(data)   // 🔥 FIXED
      };
    });

    setProducts(productsData);

    // EXTRA SECTIONS
    setTrending(await getTrendingProducts());
    setClearance(await getClearanceProducts());
    setRecommended(await getRecommendedProducts());
    setLightning(await getLightningDeals());

    // FESTIVAL
    const festSnap = await getDoc(doc(db,"settings","festival"));
    if(festSnap.exists()) setFestival(festSnap.data());
  };

  // 🔥 THEME
  useEffect(()=>{
    const loadTheme = async()=>{
      const snap = await getDoc(doc(db,"settings","theme"));
      if(snap.exists()) setTheme(snap.data());
    };
    loadTheme();
  },[]);

  // 🔥 SEARCH
  const normalize = (text:string)=>
    text?.toLowerCase().replace(/\s|-/g,"");

  const fixedSearch = correctSearch(search);

  const filteredProducts = products.filter(p=>{
    const matchSearch = normalize(p.name).includes(normalize(fixedSearch));
    const matchCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // 🔥 SLIDER AUTO
  useEffect(()=>{
    if(!banners.length) return;
    const interval = setInterval(()=>{
      setSlide(prev=>(prev+1)%banners.length);
    },3000);
    return ()=>clearInterval(interval);
  },[banners]);

  return(

<div
  style={{
    background: theme?.gradient
      ? `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`
      : "#ffffff"
  }}
  className="min-h-screen pb-[80px]"
>

<Header theme={theme}/>

<div className="pt-[80px] px-4 space-y-4">

<SearchBar search={search} setSearch={setSearch}/>

{/* 🔥 TRENDING */}
{!search && (
<div className="bg-white rounded-xl shadow p-3">
<p className="text-sm font-semibold mb-2">🔥 Trending</p>
<div className="flex flex-wrap gap-2">
{trendingSearch.map(item=>(
<button
key={item}
onClick={()=>setSearch(item)}
className="px-3 py-1 bg-gray-100 rounded-full text-xs"
>
{item}
</button>
))}
</div>
</div>
)}

{/* CATEGORY */}
<div className="overflow-x-auto no-scrollbar">
<CategoryList
categories={categories}
selectedCategory={selectedCategory}
setSelectedCategory={setSelectedCategory}
/>
</div>

<BannerSlider banners={banners} slide={slide}/>

<FlashSale/>

{festival?.active && (
<FestivalBanner festival={festival} timeLeft={timeLeft}/>
)}

{/* 🔥 MAIN PRODUCTS */}
<ProductGrid products={filteredProducts}/>

{/* 🔥 EXTRA SECTIONS */}
<ProductGrid title="⚡ Lightning Deals" products={lightning}/>
<ProductGrid title="🔥 Trending" products={trending}/>
<ProductGrid title="⚡ Clearance" products={clearance}/>
<ProductGrid title="⭐ Recommended" products={recommended}/>

</div>

<BottomNav/>

</div>

);
}

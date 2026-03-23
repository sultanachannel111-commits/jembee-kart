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
import {
  collection,
  getDocs,
  doc,
  getDoc,
  onSnapshot
} from "firebase/firestore";
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
  const [timeLeft,setTimeLeft] = useState<any>(null);

  const [trending,setTrending] = useState<any[]>([]);
  const [clearance,setClearance] = useState<any[]>([]);
  const [recommended,setRecommended] = useState<any[]>([]);
  const [lightning,setLightning] = useState<any[]>([]);

  // 🔥 PRICE FIX
  const getPrice = (data:any)=>{
    if (data?.variations?.length) {
      const v = data.variations[0];
      if (v?.sizes?.length) {
        const s = v.sizes[0];
        if (s?.sellPrice) return Number(s.sellPrice);
        if (s?.price) return Number(s.price);
      }
    }
    return data?.price || 0;
  };

  // 🚀 LOAD CACHE FIRST (INSTANT OPEN)
  useEffect(()=>{
    const cached = localStorage.getItem("HOME_CACHE");

    if(cached){
      const data = JSON.parse(cached);

      setProducts(data.products || []);
      setCategories(data.categories || []);
      setBanners(data.banners || []);
      setTheme(data.theme || {});
    }

    loadData(); // background fetch

  },[]);

  // 🔥 LOAD DATA FROM FIREBASE
  const loadData = async()=>{
    try{

      const [
        catSnap,
        bannerSnap,
        productSnap,
        festSnap,
        themeSnap
      ] = await Promise.all([
        getDocs(collection(db,"qikinkCategories")),
        getDocs(collection(db,"banners")),
        getDocs(collection(db,"products")),
        getDoc(doc(db,"settings","festival")),
        getDoc(doc(db,"settings","theme"))
      ]);

      const categoryData = [
        { id:"all",name:"All",image:"https://cdn-icons-png.flaticon.com/512/3081/3081559.png"},
        ...catSnap.docs.map(d=>({id:d.id,...d.data()}))
      ];

      const bannerData = bannerSnap.docs.map(d=>({
        id:d.id,
        ...d.data()
      }));

      const productsData = productSnap.docs.map(d=>{
        const data = d.data();
        return {
          id:d.id,
          ...data,
          price:getPrice(data)
        };
      });

      const themeData = themeSnap.exists() ? themeSnap.data() : {};

      // ✅ UPDATE UI
      setCategories(categoryData);
      setBanners(bannerData);
      setProducts(productsData);
      setTheme(themeData);

      if(festSnap.exists()) setFestival(festSnap.data());

      // 🔥 CACHE SAVE
      localStorage.setItem("HOME_CACHE", JSON.stringify({
        categories: categoryData,
        banners: bannerData,
        products: productsData,
        theme: themeData
      }));

      console.log("✅ CACHE UPDATED");

      // 🔥 OTHER DATA
      setTrending(await getTrendingProducts());
      setClearance(await getClearanceProducts());
      setRecommended(await getRecommendedProducts());
      setLightning(await getLightningDeals());

    }catch(err){
      console.log("❌ ERROR:",err);
    }
  };

  // 🔥 REALTIME THEME (AUTO UPDATE)
  useEffect(()=>{
    const unsub = onSnapshot(doc(db,"settings","theme"),(snap)=>{
      if(snap.exists()){
        const data = snap.data();
        setTheme(data);

        // 🔥 update cache theme
        const cached = localStorage.getItem("HOME_CACHE");
        if(cached){
          const parsed = JSON.parse(cached);
          parsed.theme = data;
          localStorage.setItem("HOME_CACHE", JSON.stringify(parsed));
        }
      }
    });

    return ()=>unsub();
  },[]);

  // 🔥 SEARCH
  const normalize = (text:string)=>
    text?.toLowerCase().replace(/\s|-/g,"");

  const filteredProducts = products.filter(p=>{
    const matchSearch = normalize(p.name).includes(normalize(search));
    const matchCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // 🔥 BACKGROUND STYLE
  const backgroundStyle = theme?.gradient
    ? `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`
    : theme?.background || "#ffffff";

  return(

<div
  style={{ background: backgroundStyle }}
  className="min-h-screen pb-[80px]"
>

<Header theme={theme}/>

<div className="pt-[80px] px-4 space-y-4">

<SearchBar search={search} setSearch={setSearch}/>

{/* 🔥 TRENDING */}
<div
  style={{ background: theme?.card || "#fff" }}
  className="rounded-xl shadow p-3"
>
<p className="text-sm font-semibold mb-2">🔥 Trending</p>

<div className="flex flex-wrap gap-2">
{["black tshirt","oversize tshirt","hoodie"].map(item=>(
<button
key={item}
style={{ background: theme?.button || "#eee" }}
className="px-3 py-1 rounded-full text-xs"
>
{item}
</button>
))}
</div>

</div>

{/* CATEGORY */}
<div className="overflow-x-auto">
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

<ProductGrid products={filteredProducts}/>
<ProductGrid title="⚡ Lightning Deals" products={lightning}/>
<ProductGrid title="🔥 Trending" products={trending}/>
<ProductGrid title="⚡ Clearance" products={clearance}/>
<ProductGrid title="⭐ Recommended" products={recommended}/>

</div>

<BottomNav/>

</div>

);
}

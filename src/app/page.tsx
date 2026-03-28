"use client";

import Header from "@/components/home/Header";
import SearchBar from "@/components/home/SearchBar";
import BannerSlider from "@/components/home/BannerSlider";
import CategoryList from "@/components/home/CategoryList";
import ProductGrid from "@/components/home/ProductGrid";
import BottomNav from "@/components/home/BottomNav";
import FestivalBanner from "@/components/home/FestivalBanner";
import FlashSale from "@/components/home/FlashSale";
import useTheme from "@/hooks/useTheme";

import { getTrendingProducts } from "@/services/trendingService";
import { getClearanceProducts } from "@/services/clearanceService";
import { getRecommendedProducts } from "@/services/recommendService";
import { getLightningDeals } from "@/services/lightningService";

import { useEffect, useState } from "react";

export default function HomePage() {

  const theme = useTheme();

  const [categories,setCategories] = useState<any[]>([]);
  const [banners,setBanners] = useState<any[]>([]);
  const [products,setProducts] = useState<any[]>([]);
  const [festival,setFestival] = useState<any>(null);

  const [search,setSearch] = useState("");
  const [selectedCategory,setSelectedCategory] = useState("All");

  const [trending,setTrending] = useState<any[]>([]);
  const [clearance,setClearance] = useState<any[]>([]);
  const [recommended,setRecommended] = useState<any[]>([]);
  const [lightning,setLightning] = useState<any[]>([]);

  // 🚀 INSTANT LOAD (LOCAL CACHE FIRST)
  useEffect(()=>{

    const saved = localStorage.getItem("home-cache");

    if(saved){
      const data = JSON.parse(saved);

      setCategories(data.categories || []);
      setBanners(data.banners || []);
      setProducts(data.products || []);
      setFestival(data.festival || null);
    }

    // 🌍 BACKGROUND FETCH
    loadData();

  },[]);

  const loadData = async()=>{
    try{
      const res = await fetch("/api/home");
      const data = await res.json();

      setCategories(data.categories || []);
      setBanners(data.banners || []);
      setProducts(data.products || []);
      setFestival(data.festival || null);

      // 💾 SAVE CACHE
      localStorage.setItem("home-cache", JSON.stringify(data));

      console.log("⚡ Fresh data loaded");

      // 🔥 EXTRA SERVICES (parallel)
      const [t,c,r,l] = await Promise.all([
        getTrendingProducts(),
        getClearanceProducts(),
        getRecommendedProducts(),
        getLightningDeals()
      ]);

      setTrending(t);
      setClearance(c);
      setRecommended(r);
      setLightning(l);
      // 🔥 FETCH OFFERS
const offerSnap = await getDocs(collection(db, "offers"));

const offerMap:any = {};

offerSnap.forEach(doc => {
  const data = doc.data();
  offerMap[data.productId] = data.discount;
});

setOffers(offerMap);

console.log("🔥 offers:", offerMap);
    }catch(err){
      console.log("❌ LOAD ERROR",err);
    }
  };

  // 🔍 SEARCH
  const normalize = (text:string)=>
    text?.toLowerCase().replace(/\s|-/g,"");

  const filteredProducts = products.filter(p=>{
    const matchSearch = normalize(p.name).includes(normalize(search));
    const matchCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // 🎨 BACKGROUND (NO FLASH)
  const backgroundStyle = theme?.gradient
    ? `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`
    : theme?.background || "#0f172a"; // dark fallback (premium feel)

  return(
    <div
      style={{ background: backgroundStyle }}
      className="min-h-screen pb-[80px] transition-all duration-300"
    >

      {/* 🔥 HEADER */}
      <Header theme={theme}/>

      <div className="pt-[80px] px-4 space-y-4">

        {/* 🔍 SEARCH */}
        <div
          style={{
            background: theme?.searchBg || "#ffffff10",
            color: theme?.searchText || "#fff",
            borderColor: theme?.searchBorder || "#ffffff20"
          }}
          className="rounded-xl p-2 border backdrop-blur-md"
        >
          <SearchBar search={search} setSearch={setSearch}/>
        </div>

        {/* 🔥 TRENDING */}
        <div
          style={{
            background: theme?.trendingBg || "#ffffff10",
            color: theme?.trendingText || "#fff"
          }}
          className="rounded-xl shadow p-3 backdrop-blur-md"
        >
          <p className="text-sm font-semibold mb-2">🔥 Trending</p>

          <div className="flex flex-wrap gap-2">
            {["black tshirt","oversize tshirt","hoodie"].map(item=>(
              <button
                key={item}
                style={{
                  background: theme?.trendingChipBg || "#ffffff20",
                  color: theme?.trendingChipText || "#fff"
                }}
                className="px-3 py-1 rounded-full text-xs backdrop-blur-md"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* CATEGORY */}
        <CategoryList
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {/* BANNER */}
        {/* 🔥 BANNER */}
{Array.isArray(banners) && banners.length > 0 && (
  <BannerSlider banners={banners} />
)}

        {/* FLASH */}
        <FlashSale/>

        {festival?.active && (
          <FestivalBanner festival={festival}/>
        )}

        {/* PRODUCTS */}
        <ProductGrid title="⚡ Lightning Deals"
  products={lightning.map(p=>{
    const d = offers[p.id] || 0;
    return {
      ...p,
      originalPrice:p.price,
      price: Math.round(p.price - (p.price*d)/100),
      discountPercent:d
    };
  })}
  theme={theme}
/>

<ProductGrid title="🔥 Trending"
  products={trending.map(p=>{
    const d = offers[p.id] || 0;
    return {
      ...p,
      originalPrice:p.price,
      price: Math.round(p.price - (p.price*d)/100),
      discountPercent:d
    };
  })}
  theme={theme}
/>

<ProductGrid title="⚡ Clearance"
  products={clearance.map(p=>{
    const d = offers[p.id] || 0;
    return {
      ...p,
      originalPrice:p.price,
      price: Math.round(p.price - (p.price*d)/100),
      discountPercent:d
    };
  })}
  theme={theme}
/>

<ProductGrid title="⭐ Recommended"
  products={recommended.map(p=>{
    const d = offers[p.id] || 0;
    return {
      ...p,
      originalPrice:p.price,
      price: Math.round(p.price - (p.price*d)/100),
      discountPercent:d
    };
  })}
  theme={theme}
/>

      </div>

      {/* 🔥 BOTTOM NAV */}
      <BottomNav theme={theme}/>

    </div>
  );
}

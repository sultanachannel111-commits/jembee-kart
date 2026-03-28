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

  const [loading,setLoading] = useState(true);

  // 🚀 CACHE + FETCH
  useEffect(()=>{

    const saved = localStorage.getItem("home-cache");

    if(saved){
      const data = JSON.parse(saved);

      setCategories(data.categories || []);
      setBanners(data.banners || []);
      setProducts(data.products || []);
      setFestival(data.festival || null);
    }

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

      localStorage.setItem("home-cache", JSON.stringify(data));

      // 🔥 EXTRA SERVICES
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

      setLoading(false);

    }catch(err){
      console.log("❌ LOAD ERROR",err);
      setLoading(false);
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

  // 🎨 BG
  const backgroundStyle = theme?.gradient
    ? `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`
    : theme?.background || "#0f172a";

  return(
    <div
      style={{ background: backgroundStyle }}
      className="min-h-screen pb-[80px] transition-all duration-300"
    >

      <Header theme={theme}/>

      <div className="pt-[80px] px-4 space-y-4">

        {/* SEARCH */}
        <div className="rounded-xl p-2 border backdrop-blur-md">
          <SearchBar search={search} setSearch={setSearch}/>
        </div>

        {/* 🔥 TRENDING CLICKABLE */}
        <div className="rounded-xl shadow p-3 backdrop-blur-md">
          <p className="text-sm font-semibold mb-2">🔥 Trending</p>

          <div className="flex flex-wrap gap-2">
            {["black tshirt","oversize tshirt","hoodie"].map(item=>(
              <button
                key={item}
                onClick={()=>setSearch(item)}
                className="px-3 py-1 rounded-full text-xs bg-white/20 hover:bg-white/30 transition"
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

        {/* ✅ FIXED BANNER */}
        {Array.isArray(banners) && banners.length > 0 && (
          <BannerSlider banners={banners} />
        )}

        {/* FLASH */}
        <FlashSale/>

        {/* FESTIVAL */}
        {festival?.active && (
          <FestivalBanner festival={festival}/>
        )}

        {/* 🔥 LOADING SKELETON */}
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i=>(
              <div key={i} className="h-40 bg-white/10 animate-pulse rounded-xl"/>
            ))}
          </div>
        ) : (
          <>
            <ProductGrid products={filteredProducts} theme={theme}/>
            <ProductGrid title="⚡ Lightning Deals" products={lightning} theme={theme}/>
            <ProductGrid title="🔥 Trending" products={trending} theme={theme}/>
            <ProductGrid title="⚡ Clearance" products={clearance} theme={theme}/>
            <ProductGrid title="⭐ Recommended" products={recommended} theme={theme}/>
          </>
        )}

      </div>

      <BottomNav theme={theme}/>

    </div>
  );
}

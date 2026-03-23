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

  // 🔥 LOAD DATA FROM API (GLOBAL CACHE)
  useEffect(()=>{
    loadData();
  },[]);

  const loadData = async()=>{
    try{

      const res = await fetch("/api/home");
      const data = await res.json();

      setCategories(data.categories || []);
      setBanners(data.banners || []);
      setProducts(data.products || []);
      setTheme(data.theme || {});

      console.log("⚡ Loaded from global cache");

      // 🔥 services (same)
      setTrending(await getTrendingProducts());
      setClearance(await getClearanceProducts());
      setRecommended(await getRecommendedProducts());
      setLightning(await getLightningDeals());

    }catch(err){
      console.log("❌ ERROR:",err);
    }
  };

  // 🔥 SEARCH
  const normalize = (text:string)=>
    text?.toLowerCase().replace(/\s|-/g,"");

  const filteredProducts = products.filter(p=>{
    const matchSearch = normalize(p.name).includes(normalize(search));
    const matchCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  // 🔥 BACKGROUND
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

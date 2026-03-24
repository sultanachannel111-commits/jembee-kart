"use client";

import Header from "@/components/home/Header";
import SearchBar from "@/components/home/SearchBar";
import BannerSlider from "@/components/home/BannerSlider";
import CategoryList from "@/components/home/CategoryList";
import ProductGrid from "@/components/home/ProductGrid";
import BottomNav from "@/components/home/BottomNav";
import FestivalBanner from "@/components/home/FestivalBanner";
import FlashSale from "@/components/home/FlashSale";

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

  const [trending,setTrending] = useState<any[]>([]);
  const [clearance,setClearance] = useState<any[]>([]);
  const [recommended,setRecommended] = useState<any[]>([]);
  const [lightning,setLightning] = useState<any[]>([]);

  // 🔥 LOAD DATA
  useEffect(()=>{
    loadData();
  },[]);

  const loadData = async()=>{
    const res = await fetch("/api/home");
    const data = await res.json();

    setCategories(data.categories || []);
    setBanners(data.banners || []);
    setProducts(data.products || []);
    setTheme(data.theme || {});

    setTrending(await getTrendingProducts());
    setClearance(await getClearanceProducts());
    setRecommended(await getRecommendedProducts());
    setLightning(await getLightningDeals());
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
    : theme?.background || "#f9fafb";

  return(
    <div
      style={{ background: backgroundStyle }}
      className="min-h-screen pb-[80px]"
    >

      {/* 🔥 HEADER */}
      <Header theme={theme}/>

      <div className="pt-[80px] px-4 space-y-4">

        {/* 🔍 SEARCH */}
        <div
          style={{
            background: theme?.searchBg || "#fff",
            color: theme?.searchText || "#000",
            borderColor: theme?.searchBorder || "#ddd"
          }}
          className="rounded-xl p-2 border"
        >
          <SearchBar search={search} setSearch={setSearch}/>
        </div>

        {/* 🔥 TRENDING */}
        <div
          style={{
            background: theme?.trendingBg || theme?.card || "#fff",
            color: theme?.trendingText || "#000"
          }}
          className="rounded-xl shadow p-3"
        >
          <p className="text-sm font-semibold mb-2">🔥 Trending</p>

          <div className="flex flex-wrap gap-2">
            {["black tshirt","oversize tshirt","hoodie"].map(item=>(
              <button
                key={item}
                style={{
                  background: theme?.trendingChipBg || theme?.button || "#eee",
                  color: theme?.trendingChipText || "#000"
                }}
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

        {/* BANNER */}
        <BannerSlider banners={banners} slide={slide}/>

        {/* FLASH */}
        <FlashSale/>

        {festival?.active && (
          <FestivalBanner festival={festival}/>
        )}

        {/* PRODUCTS */}
        <ProductGrid
          products={filteredProducts}
          theme={theme}
        />

        <ProductGrid title="⚡ Lightning Deals" products={lightning} theme={theme}/>
        <ProductGrid title="🔥 Trending" products={trending} theme={theme}/>
        <ProductGrid title="⚡ Clearance" products={clearance} theme={theme}/>
        <ProductGrid title="⭐ Recommended" products={recommended} theme={theme}/>

      </div>

      {/* 🔥 BOTTOM NAV */}
      <BottomNav theme={theme}/>

      {/* 🔥 FLOAT BUTTON */}
      <div
        style={{
          background: theme?.fabBg || "#22c55e",
          boxShadow: `0 0 20px ${theme?.fabGlow || "#22c55e"}`
        }}
        className="fixed bottom-20 right-4 w-14 h-14 rounded-full flex items-center justify-center text-white text-xl"
      >
        💬
      </div>

    </div>
  );
}

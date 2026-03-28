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

  if (data?.active && data?.productId) {
    offerMap[data.productId] = data.discount || 0;
  }
});

setOffers(offerMap);

console.log("🔥 offers:", offerMap);
    }catch(err){
      console.log("❌ LOAD ERROR",err);
    }
  };
{/* 🔍 SEARCH */}
<div
  style={{
    background: theme?.searchBg || "#ffffff10",
    color: theme?.searchText || "#fff",
    borderColor: theme?.searchBorder || "#ffffff20"
  }}
  className="rounded-xl p-2 border backdrop-blur-md"
>
  <SearchBar search={search} setSearch={setSearch} />
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
    {["black tshirt", "oversize tshirt", "hoodie"].map((item) => (
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

{/* 📦 CATEGORY (SAFE) */}
{Array.isArray(categories) && (
  <CategoryList
    categories={categories}
    selectedCategory={selectedCategory}
    setSelectedCategory={setSelectedCategory}
  />
)}

{/* 🖼️ BANNER (FIXED) */}
{Array.isArray(banners) && banners.length > 0 && (
  <BannerSlider banners={banners} />
)}

{/* ⚡ FLASH (SAFE) */}
{typeof FlashSale === "function" && <FlashSale />}

{/* 🎉 FESTIVAL (SAFE) */}
{festival?.active && (
  <FestivalBanner festival={festival} />
)}
  
{/* PRODUCTS */}

{Array.isArray(lightning) && lightning.length > 0 && (
  <ProductGrid
    title="⚡ Lightning Deals"
    products={lightning.map((p) => {
      const productId = p?.id || p?._id || "";
      const d = offers?.[productId] || 0;
      const price = Number(p?.price) || 0;

      return {
        ...p,
        id: productId,
        originalPrice: price,
        price: Math.max(0, Math.round(price - (price * d) / 100)),
        discountPercent: d,
      };
    })}
    theme={theme}
  />
)}

{Array.isArray(trending) && trending.length > 0 && (
  <ProductGrid
    title="🔥 Trending"
    products={trending.map((p) => {
      const productId = p?.id || p?._id || "";
      const d = offers?.[productId] || 0;
      const price = Number(p?.price) || 0;

      return {
        ...p,
        id: productId,
        originalPrice: price,
        price: Math.max(0, Math.round(price - (price * d) / 100)),
        discountPercent: d,
      };
    })}
    theme={theme}
  />
)}

{Array.isArray(clearance) && clearance.length > 0 && (
  <ProductGrid
    title="⚡ Clearance"
    products={clearance.map((p) => {
      const productId = p?.id || p?._id || "";
      const d = offers?.[productId] || 0;
      const price = Number(p?.price) || 0;

      return {
        ...p,
        id: productId,
        originalPrice: price,
        price: Math.max(0, Math.round(price - (price * d) / 100)),
        discountPercent: d,
      };
    })}
    theme={theme}
  />
)}

{Array.isArray(recommended) && recommended.length > 0 && (
  <ProductGrid
    title="⭐ Recommended"
    products={recommended.map((p) => {
      const productId = p?.id || p?._id || "";
      const d = offers?.[productId] || 0;
      const price = Number(p?.price) || 0;

      return {
        ...p,
        id: productId,
        originalPrice: price,
        price: Math.max(0, Math.round(price - (price * d) / 100)),
        discountPercent: d,
      };
    })}
    theme={theme}
  />
)}

</div>

{/* 🔥 BOTTOM NAV */}
<BottomNav theme={theme} />

</div>
);
}

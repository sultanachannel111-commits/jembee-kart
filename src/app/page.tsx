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

import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
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
  const [offers, setOffers] = useState<any>({});

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

      // 🔥 FETCH OFFERS (FIXED WITHOUT BREAKING FLOW)
      const offerSnap = await getDocs(collection(db, "offers"));

      const offerMap:any = {};

      offerSnap.forEach(doc => {
        const data:any = doc.data();

        console.log("🧪 OFFER CHECK:", data);

        let isValid = true;

        // ❌ inactive check
        if (data.active === false) {
          isValid = false;
        }

        // ❌ expiry check (safe for both string + timestamp)
        if (data.endDate) {
          let endTime;

          if (data.endDate?.seconds) {
            // firestore timestamp
            endTime = data.endDate.toDate().getTime();
          } else {
            // string date
            endTime = new Date(data.endDate).getTime();
          }

          if (endTime < Date.now()) {
            isValid = false;
          }
        }

        // ✅ only valid offer
        if (isValid) {
          offerMap[data.productId] = data.discount;
        }

      });

      setOffers(offerMap);

      console.log("🔥 FINAL OFFERS:", offerMap);

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

  // 🎨 BACKGROUND
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

        <CategoryList
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {Array.isArray(banners) && banners.length > 0 && (
          <BannerSlider banners={banners} />
        )}

        <FlashSale/>

        {festival?.active && (
          <FestivalBanner festival={festival}/>
        )}

        {/* ✅ OFFERS FIX APPLIED */}
        <ProductGrid products={filteredProducts} theme={theme} offers={offers}/>
        <ProductGrid title="⚡ Lightning Deals" products={lightning} theme={theme} offers={offers}/>
        <ProductGrid title="🔥 Trending" products={trending} theme={theme} offers={offers}/>
        <ProductGrid title="⚡ Clearance" products={clearance} theme={theme} offers={offers}/>
        <ProductGrid title="⭐ Recommended" products={recommended} theme={theme} offers={offers}/>

      </div>

      <BottomNav theme={theme}/>

    </div>
  );
}

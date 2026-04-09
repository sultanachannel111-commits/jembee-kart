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

  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [festival, setFestival] = useState<any>(null);

  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [trending, setTrending] = useState<any[]>([]);
  const [clearance, setClearance] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [lightning, setLightning] = useState<any[]>([]);
  const [offers, setOffers] = useState<any>({});

  useEffect(() => {
    const saved = localStorage.getItem("home-cache");
    if (saved) {
      const data = JSON.parse(saved);
      setCategories(data.categories || []);
      setBanners(data.banners || []);
      setProducts(data.products || []);
      setFestival(data.festival || null);
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const res = await fetch("/api/home");
      const data = await res.json();

      setCategories(data.categories || []);
      setBanners(data.banners || []);
      setProducts(data.products || []);
      setFestival(data.festival || null);

      localStorage.setItem("home-cache", JSON.stringify(data));

      const offerSnap = await getDocs(collection(db, "offers"));
      const offerMap: any = {};

      offerSnap.forEach((doc) => {
        const data: any = doc.data();
        let isValid = true;
        if (data.active === false) isValid = false;
        if (data.endDate) {
          let endTime = data.endDate?.seconds
            ? data.endDate.toDate().getTime()
            : new Date(data.endDate).getTime();
          if (endTime < Date.now()) isValid = false;
        }
        if (isValid) offerMap[data.productId] = data.discount;
      });

      setOffers(offerMap);

      const [t, c, r, l] = await Promise.all([
        getTrendingProducts(),
        getClearanceProducts(),
        getRecommendedProducts(),
        getLightningDeals(),
      ]);

      setTrending(t);
      setClearance(c);
      setRecommended(r);
      setLightning(l);
    } catch (err) {
      console.log("❌ LOAD ERROR", err);
    }
  };

  const normalize = (text: string) => text?.toLowerCase().replace(/\s|-/g, "");

  const filteredProducts = products.filter((p) => {
    const matchSearch = normalize(p.name).includes(normalize(search));
    const matchCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const backgroundStyle = theme?.gradient
    ? `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`
    : theme?.background || "#0f172a";

  return (
    <div
      style={{ background: backgroundStyle }}
      className="min-h-screen relative transition-all duration-500 overflow-x-hidden"
    >
      <Header theme={theme} />

      {/* Main Content Area */}
      <div className="pt-[90px] px-4 space-y-6 pb-28 relative z-10">
        
        {/* Updated Search Bar Wrapper */}
        <div
          style={{
            background: theme?.searchBg || "rgba(255, 255, 255, 0.1)",
            borderColor: theme?.searchBorder || "rgba(255, 255, 255, 0.15)"
          }}
          className="rounded-[22px] p-1 border backdrop-blur-2xl shadow-xl overflow-hidden"
        >
          <SearchBar search={search} setSearch={setSearch} />
        </div>

        {/* Trending Tags */}
        <div
          style={{
            background: theme?.trendingBg || "rgba(255, 255, 255, 0.08)",
            color: theme?.trendingText || "#fff",
          }}
          className="rounded-3xl shadow-lg p-5 backdrop-blur-xl border border-white/10"
        >
          <p className="text-[10px] font-black mb-3 uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
            <span className="text-base animate-bounce">🔥</span> Trending Now
          </p>
          <div className="flex flex-wrap gap-2">
            {["black tshirt", "oversize tshirt", "hoodie"].map((item) => (
              <button
                key={item}
                style={{
                  background: theme?.trendingChipBg || "rgba(255, 255, 255, 0.12)",
                  color: theme?.trendingChipText || "#fff",
                }}
                className="px-4 py-1.5 rounded-xl text-[11px] font-bold backdrop-blur-md border border-white/5 active:scale-90 transition-all duration-200"
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
          <div className="rounded-[32px] overflow-hidden shadow-2xl border border-white/10 mx-1">
            <BannerSlider banners={banners} />
          </div>
        )}

        <FlashSale />

        {festival?.active && (
          <div className="animate-pulse">
            <FestivalBanner festival={festival} />
          </div>
        )}

        {/* Product Sections */}
        <div className="space-y-12">
          <ProductGrid products={filteredProducts} theme={theme} offers={offers} />
          <ProductGrid title="⚡ Lightning Deals" products={lightning} theme={theme} offers={offers} />
          <ProductGrid title="🔥 Trending" products={trending} theme={theme} offers={offers} />
          <div className="bg-white/5 p-4 rounded-[40px] border border-white/5 shadow-inner">
             <ProductGrid title="⚡ Clearance" products={clearance} theme={theme} offers={offers} />
          </div>
          <ProductGrid title="⭐ Recommended" products={recommended} theme={theme} offers={offers} />
        </div>
      </div>

      {/* FIXED BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 w-full z-50 px-2 pb-2">
         <div className="bg-white/10 backdrop-blur-3xl rounded-[30px] border border-white/10 shadow-2xl">
            <BottomNav theme={theme} />
         </div>
      </div>
    </div>
  );
}

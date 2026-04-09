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

  // 🚀 INSTANT LOAD
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
      className="min-h-screen pb-[100px] transition-all duration-500 ease-in-out"
    >
      <Header theme={theme} />

      {/* Main Container with subtle glass overlay for depth */}
      <div className="pt-[90px] px-4 space-y-6 relative z-10">
        
        {/* PREMIUM SEARCH GLASS BOX */}
        <div
          style={{
            background: theme?.searchBg || "rgba(255, 255, 255, 0.08)",
            color: theme?.searchText || "#fff",
            borderColor: theme?.searchBorder || "rgba(255, 255, 255, 0.15)",
          }}
          className="rounded-2xl p-1 border backdrop-blur-xl shadow-2xl transition-transform active:scale-[0.98]"
        >
          <SearchBar search={search} setSearch={setSearch} />
        </div>

        {/* TRENDING CHIPS GLASS BOX */}
        <div
          style={{
            background: theme?.trendingBg || "rgba(255, 255, 255, 0.05)",
            color: theme?.trendingText || "#fff",
          }}
          className="rounded-2xl shadow-lg p-4 backdrop-blur-lg border border-white/10"
        >
          <div className="flex items-center gap-2 mb-3">
             <span className="animate-pulse text-lg">🔥</span>
             <p className="text-sm font-bold tracking-wide uppercase opacity-90">Trending Now</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {["black tshirt", "oversize tshirt", "hoodie"].map((item) => (
              <button
                key={item}
                style={{
                  background: theme?.trendingChipBg || "rgba(255, 255, 255, 0.12)",
                  color: theme?.trendingChipText || "#fff",
                }}
                className="px-4 py-1.5 rounded-xl text-[11px] font-medium border border-white/5 backdrop-blur-md hover:bg-white/20 transition-all active:scale-90 shadow-sm"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* CATEGORY LIST SECTION */}
        <div className="relative py-2">
           <CategoryList
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
          />
        </div>

        {/* BANNER SECTION WITH RADIUS */}
        {Array.isArray(banners) && banners.length > 0 && (
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-white/10">
            <BannerSlider banners={banners} />
          </div>
        )}

        {/* FLASH SALE GLASS BOX */}
        <div className="relative overflow-hidden rounded-3xl">
           <FlashSale />
        </div>

        {/* FESTIVAL BANNER */}
        {festival?.active && (
          <div className="animate-in fade-in zoom-in duration-500">
            <FestivalBanner festival={festival} />
          </div>
        )}

        {/* PRODUCT GRIDS WITH GLASS CARD WRAPPERS */}
        <div className="space-y-8">
          <section className="animate-in slide-in-from-bottom-4 duration-700">
            <ProductGrid products={filteredProducts} theme={theme} offers={offers} />
          </section>

          {lightning.length > 0 && (
            <div className="bg-white/5 backdrop-blur-md rounded-[32px] p-4 border border-white/10 shadow-inner">
               <ProductGrid title="⚡ Lightning Deals" products={lightning} theme={theme} offers={offers} />
            </div>
          )}

          <ProductGrid title="🔥 Trending" products={trending} theme={theme} offers={offers} />
          
          <div className="bg-white/5 backdrop-blur-md rounded-[32px] p-4 border border-white/10">
            <ProductGrid title="⚡ Clearance" products={clearance} theme={theme} offers={offers} />
          </div>

          <ProductGrid title="⭐ Recommended" products={recommended} theme={theme} offers={offers} />
        </div>
      </div>

      {/* BLURRY BOTTOM NAV HOLDER */}
      <div className="fixed bottom-0 left-0 w-full z-[100] px-4 pb-4">
        <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden">
           <BottomNav theme={theme} />
        </div>
      </div>
    </div>
  );
}

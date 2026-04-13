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
import { useEffect, useState, useMemo } from "react";

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
        const d: any = doc.data();
        let isValid = true;
        if (d.active === false) isValid = false;
        if (d.endDate) {
          let endTime = d.endDate?.seconds
            ? d.endDate.toDate().getTime()
            : new Date(d.endDate).getTime();
          if (endTime < Date.now()) isValid = false;
        }
        if (isValid) offerMap[d.productId] = d.discount;
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

  // --- SMART FUZZY SEARCH LOGIC ---
  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();
    
    // Agar kuch search nahi ho raha aur category 'All' hai, toh saare products dikhao
    if (!query && selectedCategory === "All") return products;

    return products.filter((p) => {
      const pName = p.name.toLowerCase();
      
      // 1. Exact Match check
      const isMatch = pName.includes(query);

      // 2. Simple Fuzzy (Check characters in order)
      let i = 0, j = 0;
      while (i < query.length && j < pName.length) {
        if (query[i] === pName[j]) i++;
        j++;
      }
      const isFuzzyMatch = i === query.length;

      // 3. Category Match
      const matchCategory = selectedCategory === "All" || p.category === selectedCategory;

      return (isMatch || isFuzzyMatch) && matchCategory;
    });
  }, [search, products, selectedCategory]);

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
        
        {/* Search Bar Wrapper */}
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
                onClick={() => setSearch(item)}
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

        {/* --- DYNAMIC VIEW --- */}
        <div id="product-list" className="space-y-12 scroll-mt-24">
          
          {search.trim() !== "" ? (
            /* CASE A: USER IS SEARCHING */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {filteredProducts.length > 0 ? (
                <ProductGrid 
                  title={`Results for "${search}"`} 
                  products={filteredProducts} 
                  theme={theme} 
                  offers={offers} 
                />
              ) : (
                /* NOT FOUND STATE */
                <div className="text-center py-24 bg-white/5 rounded-[40px] border border-dashed border-white/20 mx-2">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-white text-xl font-bold">No results found</h3>
                  <p className="text-white/50 text-sm mt-2 px-6">
                    We couldn't find anything matching "{search}". Try checking the spelling or using different keywords.
                  </p>
                  <button 
                    onClick={() => setSearch("")}
                    className="mt-8 px-8 py-3 bg-white text-black rounded-full text-xs font-black uppercase tracking-widest active:scale-95 transition shadow-xl"
                  >
                    Clear Search
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* CASE B: NORMAL HOME VIEW */
            <>
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

              <div className="space-y-12">
                {/* Agar category selected hai par search nahi, toh category products dikhao */}
                {selectedCategory !== "All" && (
                   <ProductGrid title={`${selectedCategory} Collection`} products={filteredProducts} theme={theme} offers={offers} />
                )}

                <ProductGrid title="⚡ Lightning Deals" products={lightning} theme={theme} offers={offers} />
                <ProductGrid title="🔥 Trending" products={trending} theme={theme} offers={offers} />
                
                <div className="bg-white/5 p-4 rounded-[40px] border border-white/5 shadow-inner">
                   <ProductGrid title="⚡ Clearance" products={clearance} theme={theme} offers={offers} />
                </div>
                
                <ProductGrid title="⭐ Recommended" products={recommended} theme={theme} offers={offers} />
              </div>
            </>
          )}
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

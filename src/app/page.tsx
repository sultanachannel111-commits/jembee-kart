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
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function HomePage() {

  const theme = useTheme();

  const [categories,setCategories] = useState<any[]>([]);
  const [banners,setBanners] = useState<any[]>([]);
  const [products,setProducts] = useState<any[]>([]);
  const [festival,setFestival] = useState<any>(null);

  const [offers,setOffers] = useState<any>({}); // ✅ ADD

  const [search,setSearch] = useState("");
  const [selectedCategory,setSelectedCategory] = useState("All");

  const [trending,setTrending] = useState<any[]>([]);
  const [clearance,setClearance] = useState<any[]>([]);
  const [recommended,setRecommended] = useState<any[]>([]);
  const [lightning,setLightning] = useState<any[]>([]);

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

      // 🔥 OFFERS LOAD
      const offerSnap = await getDocs(collection(db, "offers"));
      const offerMap:any = {};
      offerSnap.forEach(doc=>{
        const d = doc.data();
        offerMap[d.productId] = d.discount;
      });
      setOffers(offerMap);

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
      console.log(err);
    }
  };

  const normalize = (text:string)=>
    text?.toLowerCase().replace(/\s|-/g,"");

  const filteredProducts = products.filter(p=>{
    return (
      normalize(p.name).includes(normalize(search)) &&
      (selectedCategory === "All" || p.category === selectedCategory)
    );
  });

  const backgroundStyle = theme?.gradient
    ? `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`
    : theme?.background || "#0f172a";

  return(
    <div style={{ background: backgroundStyle }} className="min-h-screen pb-[80px]">

      <Header theme={theme}/>

      <div className="pt-[80px] px-4 space-y-4">

        <SearchBar search={search} setSearch={setSearch}/>

        <CategoryList
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        {banners?.length > 0 && <BannerSlider banners={banners}/>}

        <FlashSale/>

        {festival?.active && <FestivalBanner festival={festival}/>}

        {/* ✅ OFFERS PASS */}
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

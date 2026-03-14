"use client";

import Header from "@/components/home/Header";
import SearchBar from "@/components/home/SearchBar";
import BannerSlider from "@/components/home/BannerSlider";
import CategoryList from "@/components/home/CategoryList";
import ProductGrid from "@/components/home/ProductGrid";
import BottomNav from "@/components/home/BottomNav";
import FestivalBanner from "@/components/home/FestivalBanner";
import FlashSale from "@/components/home/FlashSale";

import { useEffect, useState } from "react";

import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { getTrendingProducts } from "@/services/trendingService";
import { getClearanceProducts } from "@/services/clearanceService";
import { getRecommendedProducts } from "@/services/recommendService";
import { getLightningDeals } from "@/services/lightningService";

export default function HomePage(){

const [categories,setCategories] = useState<any[]>([]);
const [banners,setBanners] = useState<any[]>([]);
const [products,setProducts] = useState<any[]>([]);
const [filteredProducts,setFilteredProducts] = useState<any[]>([]);

const [festival,setFestival] = useState<any>(null);
const [slide,setSlide] = useState(0);

const [selectedCategory,setSelectedCategory] = useState("All");

const [trending,setTrending] = useState<any[]>([]);
const [clearance,setClearance] = useState<any[]>([]);
const [recommended,setRecommended] = useState<any[]>([]);
const [lightning,setLightning] = useState<any[]>([]);

useEffect(()=>{
loadData();
},[]);

const loadData = async()=>{

const catSnap = await getDocs(collection(db,"qikinkCategories"));

setCategories([
{
id:"all",
name:"All",
image:"https://cdn-icons-png.flaticon.com/512/3081/3081559.png"
},
...catSnap.docs.map(d=>({id:d.id,...d.data()}))
]);

const bannerSnap = await getDocs(collection(db,"banners"));
setBanners(bannerSnap.docs.map(d=>({id:d.id,...d.data()})));

const productSnap = await getDocs(collection(db,"products"));

const productData = productSnap.docs.map(d=>({
id:d.id,
...d.data()
}));

setProducts(productData);
setFilteredProducts(productData);

const trendingProducts = await getTrendingProducts();
setTrending(trendingProducts);

const clearanceProducts = await getClearanceProducts();
setClearance(clearanceProducts);

const recommendedProducts = await getRecommendedProducts();
setRecommended(recommendedProducts);

const lightningDeals = await getLightningDeals();
setLightning(lightningDeals);

const festSnap = await getDoc(doc(db,"settings","festival"));

if(festSnap.exists()) setFestival(festSnap.data());

};

useEffect(()=>{

if(!banners.length) return;

const interval = setInterval(()=>{
setSlide(prev=>(prev+1)%banners.length);
},3000);

return ()=>clearInterval(interval);

},[banners]);

return(

<div className="min-h-screen pb-[80px]" style={{background:"var(--admin-bg)"}}>

<Header/>

<div className="pt-[70px]">

{/* SEARCH */}

<div className="sticky top-[60px] z-40 bg-white px-4 py-2 shadow">

<SearchBar
products={products}
setProducts={setFilteredProducts}
/>

</div>

<div className="px-4 space-y-4">

<CategoryList
categories={categories}
selectedCategory={selectedCategory}
setSelectedCategory={setSelectedCategory}
/>

<BannerSlider
banners={banners}
slide={slide}
/>

<FlashSale/>

{festival?.active && (
<FestivalBanner festival={festival}/>
)}

<ProductGrid products={filteredProducts}/>

<ProductGrid
title="⚡ Lightning Deals"
products={lightning}
/>

<ProductGrid
title="🔥 Trending Products"
products={trending}
/>

<ProductGrid
title="⚡ Clearance Sale"
products={clearance}
/>

<ProductGrid
title="⭐ Recommended For You"
products={recommended}
/>

</div>

</div>

<BottomNav/>

</div>

);

}

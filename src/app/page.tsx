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

import { getQikinkProducts } from "@/lib/qikink";

import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export default function HomePage() {

const [categories,setCategories] = useState<any[]>([]);
const [banners,setBanners] = useState<any[]>([]);
const [products,setProducts] = useState<any[]>([]);

const [trending,setTrending] = useState<any[]>([]);
const [clearance,setClearance] = useState<any[]>([]);
const [recommended,setRecommended] = useState<any[]>([]);
const [lightning,setLightning] = useState<any[]>([]);

const [festival,setFestival] = useState<any>(null);

const [slide,setSlide] = useState(0);
const [search,setSearch] = useState("");
const [selectedCategory,setSelectedCategory] = useState("All");

const [timeLeft,setTimeLeft] = useState<any>(null);

useEffect(()=>{
loadData();
loadQikinkProducts();
},[]);

const loadQikinkProducts = async ()=>{

try{

const res = await fetch("/api/qikink");
const data = await res.json();

if(Array.isArray(data)){

const formatted = data.map((p:any)=>({

id:p.id,
name:p.name,
price:p.retail_price || p.price,
image:p.images?.[0]?.src || p.image,
category:p.category || "Qikink"

}));

setProducts(prev=>{

const merged=[...prev,...formatted];

const unique=merged.filter(
(v,i,a)=>a.findIndex(t=>t.id===v.id)===i
);

return unique;

});

}

}catch(error){

console.log("Qikink Error",error);

}

};

const loadData = async ()=>{

try{

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

setBanners(bannerSnap.docs.map(d=>({
id:d.id,
...d.data()
})));

const productSnap = await getDocs(collection(db,"products"));

const firestoreProducts = productSnap.docs.map(d=>({
id:d.id,
...d.data()
}));

setProducts(prev=>{

const merged=[...prev,...firestoreProducts];

const unique=merged.filter(
(v,i,a)=>a.findIndex(t=>t.id===v.id)===i
);

return unique;

});

const trendingProducts = await getTrendingProducts();
setTrending(trendingProducts);

const clearanceProducts = await getClearanceProducts();
setClearance(clearanceProducts);

const recommendedProducts = await getRecommendedProducts();
setRecommended(recommendedProducts);

const lightningDeals = await getLightningDeals();
setLightning(lightningDeals);

const festSnap = await getDoc(doc(db,"settings","festival"));

if(festSnap.exists()){
setFestival(festSnap.data());
}

}catch(err){

console.log("Load Error",err);

}

};

useEffect(()=>{

if(!banners.length) return;

const interval = setInterval(()=>{

setSlide(prev=>(prev+1)%banners.length);

},3000);

return ()=>clearInterval(interval);

},[banners]);

useEffect(()=>{

if(!festival?.endDate) return;

const interval = setInterval(()=>{

const diff = new Date(festival.endDate).getTime() - new Date().getTime();

if(diff<=0){

setTimeLeft(null);
clearInterval(interval);

}else{

setTimeLeft({

hours:Math.floor(diff/(1000*60*60)),
minutes:Math.floor((diff/(1000*60))%60),
seconds:Math.floor((diff/1000)%60)

});

}

},1000);

return ()=>clearInterval(interval);

},[festival]);

const normalize=(text:string)=>text?.toLowerCase().replace(/\s|-/g,"");

const filteredProducts = products.filter((p:any)=>{

const matchSearch = normalize(p.name || "").includes(normalize(search));

const matchCategory =
selectedCategory==="All" ||
(p.category || "")===selectedCategory;

return matchSearch && matchCategory;

});

return(

<div className="bg-gradient-to-b from-pink-100 to-white min-h-screen pb-[80px]">

<Header/>

<div className="pt-[80px] px-4 space-y-4">

<SearchBar
search={search}
setSearch={setSearch}
/>

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

<FestivalBanner
festival={festival}
timeLeft={timeLeft}
/>

)}

<ProductGrid
title="All Products"
products={filteredProducts}
/>

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

<BottomNav/>

</div>

);

}

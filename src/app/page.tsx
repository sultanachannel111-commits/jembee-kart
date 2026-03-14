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
import { getQikinkProducts } from "@/lib/qikink";

import { useEffect, useState } from "react";

import {
collection,
getDocs,
doc,
getDoc
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function HomePage() {

const { cartCount } = useCart();
const { user } = useAuth();

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

const [question,setQuestion] = useState("");
const [answer,setAnswer] = useState("");
const [loadingAI,setLoadingAI] = useState(false);

const trendingSearch = [
"black tshirt",
"oversize tshirt",
"hoodie",
"anime tshirt",
"couple tshirt"
];

useEffect(()=>{
loadData();
},[]);

async function loadData(){

/* 🔥 Categories */

const catSnap = await getDocs(collection(db,"qikinkCategories"));

setCategories([
{
id:"all",
name:"All",
image:"https://cdn-icons-png.flaticon.com/512/3081/3081559.png"
},
...catSnap.docs.map(d=>({id:d.id,...d.data()}))
]);

/* 🔥 Banners */

const bannerSnap = await getDocs(collection(db,"banners"));

setBanners(bannerSnap.docs.map(d=>({id:d.id,...d.data()})));

/* 🔥 Offers */

const offerSnap = await getDocs(collection(db,"offers"));

const activeOffers = offerSnap.docs
.map(d=>({id:d.id,...d.data()}))
.filter((o:any)=>
o.active &&
new Date(o.endDate).getTime() > new Date().getTime()
);

/* 🔥 Firestore Products */

const productSnap = await getDocs(collection(db,"products"));

const firestoreProducts = productSnap.docs.map(d=>{

const data = d.data();

let price = Number(data.sellPrice || data.price || 0);

let matchedOffer = activeOffers.find((o:any)=>{

if(o.type === "product" && o.productId === d.id) return true;

if(
o.type === "category" &&
o.category?.toLowerCase() === data.category?.toLowerCase()
) return true;

return false;

});

if(matchedOffer){

const discount = Number(matchedOffer.discount);

price = Math.round(price - (price*discount)/100);

}

return{
id:d.id,
...data,
price
}

});

/* 🔥 Qikink Products */

const qikinkProducts = await getQikinkProducts();

/* 🔥 Merge */

setProducts([...firestoreProducts,...qikinkProducts]);

/* 🔥 Services */

setTrending(await getTrendingProducts());

setClearance(await getClearanceProducts());

setRecommended(await getRecommendedProducts());

setLightning(await getLightningDeals());

/* 🔥 Festival */

const festSnap = await getDoc(doc(db,"settings","festival"));

if(festSnap.exists()){
setFestival(festSnap.data());
}

/* 🔥 Theme */

const themeSnap = await getDoc(doc(db,"settings","theme"));

if(themeSnap.exists()){

const theme = themeSnap.data();

document.documentElement.style.setProperty(
"--primary-color",
theme.primaryColor
);

document.documentElement.style.setProperty(
"--secondary-color",
theme.secondaryColor
);

}

}

/* 🔥 Banner Slider */

useEffect(()=>{

if(!banners.length) return;

const interval = setInterval(()=>{

setSlide(prev => (prev+1)%banners.length)

},3000)

return ()=>clearInterval(interval)

},[banners])

/* 🔥 Festival Timer */

useEffect(()=>{

if(!festival?.endDate) return;

const interval = setInterval(()=>{

const diff =
new Date(festival.endDate).getTime() -
new Date().getTime()

if(diff<=0){
setTimeLeft(null)
clearInterval(interval)
}else{

setTimeLeft({
hours:Math.floor(diff/(1000*60*60)),
minutes:Math.floor((diff/(1000*60))%60),
seconds:Math.floor((diff/1000)%60)
})

}

},1000)

return ()=>clearInterval(interval)

},[festival])

/* 🔥 Search */

const normalize = (text:string)=>
text?.toLowerCase().replace(/\s|-/g,"");

const fixedSearch = correctSearch(search);

const filteredProducts = products.filter(p=>{

const matchSearch =
normalize(p.name).includes(normalize(fixedSearch))

const matchCategory =
selectedCategory === "All" ||
p.category === selectedCategory

return matchSearch && matchCategory

});

/* 🎤 Voice Search */

const startVoice = ()=>{

const SpeechRecognition =
(window as any).SpeechRecognition ||
(window as any).webkitSpeechRecognition;

if(!SpeechRecognition){

alert("Voice search not supported");

return;

}

const recognition = new SpeechRecognition();

recognition.lang = "en-IN";

recognition.start();

recognition.onresult = (e:any)=>{

const transcript = e.results[0][0].transcript;

setSearch(transcript);

};

}

/* 🤖 AI Answer */

const askAI = async()=>{

if(!question) return;

setLoadingAI(true);

const res = await fetch("/api/ai-answer",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({question})

})

const data = await res.json();

setAnswer(data.answer);

setLoadingAI(false);

}

return(

<div className="bg-gradient-to-b from-pink-100 to-white min-h-screen pb-[80px]">

<Header/>

<div className="mt-[70px] px-4 space-y-4">

<SearchBar
search={search}
setSearch={setSearch}
startVoice={startVoice}
/>

{/* 🔥 Trending Searches */}

{!search && (

<div className="bg-white rounded-xl shadow p-3">

<p className="text-sm font-semibold mb-2">
🔥 Trending Searches
</p>

<div className="flex flex-wrap gap-2">

{trendingSearch.map(item=>(
<button
key={item}
onClick={()=>setSearch(item)}
className="px-3 py-1 bg-gray-100 rounded-full text-xs"
>
{item}
</button>
))}

</div>

</div>

)}

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

)

}

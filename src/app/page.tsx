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

import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

export default function HomePage(){

const { cartCount } = useCart();
const { user } = useAuth();

const [categories,setCategories] = useState<any[]>([]);
const [banners,setBanners] = useState<any[]>([]);
const [products,setProducts] = useState<any[]>([]);
const [filteredProducts,setFilteredProducts] = useState<any[]>([]);

const [festival,setFestival] = useState<any>(null);

const [search,setSearch] = useState("");
const [selectedCategory,setSelectedCategory] = useState("All");

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
},[])

async function loadData(){

/* Categories */

const catSnap = await getDocs(collection(db,"qikinkCategories"));

setCategories([
{ id:"all",name:"All",image:"https://cdn-icons-png.flaticon.com/512/3081/3081559.png"},
...catSnap.docs.map(d=>({id:d.id,...d.data()}))
]);

/* Banners */

const bannerSnap = await getDocs(collection(db,"banners"));
setBanners(bannerSnap.docs.map(d=>({id:d.id,...d.data()})));

/* Offers */

const offerSnap = await getDocs(collection(db,"offers"));

const activeOffers = offerSnap.docs
.map(d=>({id:d.id,...d.data()}))
.filter((o:any)=>o.active && new Date(o.endDate).getTime() > new Date().getTime())

/* Firestore Products */

const productSnap = await getDocs(collection(db,"products"));

const firestoreProducts = productSnap.docs.map(d=>{

const data = d.data();

let price = Number(data.sellPrice || data.price || 0);

let matchedOffer = activeOffers.find((o:any)=>{

if(o.type==="product" && o.productId===d.id) return true;

if(o.type==="category" && o.category?.toLowerCase()===data.category?.toLowerCase()) return true;

return false;

})

if(matchedOffer){

const discount = Number(matchedOffer.discount);
price = Math.round(price - (price*discount)/100)

}

return{
id:d.id,
...data,
price
}

})

/* Qikink */

const qikinkProducts = await getQikinkProducts();

/* Merge */

const allProducts = [...firestoreProducts,...qikinkProducts];

setProducts(allProducts);
setFilteredProducts(allProducts);

/* Services */

setTrending(await getTrendingProducts());
setClearance(await getClearanceProducts());
setRecommended(await getRecommendedProducts());
setLightning(await getLightningDeals());

/* Festival */

const festSnap = await getDoc(doc(db,"settings","festival"));
if(festSnap.exists()) setFestival(festSnap.data());

}

/* SMART SEARCH */

useEffect(()=>{

const fixedSearch = correctSearch(search);

const normalize = (text:string)=>text?.toLowerCase().replace(/\s|-/g,"");

const result = products.filter(p=>{

const name = normalize(p.name);
const keyword = normalize(fixedSearch);

const matchSearch = name.includes(keyword);

const matchCategory =
selectedCategory==="All" || p.category===selectedCategory;

return matchSearch && matchCategory;

})

setFilteredProducts(result)

},[search,selectedCategory,products])

/* VOICE SEARCH */

const startVoice = ()=>{

const SpeechRecognition =
(window as any).SpeechRecognition ||
(window as any).webkitSpeechRecognition;

if(!SpeechRecognition){
alert("Voice search not supported")
return
}

const recognition = new SpeechRecognition();

recognition.lang="en-IN";
recognition.start();

recognition.onresult=(e:any)=>{

const transcript = e.results[0][0].transcript;

setSearch(transcript)

}

}

/* AI ANSWER */

const askAI = async()=>{

if(!question) return;

setLoadingAI(true)

const res = await fetch("/api/ai-answer",{
method:"POST",
headers:{ "Content-Type":"application/json"},
body:JSON.stringify({question})
})

const data = await res.json();

setAnswer(data.answer);

setLoadingAI(false)

}

return(

<div className="bg-white min-h-screen">

<Header cartCount={cartCount}/>

{/* SEARCH */}

<div className="px-3 mt-2">

<div className="flex items-center border rounded-md px-2 py-2">

<input
value={search}
onChange={(e)=>setSearch(e.target.value)}
placeholder="Search products..."
className="flex-1 outline-none text-sm"
/>

<button onClick={startVoice}>
🎤
</button>

</div>

</div>

{/* TRENDING SEARCH */}

{!search && (

<div className="flex gap-2 px-3 mt-3 flex-wrap">

{trendingSearch.map(item=>(

<button
key={item}
onClick={()=>setSearch(item)}
className="px-3 py-1 bg-gray-100 rounded text-xs"
>

{item}

</button>

))}

</div>

)}

{/* BANNER */}

<BannerSlider banners={banners}/>

{/* CATEGORY */}

<CategoryList
categories={categories}
selected={selectedCategory}
onSelect={setSelectedCategory}
/>

{/* FLASH SALE */}

<FlashSale products={lightning}/>

{/* PRODUCTS */}

<ProductGrid products={filteredProducts}/>

{/* AI QUESTION */}

<div className="p-3">

<input
placeholder="Ask about product..."
value={question}
onChange={(e)=>setQuestion(e.target.value)}
className="border p-2 w-full rounded"
/>

<button
onClick={askAI}
className="bg-black text-white px-4 py-2 mt-2 rounded"
>

{loadingAI ? "Thinking..." : "Ask AI"}

</button>

{answer && (
<div className="mt-3 text-sm bg-gray-100 p-2 rounded">
{answer}
</div>
)}

</div>

<BottomNav/>

</div>

)

}

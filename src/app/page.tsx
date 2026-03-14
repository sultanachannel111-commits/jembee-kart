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

/* Categories */

const catSnap = await getDocs(collection(db,"qikinkCategories"));

setCategories([
{ id:"all", name:"All", image:"https://cdn-icons-png.flaticon.com/512/3081/3081559.png"},
...catSnap.docs.map(d=>({id:d.id,...d.data()}))
]);

/* banners */

const bannerSnap = await getDocs(collection(db,"banners"));
setBanners(bannerSnap.docs.map(d=>({id:d.id,...d.data()})));

/* offers */

const offerSnap = await getDocs(collection(db,"offers"));

const activeOffers = offerSnap.docs
.map(d=>({id:d.id,...d.data()}))
.filter((o:any)=> o.active && new Date(o.endDate).getTime() > new Date().getTime());

/* firestore products */

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

price = Math.round(price - (price * discount) / 100);

}

return {
id:d.id,
...data,
price
};

});

/* qikink */

const qikinkProducts = await getQikinkProducts();

/* merge */

setProducts([...firestoreProducts,...qikinkProducts]);

/* services */

setTrending(await getTrendingProducts());
setClearance(await getClearanceProducts());
setRecommended(await getRecommendedProducts());
setLightning(await getLightningDeals());

/* festival */

const festSnap = await getDoc(doc(db,"settings","festival"));

if(festSnap.exists()){
setFestival(festSnap.data());
}

/* theme */

const themeSnap = await getDoc(doc(db,"settings","theme"));

if(themeSnap.exists()){

const theme = themeSnap.data();

document.documentElement.style.setProperty("--primary-color",theme.primaryColor);

document.documentElement.style.setProperty("--secondary-color",theme.secondaryColor);

}

}

/* banner slider */

useEffect(()=>{

if(!banners.length) return;

const interval = setInterval(()=>{

setSlide(prev => (prev+1)%banners.length)

},3000)

return ()=>clearInterval(interval)

},[banners])

/* festival timer */

useEffect(()=>{

if(!festival?.endDate) return;

const interval = setInterval(()=>{

const diff = new Date(festival.endDate).getTime() - new Date().getTime();

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

/* search */

const normalize = (text:string)=>
text?.toLowerCase().replace(/\s|-/g,"")

const fixedSearch = correctSearch(search)

const filteredProducts = products.filter(p=>{

const matchSearch = normalize(p.name).includes(normalize(fixedSearch))

const matchCategory =
selectedCategory === "All" ||
p.category === selectedCategory

return matchSearch && matchCategory

})

/* voice search */

const startVoice = ()=>{

const SpeechRecognition =
(window as any).SpeechRecognition ||
(window as any).webkitSpeechRecognition

if(!SpeechRecognition){

alert("Voice search not supported")

return

}

const recognition = new SpeechRecognition()

recognition.lang="en-IN"

recognition.start()

recognition.onresult=(e:any)=>{

const transcript = e.results[0][0].transcript

setSearch(transcript)

}

}

return(

<div className="pb-20">

<Header cartCount={cartCount} />

<SearchBar
search={search}
setSearch={setSearch}
startVoice={startVoice}
/>

{/* trending search */}

{!search && (

<div className="px-4 mt-2 flex flex-wrap gap-2">

{trendingSearch.map(item=>(
<button
key={item}
onClick={()=>setSearch(item)}
className="px-3 py-1 bg-gray-100 text-xs rounded-md"
>

{item}

</button>
))}

</div>

)}

<BannerSlider banners={banners} slide={slide} />

<CategoryList
categories={categories}
selected={selectedCategory}
setSelected={setSelectedCategory}
/>

{festival?.active && (

<FestivalBanner
festival={festival}
timeLeft={timeLeft}
/>

)}

<FlashSale products={lightning} />

<ProductGrid products={filteredProducts} />

<BottomNav />

</div>

)

}

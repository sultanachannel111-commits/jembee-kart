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

import { useEffect, useState } from "react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { signOut } from "firebase/auth";

import { getLightningDeals } from "@/services/lightningService";

export default function HomePage() {
  const { cartCount } = useCart();
  const pathname = usePathname();
  const { user } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
  };

  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [festival, setFestival] = useState<any>(null);
  const [slide, setSlide] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ratings, setRatings] = useState<any>({});
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [timeLeft, setTimeLeft] = useState<any>(null);
  const [trending, setTrending] = useState<any[]>([]);
  const [clearance, setClearance] = useState<any[]>([]);
  const [recommended, setRecommended] = useState<any[]>([]);
  const [lightning, setLightning] = useState<any[]>([]);
  
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const catSnap = await getDocs(collection(db, "qikinkCategories"));
    setCategories([
      { 
  id: "all", 
  name: "All",
  image: "https://cdn-icons-png.flaticon.com/512/3081/3081559.png"
 },
      ...catSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    ]);

    const bannerSnap = await getDocs(collection(db, "banners"));
    setBanners(bannerSnap.docs.map((d) => ({ id: d.id, ...d.data() })));
    const offerSnap = await getDocs(collection(db, "offers"));

const activeOffers = offerSnap.docs
  .map(d => ({ id: d.id, ...d.data() }))
  .filter(
    (o: any) =>
      o.active &&
      new Date(o.endDate).getTime() > new Date().getTime()
  );
    const productSnap = await getDocs(collection(db, "products"));

const productsWithOffers = productSnap.docs.map(d => {
  const data = d.data();

  const baseProduct = {
    id: d.id,
    ...data,
    price: Number(data.sellingPrice || data.price || 0)
  };

  let matchedOffer = activeOffers.find((o: any) => {

    // Product offer
    if (o.type === "product" && o.productId === d.id)
      return true;

    // Category offer
    if (
      o.type === "category" &&
      o.category?.trim().toLowerCase() ===
      data.category?.trim().toLowerCase()
    )
      return true;

    return false;
  });

  if (!matchedOffer) return baseProduct;

const price = Number(baseProduct.price || 0);
const discountPercent = Number(matchedOffer.discount || 0);

if (!price) return baseProduct;

const discountAmount = (price * discountPercent) / 100;

return {
  ...baseProduct,
  originalPrice: price,
  price: Math.round(price - discountAmount),
  discount: discountPercent
};
});

setProducts(productsWithOffers);
    
    const trendingProducts = await getTrendingProducts();
setTrending(trendingProducts);

const clearanceProducts = await getClearanceProducts();
setClearance(clearanceProducts);

const recommendedProducts = await getRecommendedProducts();
setRecommended(recommendedProducts);

const lightningDeals = await getLightningDeals();
setLightning(lightningDeals);    
    const festSnap = await getDoc(doc(db, "settings", "festival"));
    if (festSnap.exists()) setFestival(festSnap.data());

    const reviewSnap = await getDocs(collection(db, "reviews"));
    const ratingMap: any = {};

    reviewSnap.forEach((doc) => {
      const r = doc.data();
      if (!ratingMap[r.productId]) {
        ratingMap[r.productId] = { total: 0, count: 0 };
      }
      ratingMap[r.productId].total += r.rating;
      ratingMap[r.productId].count += 1;
    });

    setRatings(ratingMap);
  };

  useEffect(() => {
    if (!banners.length) return;
    const interval = setInterval(() => {
      setSlide((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners]);

  useEffect(() => {
    if (!festival?.endDate) return;

    const interval = setInterval(() => {
      const diff =
        new Date(festival.endDate).getTime() - new Date().getTime();

      if (diff <= 0) {
        setTimeLeft(null);
        clearInterval(interval);
      } else {
        setTimeLeft({
          hours: Math.floor(diff / (1000 * 60 * 60)),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [festival]);

  const normalize = (text: string) =>
    text?.toLowerCase().replace(/\s|-/g, "");

  const filteredProducts = products.filter((p) => {
    const matchSearch = normalize(p.name).includes(normalize(search));
    const matchCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  useEffect(() => {
    if (!search) return setSuggestions([]);
    const matches = products.filter((p) =>
      normalize(p.name).includes(normalize(search))
    );
    setSuggestions(matches.slice(0, 5));
  }, [search]);

  const startVoice = () => {

  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert("Voice search not supported");
    return;
  }

  const recognition = new SpeechRecognition();

  recognition.lang = "en-IN";
  recognition.interimResults = false;
  recognition.continuous = false;

  recognition.start();

  recognition.onresult = (event: any) => {
    const transcript = event.results[0][0].transcript;
    setSearch(transcript);
  };

};

  const toggleWishlist = (id: string) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((w) => w !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const calculateDiscount = (price: number, original: number) => {
    if (!original) return null;
    return Math.round(((original - price) / original) * 100);
  };

  return (

<div className="bg-gradient-to-b from-pink-100 to-white min-h-screen pb-[80px]">

<Header />

<div className="pt-[80px] px-4 space-y-4">

<SearchBar
search={search}
setSearch={setSearch}
startVoice={startVoice}
/>

<BannerSlider
banners={banners}
slide={slide}
/>

<FlashSale />
  
{festival?.active && (
<FestivalBanner
festival={festival}
timeLeft={timeLeft}
/>
)}

<CategoryList
categories={categories}
selectedCategory={selectedCategory}
setSelectedCategory={setSelectedCategory}
/>

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

<BottomNav />

</div>

);
  }

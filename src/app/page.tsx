"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Search,
  Mic,
  ShoppingCart,
  Home,
  Grid,
  User,
  Star,
  Heart
} from "lucide-react";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  where
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { usePathname } from "next/navigation";

export default function HomePage() {
  const { cart } = useCart();
  const pathname = usePathname();

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const catSnap = await getDocs(collection(db, "qikinkCategories"));
    setCategories([{ id: "all", name: "All" }, ...catSnap.docs.map(d => ({ id: d.id, ...d.data() }))]);

    const bannerSnap = await getDocs(collection(db, "banners"));
    setBanners(bannerSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const productSnap = await getDocs(collection(db, "products"));
    const productData = productSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    setProducts(productData);

    const festSnap = await getDoc(doc(db, "settings", "festival"));
    if (festSnap.exists()) setFestival(festSnap.data());

    // Real rating calculation
    const reviewSnap = await getDocs(collection(db, "reviews"));
    const ratingMap: any = {};
    reviewSnap.forEach(doc => {
      const r = doc.data();
      if (!ratingMap[r.productId]) {
        ratingMap[r.productId] = { total: 0, count: 0 };
      }
      ratingMap[r.productId].total += r.rating;
      ratingMap[r.productId].count += 1;
    });
    setRatings(ratingMap);
  };

  // Slider auto
  useEffect(() => {
    if (!banners.length) return;
    const interval = setInterval(() => {
      setSlide(prev => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners]);

  const normalize = (text: string) =>
    text?.toLowerCase().replace(/\s|-/g, "");

  const filteredProducts = products.filter(p => {
    const matchSearch = normalize(p.name).includes(normalize(search));
    const matchCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  useEffect(() => {
    if (!search) return setSuggestions([]);
    const matches = products.filter(p =>
      normalize(p.name).includes(normalize(search))
    );
    setSuggestions(matches.slice(0, 5));
  }, [search]);

  const startVoice = () => {
    const SpeechRecognition =
      (window as any).webkitSpeechRecognition ||
      (window as any).SpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.start();
    recognition.onresult = (event: any) => {
      setSearch(event.results[0][0].transcript);
    };
  };

  const toggleWishlist = (id: string) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(w => w !== id));
    } else {
      setWishlist([...wishlist, id]);
    }
  };

  const calculateDiscount = (price: number, original: number) => {
    if (!original) return null;
    return Math.round(((original - price) / original) * 100);
  };

  return (
    <div className="bg-gradient-to-b from-pink-100 to-white min-h-screen pb-20 pt-[160px]">

      {/* HEADER */}
      {/* FIXED TOP SECTION */}
<div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-pink-200 to-white">

  {/* HEADER */}
  <div className="px-4 py-4 flex justify-between items-center">
    <h1 className="text-xl font-bold">
      <span className="text-black">Jembee</span>
      <span className="text-pink-700">Kart</span>
    </h1>

    <div className="flex items-center gap-3">
      <Link href="/login">
        <button className="bg-white text-pink-600 px-4 py-2 rounded-md shadow font-semibold">
          Login
        </button>
      </Link>

      <Link href="/cart" className="relative">
        <ShoppingCart size={22} />
        {cart.length > 0 && (
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
            {cart.length}
          </span>
        )}
      </Link>
    </div>
  </div>

  {/* SEARCH */}
  <div className="bg-white px-4 pb-3">
    <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
      <Search size={16} />
      <input
        type="text"
        placeholder="Search products..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="flex-1 bg-transparent outline-none px-3 text-sm"
      />
      <Mic size={16} onClick={startVoice} className="cursor-pointer" />
    </div>
  </div>

</div>
      </div>

      {/* FESTIVAL */}
      {festival?.active && (
        <div className="px-4 mt-2">
          <img src={festival.image} className="rounded-xl shadow" />
        </div>
      )}

      {/* CATEGORY */}
      <div className="bg-white py-4 px-3 overflow-x-auto flex gap-4 mt-2">
        {categories.map(cat => (
          <div
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className="flex flex-col items-center min-w-[75px] cursor-pointer"
          >
            <div className={`w-16 h-16 rounded-full border-2 p-1 ${selectedCategory === cat.name ? "border-pink-600" : "border-gray-300"}`}>
              {cat.image && (
                <img src={cat.image} className="w-full h-full rounded-full object-cover" />
              )}
            </div>
            <span className="text-xs mt-2">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* SLIDER */}
      {banners.length > 0 && (
        <div className="px-4 mt-4">
          <div className="rounded-xl overflow-hidden shadow relative">
            <img src={banners[slide]?.image} className="w-full h-44 object-cover" />
          </div>
          <div className="flex justify-center gap-2 mt-2">
            {banners.map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${slide === i ? "bg-pink-600" : "bg-gray-300"}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-bold text-purple-600 mb-4">
          Best of JembeeKart
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map(product => {
            const ratingData = ratings[product.id];
            const avg =
              ratingData && ratingData.count
                ? (ratingData.total / ratingData.count).toFixed(1)
                : "4.5";

            const discount = calculateDiscount(
              product.sellingPrice,
              product.originalPrice
            );

            return (
              <div key={product.id} className="bg-white rounded-xl shadow p-3 relative">
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-2 right-2"
                >
                  <Heart
                    size={18}
                    className={wishlist.includes(product.id) ? "text-red-500 fill-red-500" : ""}
                  />
                </button>

                <Link href={`/product/${product.id}`}>
                  <img
                    src={product.image}
                    className="rounded-lg w-full h-40 object-cover"
                  />
                </Link>

                <div className="mt-2 text-sm font-medium truncate">
                  {product.name}
                </div>

                <div className="flex items-center gap-1 text-xs mt-1">
                  <span>{avg}</span>
                  <Star size={14} className="text-green-600 fill-green-600" />
                </div>

                <div className="font-bold mt-1">
                  ₹{product.sellingPrice}
                  {product.originalPrice && (
                    <span className="line-through text-gray-400 ml-2 text-xs">
                      ₹{product.originalPrice}
                    </span>
                  )}
                </div>

                {discount && (
                  <div className="text-green-600 text-xs">
                    {discount}% OFF
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3">
        <Link href="/" className={pathname === "/" ? "text-pink-600" : ""}>
          <Home size={20} />
        </Link>
        <Link href="/categories">
          <Grid size={20} />
        </Link>
        <Link href="/account">
          <User size={20} />
        </Link>
        <Link href="/cart" className="relative">
          <ShoppingCart size={20} />
          {cart.length > 0 && (
            <span className="absolute -top-1 right-0 bg-red-500 text-white text-xs px-1 rounded-full">
              {cart.length}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}

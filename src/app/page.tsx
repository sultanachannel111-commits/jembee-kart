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
  Heart,
} from "lucide-react";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { signOut } from "firebase/auth";

export default function HomePage() {
  const { cartCount, addToCart } = useCart();
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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const catSnap = await getDocs(collection(db, "qikinkCategories"));
    setCategories([
      { id: "all", name: "All" },
      ...catSnap.docs.map((d) => ({ id: d.id, ...d.data() })),
    ]);

    const bannerSnap = await getDocs(collection(db, "banners"));
    setBanners(bannerSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

    const productSnap = await getDocs(collection(db, "products"));
    setProducts(
  productSnap.docs.map(d => {
    const data = d.data();
    return {
      id: d.id,
      ...data,
      price: data.sellingPrice  // 🔥 FIX
    };
  })
);

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
    <div className="bg-gradient-to-b from-pink-100 to-white min-h-screen pb-24 pt-[96px]">

      {/* HEADER */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-pink-200 to-pink-400 px-4 h-[72px] flex justify-between items-center">
        <h1 className="text-xl font-bold">
          <span className="text-black">Jembee</span>
          <span className="text-pink-700">Kart</span>
        </h1>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm font-semibold text-white">
                Hi, {user.displayName || user.email?.split("@")[0]}
              </span>
              <button
                onClick={handleLogout}
                className="bg-white text-red-600 px-4 py-2 rounded-md shadow font-semibold"
              >
                Logout
              </button>
            </>
          ) : (
            <Link href="/login">
              <button className="bg-white text-pink-600 px-4 py-2 rounded-md shadow font-semibold">
                Login
              </button>
            </Link>
          )}

          <Link href="/cart" className="relative">
            <ShoppingCart size={22} />
            {cartCount > 0 && (
  <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-1 rounded-full">
    {cartCount}
  </span>
)}
          </Link>
        </div>
      </div>

      {/* SEARCH */}
      <div className="sticky top-[72px] z-40 bg-white px-4 py-3 shadow-sm">
        <div className="relative">
          <div className="flex items-center bg-gray-100 rounded-full px-4 py-3">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none px-3 text-sm"
            />
            <Mic size={16} onClick={startVoice} className="cursor-pointer" />
          </div>

          {suggestions.length > 0 && (
            <div className="absolute bg-white w-full mt-2 rounded-lg shadow-lg z-50">
              {suggestions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => {
                    setSearch(s.name);
                    setSuggestions([]);
                  }}
                  className="px-4 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                >
                  {s.name}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BANNER */}
      {banners.length > 0 && (
        <div className="px-4 mt-4">
          <img
            src={banners[slide]?.image}
            className="w-full h-40 object-cover rounded-xl shadow"
          />
        </div>
      )}

      {/* FESTIVAL */}
      {festival && timeLeft && (
        <div className="mx-4 mt-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl p-4 shadow-lg">
          <h2 className="text-lg font-bold">{festival.title}</h2>
          <div className="flex gap-4 mt-2 font-bold">
            <span>{timeLeft.hours}h</span>
            <span>{timeLeft.minutes}m</span>
            <span>{timeLeft.seconds}s</span>
          </div>
        </div>
      )}

      {/* CATEGORY */}
      <div className="bg-white py-4 px-3 overflow-x-auto flex gap-4 mt-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className="flex flex-col items-center min-w-[75px] cursor-pointer"
          >
            <div
              className={`w-16 h-16 rounded-full border-2 p-1 ${
                selectedCategory === cat.name
                  ? "border-pink-600"
                  : "border-gray-300"
              }`}
            >
              {cat.image && (
                <img
                  src={cat.image}
                  className="w-full h-full rounded-full object-cover"
                />
              )}
            </div>
            <span className="text-xs mt-2">{cat.name}</span>
          </div>
        ))}
      </div>

      {/* PRODUCTS */}
      <div className="px-4 mt-6">
        <h2 className="text-lg font-bold text-purple-600 mb-4">
          Best of JembeeKart
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {filteredProducts.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow p-3 relative">

              <Heart
                size={18}
                onClick={() => toggleWishlist(product.id)}
                className={`absolute top-3 right-3 cursor-pointer ${
                  wishlist.includes(product.id)
                    ? "text-red-500"
                    : "text-gray-400"
                }`}
              />

              <Link href={`/product/${product.id}`}>
                <img
                  src={product.image}
                  className="rounded-lg w-full h-40 object-cover"
                />
              </Link>

              {calculateDiscount(product.price, product.originalPrice) && (
                <span className="absolute top-3 left-3 bg-green-600 text-white text-xs px-2 py-1 rounded">
                  {calculateDiscount(product.price, product.originalPrice)}% OFF
                </span>
              )}

              <div className="mt-2 text-sm font-medium truncate">
                {product.name}
              </div>

              {ratings[product.id] && (
                <div className="flex items-center gap-1 text-xs mt-1">
                  <span className="bg-green-600 text-white px-1 rounded">
                    {(ratings[product.id].total /
                      ratings[product.id].count).toFixed(1)}
                  </span>
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-gray-500">
                    ({ratings[product.id].count})
                  </span>
                </div>
              )}

              <div className="flex items-center gap-2 mt-1">
                <span className="font-bold">₹{product.price}</span>
                {product.originalPrice && (
                  <span className="text-gray-400 line-through text-xs">
                    ₹{product.originalPrice}
                  </span>
                )}
              </div>

            </div>
          ))}
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-inner flex justify-around py-2 border-t">
        <Link href="/" className="flex flex-col items-center text-xs">
          <Home size={20} />
          Home
        </Link>
        <Link href="/categories" className="flex flex-col items-center text-xs">
          <Grid size={20} />
          Categories
        </Link>
        <Link href="/wishlist" className="flex flex-col items-center text-xs">
          <Heart size={20} />
          Wishlist
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-xs">
          <User size={20} />
          Profile
        </Link>
      </div>

    </div>
  );
}

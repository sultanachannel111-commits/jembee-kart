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
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { useCart } from "@/context/CartContext";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { signOut } from "firebase/auth";

export default function HomePage() {
  const { cart } = useCart();
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
    setProducts(productSnap.docs.map((d) => ({ id: d.id, ...d.data() })));

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
    <div className="bg-gradient-to-b from-pink-100 to-white min-h-screen pb-20 pt-[120px]">

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
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
                {cart.length}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* SEARCH */}
      <div className="sticky top-[72px] z-40 bg-white px-4 py-3 shadow-sm">
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
          <div className="absolute left-4 right-4 bg-white shadow-lg rounded-xl mt-2 z-50">
            {suggestions.map((s) => (
              <Link key={s.id} href={`/product/${s.id}`}>
                <div className="p-2 hover:bg-gray-100 text-sm">
                  {s.name}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Remaining sections same as your existing (Festival, Category, Slider, Products, Bottom Nav) */}

    </div>
  );
}

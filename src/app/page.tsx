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
  setDoc,
  deleteDoc
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
  const [page, setPage] = useState(1);
  const [pincode, setPincode] = useState("");
  const [pincodeMsg, setPincodeMsg] = useState("");

  // 🔥 NEW STATES
  const [offerTimers, setOfferTimers] = useState<any>({});

  const productsPerPage = 6;
  const now = new Date();

  useEffect(() => {
    loadData();
  }, []);

  // 🔥 Reset page when category changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  const loadData = async () => {
    const catSnap = await getDocs(collection(db, "categories"));
    setCategories([{ id: "all", name: "All" }, ...catSnap.docs.map(d => ({ id: d.id, ...d.data() }))]);

    const bannerSnap = await getDocs(collection(db, "banners"));
    setBanners(bannerSnap.docs.map(d => ({ id: d.id, ...d.data() })));

    const productSnap = await getDocs(collection(db, "products"));
    const productData = productSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    setProducts(productData);

    const festSnap = await getDoc(doc(db, "settings", "festival"));
    if (festSnap.exists()) setFestival(festSnap.data());

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

    // 🔥 Wishlist Auto Load
    const userId = "demoUser";
    const wishSnap = await getDocs(collection(db, "wishlists"));
    const userWishlist = wishSnap.docs
      .filter(d => d.data().userId === userId)
      .map(d => d.data().productId);
    setWishlist(userWishlist);
  };

  // Slider auto
  useEffect(() => {
    if (!banners.length) return;
    const interval = setInterval(() => {
      setSlide(prev => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [banners]);

  // 🔥 Offer Countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const newTimers: any = {};

      products.forEach(product => {
        if (product.offerEnd?.seconds) {
          const diff =
            new Date(product.offerEnd.seconds * 1000).getTime() -
            new Date().getTime();

          if (diff > 0) {
            const hours = Math.floor(diff / (1000 * 60 * 60));
            const minutes = Math.floor(
              (diff % (1000 * 60 * 60)) / (1000 * 60)
            );
            newTimers[product.id] = `${hours}h ${minutes}m left`;
          }
        }
      });

      setOfferTimers(newTimers);
    }, 60000);

    return () => clearInterval(interval);
  }, [products]);

  const normalize = (text: string) =>
    text?.toLowerCase().replace(/\s|-/g, "");

  const filteredProducts = products.filter(p => {
    const matchSearch = normalize(p.name).includes(normalize(search));
    const matchCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * productsPerPage,
    page * productsPerPage
  );

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

  const toggleWishlist = async (id: string) => {
    const userId = "demoUser";

    if (wishlist.includes(id)) {
      await deleteDoc(doc(db, "wishlists", userId + "_" + id));
      setWishlist(wishlist.filter(w => w !== id));
    } else {
      await setDoc(doc(db, "wishlists", userId + "_" + id), {
        productId: id,
        userId,
        createdAt: new Date(),
      });
      setWishlist([...wishlist, id]);
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen pb-20">

      {/* HEADER */}
      <div className="bg-gradient-to-r from-pink-200 to-pink-400 px-4 py-4 flex justify-between items-center">
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

      {/* PRODUCTS SECTION ONLY UPDATED BELOW */}

      <div className="px-4 mt-6">
        <h2 className="text-lg font-bold text-purple-600 mb-4">
          Best of JembeeKart
        </h2>

        <div className="grid grid-cols-2 gap-4">
          {paginatedProducts.map(product => {

            const ratingData = ratings[product.id];
            const avg =
              ratingData && ratingData.count
                ? (ratingData.total / ratingData.count).toFixed(1)
                : "4.5";

            const isOfferActive =
              product.offerEnd &&
              new Date(product.offerEnd.seconds * 1000) > now;

            const finalPrice = isOfferActive
              ? product.offerPrice
              : product.sellingPrice;

            const discountPercent =
              isOfferActive && product.sellingPrice
                ? Math.round(
                    ((product.sellingPrice - product.offerPrice) /
                      product.sellingPrice) *
                      100
                  )
                : null;

            return (
              <div key={product.id} className="bg-white rounded-xl shadow p-3 relative">

                {/* Wishlist */}
                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="absolute top-2 right-2"
                >
                  <Heart
                    size={18}
                    className={wishlist.includes(product.id) ? "text-red-500 fill-red-500" : ""}
                  />
                </button>

                {/* Discount Badge */}
                {discountPercent && (
                  <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full">
                    {discountPercent}% OFF
                  </div>
                )}

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
                  ₹{finalPrice}
                  {isOfferActive && (
                    <span className="line-through text-gray-400 ml-2 text-xs">
                      ₹{product.sellingPrice}
                    </span>
                  )}
                </div>

                {/* Countdown */}
                {offerTimers[product.id] && (
                  <div className="text-red-500 text-xs mt-1">
                    🔥 {offerTimers[product.id]}
                  </div>
                )}

                {/* Stock */}
                {product.stock !== undefined && (
                  <div className="text-xs mt-1">
                    {product.stock === 0 ? (
                      <span className="text-red-600 font-semibold">
                        Out of Stock
                      </span>
                    ) : product.stock <= 5 ? (
                      <span className="text-orange-600 font-semibold">
                        Only {product.stock} left
                      </span>
                    ) : (
                      <span className="text-green-600">
                        In Stock
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Pagination Improved */}
        <div className="flex justify-center gap-2 mt-4">
          <button
            disabled={page === 1}
            onClick={() => setPage(prev => Math.max(prev - 1, 1))}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <button
            disabled={page * productsPerPage >= filteredProducts.length}
            onClick={() => setPage(prev => prev + 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* Bottom Nav same as before */}
    </div>
  );
}

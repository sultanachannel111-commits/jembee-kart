import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  limit,
  orderBy
} from "firebase/firestore";

// 🔥 MEMORY CACHE
let cache: any = null;
let lastFetch = 0;

export async function GET() {
  try {

    // ⚡ FAST CACHE (5 sec)
    if (cache && Date.now() - lastFetch < 5000) {
      return NextResponse.json(cache);
    }

    // ⚡ PARALLEL FETCH
    const [
      catSnap,
      bannerSnap,
      productSnap,
      themeSnap,
      festSnap,
      offerSnap
    ] = await Promise.all([

      getDocs(collection(db, "qikinkCategories")),

      getDocs(
        query(collection(db, "banners"), orderBy("order", "asc"))
      ),

      getDocs(query(collection(db, "products"), limit(30))),

      getDoc(doc(db, "settings", "theme")),

      getDoc(doc(db, "settings", "festival")),

      getDocs(collection(db, "offers"))
    ]);

    // 🔥 CATEGORY
    const categories = [
      {
        id: "all",
        name: "All",
        image:
          "https://cdn-icons-png.flaticon.com/512/3081/3081559.png",
      },
      ...catSnap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })),
    ];

    // 🔥 BANNERS
    const banners = bannerSnap.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
      }))
      .filter((b: any) => b.active !== false);

    // 🔥 PRICE FUNCTION (UNIVERSAL)
    const getPrice = (data: any) => {
      if (data?.variations?.length) {
        const v = data.variations[0];
        if (v?.sizes?.length) {
          const s = v.sizes[0];
          if (s?.sellPrice) return Number(s.sellPrice);
          if (s?.price) return Number(s.price);
        }
      }
      return data?.price || 0;
    };

    // 🔥 ACTIVE OFFERS
    const activeOffers = offerSnap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter(
        (o: any) =>
          o.active &&
          new Date(o.endDate).getTime() > Date.now()
      );

    // 🔥 APPLY OFFER (CORE LOGIC)
    const applyOffer = (product: any) => {

      const basePrice = getPrice(product);

      if (basePrice <= 0) {
        return {
          ...product,
          price: 0
        };
      }

      const matchedOffer = activeOffers.find((o: any) => {

        // product match
        if (
          o.type === "product" &&
          o.productId?.trim() === product.id?.trim()
        ) return true;

        // category match
        if (
          o.type === "category" &&
          o.category?.toLowerCase().trim() ===
          product.category?.toLowerCase().trim()
        ) return true;

        return false;
      });

      // ❌ no offer
      if (!matchedOffer) {
        return {
          ...product,
          price: basePrice
        };
      }

      const discount = Number(matchedOffer.discount || 0);

      const finalPrice = Math.max(
        1,
        Math.round(basePrice - (basePrice * discount) / 100)
      );

      return {
        ...product,
        price: finalPrice,
        originalPrice: basePrice,
        discount
      };
    };

    // 🔥 PRODUCTS WITH OFFER
    const products = productSnap.docs.map((d) => {
      const data = d.data();

      return applyOffer({
        id: d.id,
        ...data
      });
    });

    // 🔥 THEME
    const theme = themeSnap.exists() ? themeSnap.data() : {};

    // 🔥 FESTIVAL
    const festival = festSnap.exists() ? festSnap.data() : null;

    const response = {
      categories,
      banners,
      products,
      theme,
      festival,
    };

    // 💾 CACHE SAVE
    cache = response;
    lastFetch = Date.now();

    return NextResponse.json(response, {
      headers: {
        "Cache-Control":
          "public, s-maxage=120, stale-while-revalidate=300",
      },
    });

  } catch (err) {
    console.log("❌ API ERROR:", err);

    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

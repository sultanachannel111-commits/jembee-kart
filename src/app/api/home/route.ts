import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";

import {
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  limit
} from "firebase/firestore";

export async function GET() {
  try {

    // 🔥 PARALLEL FETCH (FAST)
    const [
      catSnap,
      bannerSnap,
      productSnap,
      themeSnap,
      festSnap
    ] = await Promise.all([

      getDocs(collection(db,"qikinkCategories")),

      getDocs(collection(db,"banners")),

      // 🔥 LIMIT PRODUCTS (IMPORTANT)
      getDocs(query(collection(db,"products"), limit(30))),

      getDoc(doc(db,"settings","theme")),

      getDoc(doc(db,"settings","festival"))
    ]);

    // ✅ CATEGORY
    const categories = [
      {
        id:"all",
        name:"All",
        image:"https://cdn-icons-png.flaticon.com/512/3081/3081559.png"
      },
      ...catSnap.docs.map(d => ({
        id:d.id,
        ...d.data()
      }))
    ];

    // ✅ BANNERS
    const banners = bannerSnap.docs.map(d => ({
      id:d.id,
      ...d.data()
    }));

    // 🔥 PRICE FIX FUNCTION
    const getPrice = (data:any)=>{
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

    // ✅ PRODUCTS
    const products = productSnap.docs.map(d => {
      const data = d.data();
      return {
        id:d.id,
        ...data,
        price:getPrice(data)
      };
    });

    // ✅ THEME
    const theme = themeSnap.exists() ? themeSnap.data() : {};

    // ✅ FESTIVAL
    const festival = festSnap.exists() ? festSnap.data() : null;

    // 🔥 FINAL RESPONSE
    const response = {
      categories,
      banners,
      products,
      theme,
      festival
    };

    return NextResponse.json(response, {
      headers: {
        // 🔥 GLOBAL CACHE (MAIN MAGIC)
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120"
      }
    });

  } catch (err) {
    console.log("❌ API ERROR:", err);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

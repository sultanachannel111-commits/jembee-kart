import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  limit
} from "firebase/firestore";

export async function GET() {
  try {
    // 🔥 Only featured + limit
    const q = query(
      collection(db, "products"),
      where("isFeatured", "==", true),
      limit(8)
    );

    const snap = await getDocs(q);

    const products = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(products, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120"
      }
    });

  } catch (err) {
    return NextResponse.json([], { status: 500 });
  }
}

import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { productId } = await req.json();

    if (!productId) {
      return NextResponse.json({
        success: false,
        message: "Product ID required"
      });
    }

    /* 🔥 QIKINK API CALL (FIXED URL) */
    const res = await fetch(
      `https://api.qikink.com/api/v1/products/${productId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.QIKINK_API_KEY}`
        }
      }
    );

    const data = await res.json();

    console.log("🔥 QIKINK RAW:", data);

    /* 🔥 SAFE PRODUCT PICK (handle all cases) */
    const p =
      data?.product ||
      data?.data ||
      data;

    console.log("🔥 FINAL PRODUCT:", p);

    /* 🔥 FINAL FORMAT */
    const product = {
      name:
        p?.product_name ||
        p?.name ||
        p?.title ||
        "",

      description:
        p?.product_description ||
        p?.description ||
        "",

      category:
        p?.product_category ||
        p?.category ||
        "",

      variations:
        p?.variants?.map((v: any) => ({
          color: v?.color || "",

          basePrice: v?.base_price || 0,
          sellPrice: v?.price || 0,

          images: {
            main: v?.image || ""
          },

          sizes:
            v?.sizes?.map((s: any) => ({
              size: s?.size || "",
              price: s?.price || 0,
              stock: s?.stock || 0
            })) || []
        })) || []
    };

    return NextResponse.json({
      success: true,
      product
    });

  } catch (err: any) {
    console.log("❌ API ERROR:", err);

    return NextResponse.json({
      success: false,
      message: err.message
    });
  }
}

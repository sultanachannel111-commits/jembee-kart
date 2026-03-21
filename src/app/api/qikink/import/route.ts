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

    /* 🔥 QIKINK API CALL */
    const res = await fetch(
      `https://api.qikink.com/api/products/${productId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.QIKINK_API_KEY}`
        }
      }
    );

    const data = await res.json();

    /* 🔥 SAFE FORMAT */
    const product = {
      name: data?.name || "",
      description: data?.description || "",
      category: data?.category || "",
      variations:
        data?.variants?.map((v: any) => ({
          color: v.color,
          basePrice: v.base_price,
          sellPrice: v.price,

          images: {
            main: v.image
          },

          sizes: v.sizes?.map((s: any) => ({
            size: s.size,
            price: s.price,
            stock: s.stock
          }))
        })) || []
    };

    return NextResponse.json({
      success: true,
      product
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      message: err.message
    });
  }
}

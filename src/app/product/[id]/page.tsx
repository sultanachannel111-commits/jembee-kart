"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

import { useCart } from "@/context/CartContext";
import { getFinalPrice } from "@/lib/priceCalculator";

export default function ProductPage() {

  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  const { addToCart } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  /* FETCH PRODUCT */

  useEffect(() => {

    if (!id) return;

    const fetchProduct = async () => {

      try {

        const snap = await getDoc(doc(db, "products", id));

        if (!snap.exists()) {
          setProduct(null);
          setLoading(false);
          return;
        }

        const data: any = {
          id: snap.id,
          ...snap.data()
        };

        /* FETCH OFFERS */

        const offerSnap = await getDocs(collection(db, "offers"));

        let discount = 0;

        offerSnap.forEach((offerDoc) => {

          const offer: any = offerDoc.data();

          if (!offer.active) return;

          if (offer.endDate) {
            const end = new Date(offer.endDate);
            if (end < new Date()) return;
          }

          /* PRODUCT OFFER */

          if (
            offer.type === "product" &&
            offer.productId === id
          ) {
            discount = offer.discount;
          }

          /* CATEGORY OFFER */

          if (
            offer.type === "category" &&
            offer.category &&
            offer.category.toLowerCase().trim() ===
              data.category?.toLowerCase().trim()
          ) {
            discount = offer.discount;
          }

        });

        data.discount = discount;

        setProduct(data);
        setLoading(false);

      } catch (error) {

        console.log(error);
        setLoading(false);

      }

    };

    fetchProduct();

  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Product not found
      </div>
    );
  }

  const finalPrice = getFinalPrice(product);

  const outOfStock = !product.stock || product.stock <= 0;

  /* ADD TO CART */

  const handleAddToCart = async () => {

    if (outOfStock) return;

    setAdding(true);

    await addToCart({
      ...product,
      quantity
    });

    setAdding(false);

  };

  return (

    <div className="min-h-screen pt-[96px] p-4">

      {/* IMAGE */}

      <img
        src={product.image}
        className="w-full h-[300px] object-cover rounded-lg"
      />

      {/* NAME */}

      <h1 className="text-2xl font-bold mt-4">
        {product.name}
      </h1>

      {/* PRICE */}

      <div className="flex gap-3 items-center mt-2">

        <span className="text-2xl font-bold text-black">
          ₹{finalPrice}
        </span>

        {product.discount > 0 && (
          <span className="line-through text-gray-400">
            ₹{product.sellPrice}
          </span>
        )}

        {product.discount > 0 && (
          <span className="text-red-500 text-sm font-bold">
            {product.discount}% OFF
          </span>
        )}

      </div>

      {/* STOCK */}

      <p className="mt-2 text-green-600 font-semibold">
        {outOfStock
          ? "Out of Stock"
          : `In Stock (${product.stock})`}
      </p>

      {/* QUANTITY */}

      {!outOfStock && (

        <div className="flex items-center gap-4 mt-4">

          <button
            onClick={() =>
              setQuantity((q) => Math.max(1, q - 1))
            }
            className="bg-gray-200 px-4 py-2 rounded"
          >
            -
          </button>

          <span className="text-lg font-bold">
            {quantity}
          </span>

          <button
            onClick={() =>
              setQuantity((q) =>
                Math.min(product.stock || 10, q + 1)
              )
            }
            className="bg-gray-200 px-4 py-2 rounded"
          >
            +
          </button>

        </div>

      )}

      {/* DESCRIPTION */}

      {product.description && (

        <p className="mt-6 text-gray-600">
          {product.description}
        </p>

      )}

      {/* BUTTONS */}

      <div className="flex gap-4 mt-8">

        <button
          disabled={outOfStock || adding}
          onClick={handleAddToCart}
          className="bg-pink-600 text-white px-6 py-3 rounded w-full"
        >
          {adding ? "Adding..." : "Add to Cart"}
        </button>

        <button
          onClick={() =>
            router.push(`/checkout?productId=${product.id}`)
          }
          className="bg-black text-white px-6 py-3 rounded w-full"
        >
          Buy Now
        </button>

      </div>

    </div>

  );

}

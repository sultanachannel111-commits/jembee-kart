"use client";

import Link from "next/link";
import Image from "next/image";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/definitions";
import { ArrowRight } from "lucide-react";

export function ProductCard({ product }: { product: Product }) {

  const price = product.price || 0;
  const sellPrice = product.sellPrice || price;

  const discount =
    price > sellPrice
      ? Math.round(((price - sellPrice) / price) * 100)
      : 0;

  return (
    <Card className="flex flex-col h-full overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">

      {/* Product Image */}

      <CardHeader className="p-0">
        <div className="aspect-square relative overflow-hidden">

          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
          />

          {/* Discount Badge */}

          {discount > 0 && (
            <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">
              {discount}% OFF
            </div>
          )}

        </div>
      </CardHeader>

      {/* Product Info */}

      <CardContent className="p-4 flex-grow flex flex-col">

        <CardTitle className="text-lg font-semibold mb-2 line-clamp-2 flex-grow">
          {product.name}
        </CardTitle>

        <div className="flex items-center gap-2 mt-2">

          <p className="text-2xl font-bold text-primary">
            ₹{sellPrice}
          </p>

          {price > sellPrice && (
            <p className="text-sm line-through text-gray-400">
              ₹{price}
            </p>
          )}

        </div>

      </CardContent>

      {/* Button */}

      <CardFooter className="p-4 pt-0">

        <Button asChild className="w-full">

          <Link href={`/product/${product.id}`}>
            View Details
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>

        </Button>

      </CardFooter>

    </Card>
  );
}

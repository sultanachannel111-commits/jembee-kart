import { Header } from "@/components/header";
import { getProducts } from "@/lib/data";
import { ProductCard } from "@/components/product-card";
import { Product } from "@/lib/definitions";
import { unstable_noStore as noStore } from "next/cache";

export default async function Home() {
  noStore();

  let products: Product[] = [];

  try {
    products = await getProducts();
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8 md:px-6">

          {/* Heading */}
          <h1 className="text-3xl font-bold tracking-tight mb-4 font-headline">
            Featured Products
          </h1>

          {/* Orders Page Button */}
          <div className="mb-6">
            <a
              href="/orders"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
            >
              Go to Orders Page
            </a>
          </div>

          {/* Products Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product: Product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center rounded-lg border border-dashed shadow-sm min-h-[400px]">
              <div className="text-center py-16 text-muted-foreground">
                <h2 className="text-2xl font-semibold">
                  No products yet!
                </h2>
                <p className="mt-2">
                  Check back later for amazing deals or set up your Firebase project.
                </p>
              </div>
            </div>
          )}

        </div>
      </main>

      <footer className="py-6 border-t bg-card">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Jembee Kart. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

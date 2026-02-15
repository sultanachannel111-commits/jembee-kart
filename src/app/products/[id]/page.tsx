import { getProductById } from '@/lib/data';
import { notFound } from 'next/navigation';
import { Header } from '@/components/header';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';
import OrderForm from '@/components/order-form';
import AddToCartButton from '@/components/add-to-cart-button';
import { unstable_noStore as noStore } from 'next/cache';

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
    noStore();
    const product = await getProductById(params.id);

    if (!product) {
        notFound();
    }

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 py-8 md:py-12">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                        <div className="flex items-start">
                            <Card className="overflow-hidden w-full shadow-lg">
                                <div className="aspect-square relative">
                                    <Image
                                        src={product.imageUrl}
                                        alt={product.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                    />
                                </div>
                            </Card>
                        </div>

                        <div className="flex flex-col gap-4">
                            <h1 className="text-3xl md:text-4xl font-bold font-headline">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5 text-primary">
                                    <Star className="w-5 h-5 fill-current" />
                                    <Star className="w-5 h-5 fill-current" />
                                    <Star className="w-5 h-5 fill-current" />
                                    <Star className="w-5 h-5 fill-current" />
                                    <Star className="w-5 h-5 fill-muted stroke-primary" />
                                </div>
                                <span className="text-sm text-muted-foreground">
                                    (123 ratings)
                                </span>
                            </div>

                            <p className="text-4xl font-bold text-primary">
                                ${product.price.toFixed(2)}
                            </p>

                            <Card className="bg-white/50">
                                <CardContent className="p-6">
                                    <p className="text-foreground/80 leading-relaxed">
                                        {product.description}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* CART + BUY SECTION */}
                            <div className="mt-4 space-y-4">
                                <AddToCartButton product={product} />
                                <OrderForm product={product} />
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

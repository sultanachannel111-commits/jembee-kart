"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Home, Loader2, ShoppingBag } from 'lucide-react';
import type { Order, Product } from '@/lib/definitions';
import Image from 'next/image';

interface OrderConfirmationClientProps {
  order: Order | null;
  product: Product | null;
}

export function OrderConfirmationClient({ order, product }: OrderConfirmationClientProps) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000); // 2-second loading animation

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <h1 className="text-2xl font-semibold">Confirming your order...</h1>
        <p className="text-muted-foreground">Please wait while we finalize the details.</p>
      </div>
    );
  }

  if (!order || !product) {
     return (
        <div className="flex flex-col items-center justify-center gap-4 text-center">
            <h1 className="text-2xl font-semibold">Order Not Found</h1>
            <p className="text-muted-foreground">We couldn't find the details for this order.</p>
             <div className="flex gap-4 mt-6">
                <Button asChild>
                    <Link href="/">
                        <Home className="mr-2 h-4 w-4" /> Go to Homepage
                    </Link>
                </Button>
            </div>
        </div>
     )
  }

  return (
    <div className="flex flex-col items-center text-center gap-4">
      <CheckCircle2 className="h-16 w-16 text-green-500" />
      <h1 className="text-3xl font-bold font-headline">Thank you for your order!</h1>
      <p className="max-w-md text-muted-foreground">
        Your order has been placed successfully. You will receive a confirmation shortly. Your order ID is <span className="font-bold text-primary">{order.orderId}</span>.
      </p>

      <Card className="w-full max-w-sm text-left mt-4">
        <CardHeader>
            <CardTitle>Order Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
           <div className="flex items-center gap-4">
              <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                <Image src={product.imageUrl} alt={product.name} fill className="object-cover" />
              </div>
              <div>
                <p className="font-semibold">{product.name}</p>
                <p className="text-sm text-muted-foreground">${product.price.toFixed(2)}</p>
              </div>
           </div>
           <div className="text-sm">
            <p><span className="font-semibold">Order ID:</span> {order.orderId}</p>
            <p><span className="font-semibold">Status:</span> <span className="text-green-600 font-medium">{order.status}</span></p>
            <p><span className="font-semibold">Shipping to:</span> {order.shippingAddress}</p>
           </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 mt-6">
        <Button variant="outline" asChild>
          <Link href="/orders">
            <ShoppingBag className="mr-2 h-4 w-4" /> View My Orders
          </Link>
        </Button>
        <Button asChild>
          <Link href="/">
            <Home className="mr-2 h-4 w-4" /> Continue Shopping
          </Link>
        </Button>
      </div>
    </div>
  );
}

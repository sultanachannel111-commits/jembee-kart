"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2, ShoppingCart } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { type Product } from "@/lib/definitions";
import { placeOrderAction } from "@/lib/actions";

const formSchema = z.object({
  customerName: z.string().min(2, { message: "Name must be at least 2 characters." }),
  customerPhone: z.string().min(10, { message: "Please enter a valid phone number including country code." }),
  shippingAddress: z.string().min(10, { message: "Please enter a full shipping address." }),
});

export default function OrderForm({ product }: { product: Product }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "+91",
      shippingAddress: "",
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        customerName: user.name || "",
        customerPhone: user.phone || "+91",
        shippingAddress: "",
      });
    }
  }, [user, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
        toast({ variant: 'destructive', title: 'Not logged in', description: 'You must be logged in to place an order.' });
        return;
    }

    setIsLoading(true);
    
    const orderData = {
        ...values,
        userId: user.uid,
        productId: product.id,
        sellerId: product.sellerId,
        productDetails: {
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl,
        }
    };
    
    const result = await placeOrderAction(orderData);
    
    if (result?.error) {
        toast({
            variant: "destructive",
            title: "Order Failed",
            description: result.error,
        });
    }
    // On success, the action redirects, so no toast is needed here.
    setIsLoading(false);
  }

  if (!user) {
    return (
        <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
                <CardTitle>Log in to Order</CardTitle>
                <CardDescription>You need to be logged in as a customer to purchase this item.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button asChild className="w-full">
                    <Link href="/auth/otp-login">Customer Login</Link>
                </Button>
            </CardContent>
        </Card>
    )
  }

  return (
    <Card>
        <CardHeader>
            <CardTitle>Place Your Order</CardTitle>
            <CardDescription>Confirm your details to complete the purchase.</CardDescription>
        </CardHeader>
        <CardContent>
            <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                        <Input placeholder="John Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="customerPhone"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                        <Input placeholder="+91 9876543210" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="shippingAddress"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Shipping Address</FormLabel>
                    <FormControl>
                        <Textarea placeholder="123 Main St, Anytown, USA 12345" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                {isLoading ? 'Placing Order...' : `Buy Now for $${product.price.toFixed(2)}`}
                </Button>
            </form>
            </Form>
        </CardContent>
    </Card>
  );
}

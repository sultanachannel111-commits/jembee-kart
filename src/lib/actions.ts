
"use server";

import { z } from 'zod';
import { sellerProductOptimization, type SellerProductOptimizationOutput } from '@/ai/flows/seller-product-optimization-flow';
import { auth, db } from '@/lib/firebase';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import type { Order, Product } from './definitions';
import { redirect } from 'next/navigation';

const optimizeProductSchema = z.object({
  currentTitle: z.string(),
  currentDescription: z.string(),
});

export async function optimizeProductListingAction(
  input: z.infer<typeof optimizeProductSchema>
): Promise<{ data?: SellerProductOptimizationOutput; error?: string }> {
  try {
    const result = await sellerProductOptimization(input);
    return { data: result };
  } catch (error: any) {
    console.error('Error optimizing product listing:', error);
    return { error: 'Failed to generate suggestions. Please try again.' };
  }
}


const orderSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerPhone: z.string().min(1, "Phone is required"),
  shippingAddress: z.string().min(10, "Please enter a full shipping address"),
  productId: z.string(),
  sellerId: z.string(),
  userId: z.string(),
  productDetails: z.object({
    name: z.string(),
    price: z.number(),
    imageUrl: z.string(),
  }),
});


export async function placeOrderAction(values: z.infer<typeof orderSchema>) {
  const validatedFields = orderSchema.safeParse(values);

  if (!validatedFields.success) {
    return {
      error: 'Invalid data provided.',
    };
  }
  
  const { userId, productId, sellerId, customerName, customerPhone, shippingAddress, productDetails } = validatedFields.data;

  try {
    const orderId = `JM-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const newOrder: Omit<Order, 'id'> = {
        orderId,
        userId,
        productId,
        sellerId,
        customerName,
        customerPhone,
        shippingAddress,
        productDetails,
        status: 'Confirmed',
        createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, "orders"), newOrder);

  } catch (error) {
    console.error("Error placing order:", error);
    return {
      error: "There was a problem placing your order. Please try again."
    }
  }

  redirect(`/order-confirmation/${validatedFields.data.productId}`);
}

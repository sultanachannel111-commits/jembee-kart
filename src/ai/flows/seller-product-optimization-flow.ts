'use server';
/**
 * @fileOverview An AI agent for optimizing product titles and descriptions.
 *
 * - sellerProductOptimization - A function that handles the product optimization process.
 * - SellerProductOptimizationInput - The input type for the sellerProductOptimization function.
 * - SellerProductOptimizationOutput - The return type for the sellerProductOptimization function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SellerProductOptimizationInputSchema = z.object({
  currentTitle: z
    .string()
    .describe('The current title of the product listing.'),
  currentDescription: z
    .string()
    .describe('The current description of the product listing.'),
});
export type SellerProductOptimizationInput = z.infer<
  typeof SellerProductOptimizationInputSchema
>;

const SellerProductOptimizationOutputSchema = z.object({
  optimizedTitle: z
    .string()
    .describe('An optimized, compelling, clear, and discoverable product title.'),
  optimizedDescription: z
    .string()
    .describe(
      'An optimized, comprehensive, and engaging product description.'
    ),
});
export type SellerProductOptimizationOutput = z.infer<
  typeof SellerProductOptimizationOutputSchema
>;

export async function sellerProductOptimization(
  input: SellerProductOptimizationInput
): Promise<SellerProductOptimizationOutput> {
  return sellerProductOptimizationFlow(input);
}

const optimizeProductListingPrompt = ai.definePrompt({
  name: 'optimizeProductListingPrompt',
  input: {schema: SellerProductOptimizationInputSchema},
  output: {schema: SellerProductOptimizationOutputSchema},
  prompt: `You are an expert e-commerce product listing optimizer. Your goal is to improve product titles and descriptions to be more compelling, clear, and discoverable for customers on an online marketplace.

Critically analyze the provided current product title and description. Then, generate an optimized version for both.

Ensure the optimized title is concise, keyword-rich, and highlights key benefits or features.

Ensure the optimized description is comprehensive, engaging, uses clear language, and effectively communicates the product's value proposition and features.

Current Product Title: {{{currentTitle}}}

Current Product Description: {{{currentDescription}}}`,
});

const sellerProductOptimizationFlow = ai.defineFlow(
  {
    name: 'sellerProductOptimizationFlow',
    inputSchema: SellerProductOptimizationInputSchema,
    outputSchema: SellerProductOptimizationOutputSchema,
  },
  async input => {
    const {output} = await optimizeProductListingPrompt(input);
    return output!;
  }
);

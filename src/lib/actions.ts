const orderSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerPhone: z.string().min(1, "Phone is required"),
  shippingAddress: z.string().min(5, "Please enter full address"),

  productId: z.string().min(1),

  // Testing ke liye optional kar diya
  sellerId: z.string().optional(),
  userId: z.string().optional(),

  productDetails: z.object({
    name: z.string(),
    price: z.coerce.number(), // string ko number bana dega automatically
    imageUrl: z.string().optional(),
  }),
});

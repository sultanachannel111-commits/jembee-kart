export async function placeOrderAction(values: any) {
  const validated = orderSchema.safeParse(values);

  if (!validated.success) {
    return { error: "Invalid data provided." };
  }

  try {
    const data = validated.data;

    const orderId =
      "JM-" + Math.random().toString(36).substring(2, 7).toUpperCase();

    const newOrder = {
      orderId,
      userId: data.userId || "guest",
      productId: data.productId,
      sellerId: data.sellerId || "admin",
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      shippingAddress: data.shippingAddress,
      productDetails: data.productDetails,
      status: "Confirmed",
      createdAt: serverTimestamp(),
    };

    await addDoc(collection(db, "orders"), newOrder);

    return {
      success: true,
      message: "Order placed successfully"
    };

  } catch (error) {
    return {
      error: "There was a problem placing your order.",
    };
  }
}

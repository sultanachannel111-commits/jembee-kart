export const getFinalPrice = (item: any, offers: any = {}) => {
  
  // 🔥 SAFE PRODUCT ID (सब case cover)
  const productId =
    item?.id ||
    item?._id ||
    item?.productId ||
    "";

  // 🔥 PRICE PRIORITY (sell price first)
  const price =
    item?.selectedSize?.sellPrice ??
    item?.variations?.[0]?.sizes?.[0]?.sellPrice ??
    item?.sellPrice ??
    item?.selectedSize?.price ??
    item?.variations?.[0]?.sizes?.[0]?.price ??
    item?.price ??
    0;

  // 🔥 OFFER %
  const discount = offers?.[productId] ?? 0;

  // 🔥 FINAL PRICE CALCULATION
  const finalPrice =
    discount > 0
      ? price - (price * discount) / 100
      : price;

  return Math.max(0, Math.round(finalPrice));
};

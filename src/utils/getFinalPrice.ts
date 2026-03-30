export const getFinalPrice = (item: any, offers: any = {}) => {

  const productId =
    item?.id ||
    item?._id ||
    item?.productId ||
    "";

  // 🔥 ORIGINAL PRICE (CUT PRICE)
  const originalPrice =
    item?.selectedSize?.price ??
    item?.variations?.[0]?.sizes?.[0]?.price ??
    item?.price ??
    0;

  // 🔥 SELL PRICE (अगर already set है)
  const sellPrice =
    item?.selectedSize?.sellPrice ??
    item?.variations?.[0]?.sizes?.[0]?.sellPrice ??
    item?.sellPrice ??
    null;

  // 🔥 OFFER %
  const discount = offers?.[productId] ?? item?.discount ?? 0;

  // 🔥 FINAL PRICE LOGIC
  let finalPrice = 0;

  if (sellPrice) {
    finalPrice = sellPrice; // admin sell price priority
  } else if (discount > 0) {
    finalPrice = originalPrice - (originalPrice * discount) / 100;
  } else {
    finalPrice = originalPrice;
  }

  return Math.max(0, Math.round(finalPrice));
};

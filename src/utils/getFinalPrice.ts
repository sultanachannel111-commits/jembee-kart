export const getFinalPrice = (item: any, offers: any = {}) => {

  // 🔥 PRODUCT ID SAFE
  const productId =
    item?.productId ||
    item?.id ||
    "";

  // 🔥 BASE PRICE
  const price =
    item?.selectedSize?.sellPrice ??
    item?.variations?.[0]?.sizes?.[0]?.sellPrice ??
    item?.sellPrice ??
    item?.selectedSize?.price ??
    item?.variations?.[0]?.sizes?.[0]?.price ??
    item?.price ??
    0;

  // 🔥 FIND MATCHING OFFER (IMPORTANT FIX)
  const offer = Object.values(offers).find((o: any) => {

    if (!o.active) return false;

    // ✅ PRODUCT MATCH
    if (o.type === "product" && o.productId === productId) {
      return true;
    }

    // ✅ CATEGORY MATCH (NEW 🔥)
    if (
      o.type === "category" &&
      o.category &&
      item?.category &&
      o.category.toLowerCase() === item.category.toLowerCase()
    ) {
      return true;
    }

    return false;
  });

  if (!offer) return price;

  // 🔥 DATE CHECK
  const now = new Date();
  const end = offer.endDate ? new Date(offer.endDate) : null;

  if (end && now > end) {
    return price;
  }

  // 🔥 FINAL PRICE
  const final = price - (price * offer.discount) / 100;

  return Math.max(0, Math.round(final));
};

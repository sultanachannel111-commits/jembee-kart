export const getFinalPrice = (
  item: any,
  offers: any = {},
  couponDiscount: number = 0
) => {

  /* 🔥 PRODUCT ID SAFE */
  const productId =
    item?.id ||
    item?._id ||
    item?.productId ||
    "";

  /* 🔥 BASE PRICE (PRIORITY FIXED) */
  const base =
    item?.selectedSize?.sellPrice ??
    item?.variations?.[0]?.sizes?.[0]?.sellPrice ??
    item?.sellPrice ??
    item?.price ??
    0;

  /* 🔥 FIND MATCHING OFFER (NEW LOGIC) */
  const offer = Object.values(offers).find(
    (o: any) =>
      o.productId === productId &&
      o.active === true
  );

  let finalPrice = base;

  /* ⏰ TIME CHECK */
  if (offer) {
    const now = new Date();
    const end = offer.endDate ? new Date(offer.endDate) : null;

    if (!end || now <= end) {
      finalPrice =
        base - (base * offer.discount) / 100;
    }
  }

  /* 🎟️ COUPON APPLY */
  finalPrice = finalPrice - couponDiscount;

  return Math.max(0, Math.round(finalPrice));
};

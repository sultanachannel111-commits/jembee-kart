export const getFinalPrice = (item: any, offers: any = {}) => {

  const productId =
    item?.id ||
    item?._id ||
    item?.productId ||
    "";

  const price =
    item?.selectedSize?.sellPrice ??
    item?.variations?.[0]?.sizes?.[0]?.sellPrice ??
    item?.sellPrice ??
    item?.selectedSize?.price ??
    item?.variations?.[0]?.sizes?.[0]?.price ??
    item?.price ??
    0;

  const discount =
    offers?.[productId] ||
    offers?.[productId?.toString()] ||
    0;

  const finalPrice =
    discount > 0
      ? price - (price * discount) / 100
      : price;

  return Math.max(0, Math.round(finalPrice));
};

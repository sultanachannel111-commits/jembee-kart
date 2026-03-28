export const getFinalPrice = (item: any, offers?: any) => {

  const price =
    item?.selectedSize?.sellPrice ??
    item?.variations?.[0]?.sizes?.[0]?.sellPrice ??
    item?.sellPrice ??
    item?.price ??
    0;

  const discount = offers?.[item?.id] || 0;

  const final = price - (price * discount) / 100;

  return Math.round(final);
};

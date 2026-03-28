export const getFinalPrice = (item: any) => {
  return Number(
    item?.price ??
    item?.sellPrice ??
    item?.finalPrice ??
    item?.originalPrice ??
    item?.selectedSize?.price ??
    item?.selectedSize?.sellPrice ??
    item?.variations?.[0]?.sizes?.[0]?.price ??
    item?.variations?.[0]?.sizes?.[0]?.sellPrice ??
    0
  );
};

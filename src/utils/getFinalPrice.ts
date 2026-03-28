export const getFinalPrice = (item: any) => {
  return Number(
    item?.sellPrice ??
    item?.finalPrice ??
    item?.selectedSize?.sellPrice ??
    item?.variations?.[0]?.sizes?.[0]?.sellPrice ??
    item?.price ??
    item?.originalPrice ??
    item?.selectedSize?.price ??
    item?.variations?.[0]?.sizes?.[0]?.price ??
    0
  );
};

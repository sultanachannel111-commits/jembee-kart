export const getFinalPrice = (item: any) => {
  return Number(
    item?.selectedSize?.sellPrice ??
    item?.variations?.[0]?.sizes?.[0]?.sellPrice ??
    item?.sellPrice ??
    item?.finalPrice ??
    item?.selectedSize?.price ??
    item?.variations?.[0]?.sizes?.[0]?.price ??
    item?.price ??
    0
  );
};

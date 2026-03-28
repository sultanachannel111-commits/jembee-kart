export const getProductPrice = (product:any) => {

  return (
    product?.price ||
    product?.variations?.[0]?.sizes?.[0]?.sellPrice ||
    0
  );
};

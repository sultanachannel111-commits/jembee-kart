import { getProductPrice } from "./getPrice";

export const getFinalPrice = (product:any, discount:number) => {

  const basePrice = getProductPrice(product);

  if (!discount || basePrice === 0) return basePrice;

  const final = basePrice - (basePrice * discount) / 100;

  return Math.max(1, Math.round(final)); // 👈 कभी 0 नहीं होगा
};

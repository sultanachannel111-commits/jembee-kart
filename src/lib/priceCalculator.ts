export function getFinalPrice(product:any){

const basePrice = Number(product.sellPrice || product.price || 0);

if(!product.discount) return basePrice;

return Math.round(
basePrice - (basePrice * product.discount) / 100
);

}

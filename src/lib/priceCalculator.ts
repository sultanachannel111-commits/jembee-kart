export function getFinalPrice(product:any){

const basePrice = Number(product.sellPrice || product.price || 0);

const discount = Number(product.discount || 0);

if(discount === 0) return basePrice;

const discountAmount = (basePrice * discount) / 100;

return Math.round(basePrice - discountAmount);

}

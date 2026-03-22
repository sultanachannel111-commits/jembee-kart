export function getFinalPrice(product: any) {

  // ✅ 1. variation → sizes se price lo
  const sizes = product?.variations?.[0]?.sizes || [];

  let basePrice = 0;

  if (sizes.length > 0) {
    // 👉 lowest price show karega
    const prices = sizes.map((s: any) => Number(s.sellPrice || 0));
    basePrice = Math.min(...prices);
  }

  // ✅ 2. fallback (agar variation nahi hai)
  if (!basePrice) {
    basePrice = Number(product.sellPrice || product.price || 0);
  }

  // ✅ 3. discount apply
  const discount = Number(product.discount || 0);

  if (discount === 0) return basePrice;

  const discountAmount = (basePrice * discount) / 100;

  return Math.round(basePrice - discountAmount);
}

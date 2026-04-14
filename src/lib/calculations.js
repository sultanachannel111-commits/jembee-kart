export const calculateNetCommission = (item) => {
  const sellPrice = Number(item.price || 0);
  const basePrice = Number(item.basePrice || 0);
  const discountPercent = Number(item.discount || 0);
  const fixShipping = 40; // Aapka fix shipping charge

  // 1. Discounted Price (Jo customer pay karega)
  const discountedPrice = sellPrice - (sellPrice * (discountPercent / 100));

  // 2. Net Profit (Customer Price - Cost - Shipping)
  const netProfit = discountedPrice - basePrice - fixShipping;

  // 3. 50% Seller Share
  return netProfit > 0 ? Math.round(netProfit * 0.50) : 0;
};

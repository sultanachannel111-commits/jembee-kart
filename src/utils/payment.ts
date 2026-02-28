// src/utils/payment.ts

export const generateUpiLink = (
  amount: number,
  orderId: string
): string => {
  const upiId = "sultana9212@axl";
  const merchantName = "JembeeKart";

  // Convert & fix to 2 decimal places
  const finalAmount = Number(amount).toFixed(2);

  if (!amount || Number(amount) <= 0) {
    console.error("Invalid payment amount");
    return "";
  }

  const upiUrl = `upi://pay?pa=${upiId}
  &pn=${encodeURIComponent(merchantName)}
  &am=${finalAmount}
  &cu=INR
  &tr=${encodeURIComponent(orderId)}
  &tn=${encodeURIComponent(`Order ${orderId}`)}`.replace(/\s+/g, "");

  return upiUrl;
};

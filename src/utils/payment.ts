// src/utils/payment.ts

export const generateUpiLink = (
  amount: number,
  orderId: string
): string => {
  const upiId = "sultana9212@axl"; // ✅ Final correct UPI ID
  const merchantName = "JembeeKart";

  // Validate amount
  if (!amount || Number(amount) <= 0) {
    console.error("Invalid payment amount");
    return "";
  }

  // Format amount to 2 decimal places
  const finalAmount = Number(amount).toFixed(2);

  // Generate UPI URL (Generic - shows all UPI apps)
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    merchantName
  )}&am=${finalAmount}&cu=INR&tr=${encodeURIComponent(
    orderId
  )}&tn=${encodeURIComponent(`JembeeKart Order ${orderId}`)}`;

  return upiUrl;
};

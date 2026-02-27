// src/utils/payment.ts

export const generateUpiLink = (
  amount: number,
  orderId: string
): string => {
  const upiId = "sultana9212@axl"; // ✅ Your UPI ID
  const merchantName = "JembeeKart";

  // Ensure valid number
  const finalAmount = Number(amount);

  // Extra safety check
  if (!finalAmount || finalAmount <= 0) {
    console.error("Invalid payment amount");
    return "";
  }

  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    merchantName
  )}&am=${finalAmount}&cu=INR&tr=${orderId}&tn=${encodeURIComponent(
    "JembeeKart Order"
  )}`;

  return upiUrl;
};

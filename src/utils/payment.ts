export const generateUpiLink = (
  amount: number,
  orderId: string
): string => {
  const upiId = "sultana9212@axl";
  const merchantName = "JembeeKart";

  const finalAmount = Number(amount).toFixed(2);

  if (!amount || Number(amount) <= 0) {
    console.error("Invalid payment amount");
    return "";
  }

  return `upi://pay?pa=${upiId}&pn=${encodeURIComponent(
    merchantName
  )}&am=${finalAmount}&cu=INR&tr=${orderId}&tn=${encodeURIComponent(
    "JembeeKart Order"
  )}`;
};

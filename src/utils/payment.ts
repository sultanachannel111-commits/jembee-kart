export const generateUpiLink = (
  amount: number,
  orderId: string
) => {
  const upiId = "sultana9212@axl";
  const storeName = "JembeeKart";

  return `upi://pay?pa=${upiId}&pn=${storeName}&am=${amount}&cu=INR&tn=${orderId}`;
};

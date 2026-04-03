export const analyzeError = (log) => {
  let fix = "";
  let hindi = "";

  const data = JSON.stringify(log.data || "");

  if (data.includes("order_amount")) {
    fix = "order_amount: Number(totalAmount)";
    hindi = "Amount string me ja raha hai, use number me convert karo";
  }

  if (data.includes("customer_phone") === false) {
    fix = `customer_phone: address.phone || "9999999999"`;
    hindi = "Phone number missing hai";
  }

  if (data.includes('"image":""')) {
    fix = `image: item.image || "https://via.placeholder.com/150"`;
    hindi = "Image empty hai, default image do";
  }

  if (data.includes("CASHFREE")) {
    fix = `Vercel me CASHFREE_CLIENT_ID aur SECRET add karo`;
    hindi = "Cashfree env variable missing hai";
  }

  if (!fix) {
    fix = "Check console logs properly";
    hindi = "Error generic hai, detail check karo";
  }

  return { fix, hindi };
};

export const analyzeError = (log) => {
  let fix = "";
  let hindi = "";
  let where = "";

  const data = JSON.stringify(log.data || "");

  if (data.includes("<!DOCTYPE")) {
    fix = "API route check karo (/api/cashfree sahi hai?)";
    hindi = "Server HTML bhej raha hai, JSON nahi";
    where = "API route / fetch URL";
  }

  else if (data.includes('"image":""')) {
    fix = `image: item.image || "https://via.placeholder.com/150"`;
    hindi = "Image empty hai";
    where = "Checkout / Cart";
  }

  else if (!data.includes("customer_phone")) {
    fix = `customer_phone: address.phone || "9999999999"`;
    hindi = "Phone missing hai";
    where = "Checkout payload";
  }

  else if (data.includes("order_amount")) {
    fix = `order_amount: Number(total)`;
    hindi = "Amount string me hai";
    where = "Checkout payment";
  }

  else if (data.includes("CASHFREE")) {
    fix = `Vercel env add karo`;
    hindi = "Cashfree key missing hai";
    where = "Vercel settings";
  }

  else {
    fix = "Console check karo";
    hindi = "Unknown error";
    where = "General";
  }

  return { fix, hindi, where };
};

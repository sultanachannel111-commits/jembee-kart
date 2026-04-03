export const analyzeError = (log) => {
  let fix = "";
  let hindi = "";
  let where = "";

  const data = JSON.stringify(log.data || "");

  if (data.includes('"image":""')) {
    fix = `image: item.image || "https://via.placeholder.com/150"`;
    hindi = "Product image empty hai";
    where = "Checkout / Cart code";
  }

  else if (data.includes("order_amount")) {
    fix = `order_amount: Number(totalAmount)`;
    hindi = "Amount string me ja raha hai";
    where = "Checkout payment code";
  }

  else if (!data.includes("customer_phone")) {
    fix = `customer_phone: address.phone || "9999999999"`;
    hindi = "Phone number missing hai";
    where = "Customer details object";
  }

  else if (data.includes("CASHFREE")) {
    fix = `Vercel → Settings → Env Variables add karo`;
    hindi = "Cashfree key missing hai";
    where = "Vercel settings";
  }

  else {
    fix = "console.log check karo ya data validate karo";
    hindi = "Generic error hai";
    where = "Frontend/API";
  }

  return { fix, hindi, where };
};

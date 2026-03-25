export const sendCustomerWhatsApp = ({ items, total, customer }: any) => {

  const message = `✅ Order Confirmed!

🛍️ Items:
${items.map((i:any)=>`• ${i.name} x${i.quantity}`).join("\n")}

💰 Total: ₹${total}

📦 Your order is placed successfully!

Thank you ❤️`;

  window.open(
    `https://wa.me/${customer.phone}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
};


export const sendSellerWhatsApp = ({
  items,
  total,
  customer,
  sellerPhone
}: any) => {

  let message = `🔥 *New Order*\n\n`;

  items.forEach((i:any, idx:number)=>{
    message += `*${idx+1}. ${i.name}*\nQty: ${i.quantity}\n\n`;
  });

  message += `💰 Total: ₹${total}\n\n`;

  message += `👤 Customer:\n${customer.firstName}\n${customer.phone}\n${customer.city}`;

  window.open(
    `https://wa.me/${sellerPhone}?text=${encodeURIComponent(message)}`,
    "_blank"
  );
};

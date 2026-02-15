import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderEmail(
  customerEmail: string,
  orderId: string,
  productName: string,
  total: number
) {
  await resend.emails.send({
    from: "Store <onboarding@resend.dev>",
    to: customerEmail,
    subject: `Order Confirmation - ${orderId}`,
    html: `
      <h2>Order Confirmed ✅</h2>
      <p>Order ID: <strong>${orderId}</strong></p>
      <p>Product: ${productName}</p>
      <p>Total: ₹${total}</p>
      <p>Thank you for shopping with us.</p>
    `,
  });
}

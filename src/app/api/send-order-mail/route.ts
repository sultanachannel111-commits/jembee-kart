import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      customerEmail,
      productName,
      price,
      status,
      trackingId,
    } = body;

    if (!customerEmail || !productName || !price || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    /* 🔥 Create Transporter */
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    /* 🔥 Email Template */
    const htmlTemplate = `
      <div style="font-family: Arial; padding: 20px;">
        <h2 style="color:#e91e63;">JEMBEE KART 💖</h2>
        <p>Hello Customer,</p>

        <p>Your order has been updated:</p>

        <table style="border-collapse: collapse; width: 100%;">
          <tr>
            <td><strong>Product:</strong></td>
            <td>${productName}</td>
          </tr>
          <tr>
            <td><strong>Amount:</strong></td>
            <td>₹${price}</td>
          </tr>
          <tr>
            <td><strong>Status:</strong></td>
            <td>${status}</td>
          </tr>
          ${
            trackingId
              ? `
          <tr>
            <td><strong>Tracking ID:</strong></td>
            <td>${trackingId}</td>
          </tr>
          `
              : ""
          }
        </table>

        <br/>
        <p>Thank you for shopping with us 💕</p>

        <p style="font-size:12px;color:gray;">
          This is an automated email from Jembee Kart.
        </p>
      </div>
    `;

    /* 🔥 Send Mail */
    await transporter.sendMail({
      from: `"Jembee Kart" <${process.env.EMAIL_USER}>`,
      to: customerEmail,
      subject: `Order Update - ${productName}`,
      html: htmlTemplate,
    });

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
    });
  } catch (error: any) {
    console.error("Email Error:", error);

    return NextResponse.json(
      { error: "Email sending failed" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const { orderId, amount, customer } = body;

    // 🔍 DEBUG OBJECT
    let debug = {
      step: "start",
      env: {},
      payload: {},
      cashfree: {},
      error: null
    };

    // ✅ VALIDATION
    if (!orderId || !amount) {
      return NextResponse.json({
        success: false,
        reason: "INVALID INPUT",
        message: "orderId or amount missing",
        debug
      });
    }

    // ✅ ENV CHECK
    debug.env = {
      CLIENT_ID: process.env.CASHFREE_CLIENT_ID ? "OK" : "MISSING",
      SECRET: process.env.CASHFREE_CLIENT_SECRET ? "OK" : "MISSING",
      SITE: process.env.NEXT_PUBLIC_SITE_URL || "MISSING"
    };

    if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
      return NextResponse.json({
        success: false,
        reason: "ENV MISSING",
        debug
      });
    }

    // 🌐 CASHFREE URL
    const CASHFREE_URL =
      process.env.NODE_ENV === "production"
        ? "https://api.cashfree.com/pg/orders"
        : "https://sandbox.cashfree.com/pg/orders";

    // 📦 PAYLOAD
    const payload = {
      order_id: orderId,
      order_amount: Number(amount),
      order_currency: "INR",

      customer_details: {
        customer_id: customer?.uid || "guest_" + Date.now(),
        customer_name: customer?.firstName || "User",
        customer_email: customer?.email || "test@test.com",
        customer_phone: customer?.phone || "9999999999"
      },

      order_meta: {
        return_url:
          (process.env.NEXT_PUBLIC_SITE_URL || "") +
          `/payment-success?order_id=${orderId}`
      }
    };

    debug.payload = payload;

    // 🔥 CALL CASHFREE
    const response = await fetch(CASHFREE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": process.env.CASHFREE_CLIENT_ID,
        "x-client-secret": process.env.CASHFREE_CLIENT_SECRET,
        "x-api-version": "2022-09-01"
      },
      body: JSON.stringify(payload)
    });

    let data;

    // ✅ SAFE JSON PARSE
    try {
      data = await response.json();
    } catch (err) {
      const text = await response.text();

      debug.error = "INVALID JSON RESPONSE";
      debug.cashfree = text;

      return NextResponse.json({
        success: false,
        reason: "INVALID JSON",
        debug
      });
    }

    debug.cashfree = data;

    // ❌ CASHFREE ERROR
    if (!response.ok) {
      return NextResponse.json({
        success: false,
        reason: "CASHFREE ERROR",
        message: data?.message || "Unknown error",
        debug
      });
    }

    // ❌ NO SESSION ID
    if (!data.payment_session_id) {
      return NextResponse.json({
        success: false,
        reason: "NO SESSION ID",
        debug
      });
    }

    // ✅ SUCCESS
    return NextResponse.json({
      success: true,
      payment_session_id: data.payment_session_id,
      order_id: data.order_id,
      debug
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      reason: "SERVER CRASH",
      message: error.message
    });
  }
}

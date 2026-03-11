import { NextResponse } from "next/server";

export async function POST(req: Request) {

const body = await req.json();

const res = await fetch("https://api.cashfree.com/pg/orders", {
method: "POST",
headers: {
"Content-Type": "application/json",
"x-client-id": process.env.CASHFREE_CLIENT_ID!,
"x-client-secret": process.env.CASHFREE_CLIENT_SECRET!,
"x-api-version": "2022-09-01"
},
body: JSON.stringify({
order_id: "ORDER_" + Date.now(),
order_amount: body.amount,
order_currency: "INR",
customer_details: {
customer_id: "CUST_" + Date.now(),
customer_phone: body.phone
}
})
});

const data = await res.json();

return NextResponse.json(data);

}

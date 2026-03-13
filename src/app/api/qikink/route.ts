import { NextResponse } from "next/server";

export async function GET() {

const CLIENT_ID = "827265200202480";
const CLIENT_SECRET = "4216a1ee1ef57511ef9bf2d6c4cd83689a84e4a9881d50b301c347f42354dcc7";

try {

// STEP 1 - TOKEN
const tokenRes = await fetch(
"https://api.qikink.com/api/v1/oauth/token",
{
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify({
client_id: CLIENT_ID,
client_secret: CLIENT_SECRET,
grant_type: "client_credentials"
})
}
);

const tokenData = await tokenRes.json();

const accessToken = tokenData.access_token;

if (!accessToken) {
return NextResponse.json({ products: [] });
}


// STEP 2 - PRODUCTS
const productRes = await fetch(
"https://api.qikink.com/api/v1/catalog/products",
{
headers: {
Authorization: `Bearer ${accessToken}`
}
}
);

const productData = await productRes.json();

if (!productData || !productData.products) {
return NextResponse.json({ products: [] });
}


// STEP 3 - FORMAT PRODUCTS
const formatted = productData.products.map((p: any) => ({

id: p.id,
name: p.title || p.name,
price: p.retail_price || p.price,
image: p.images?.[0]?.src || "",
category: "Qikink"

}));


return NextResponse.json({
products: formatted
});

} catch (error) {

console.log("Qikink API Error:", error);

return NextResponse.json({
products: []
});

}

}

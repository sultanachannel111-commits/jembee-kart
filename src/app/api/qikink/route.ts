import { NextResponse } from "next/server";

export async function GET() {

const CLIENT_ID = "827265200202480";
const CLIENT_SECRET = "4216a1ee1ef57511ef9bf2d6c4cd83689a84e4a9881d50b301c347f42354dcc7";

try {

// STEP 1 - GET TOKEN
const tokenRes = await fetch(
"https://api.qikink.com/api/v1/oauth/token",
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
client_id:CLIENT_ID,
client_secret:CLIENT_SECRET,
grant_type:"client_credentials"
})
}
);

const tokenData = await tokenRes.json();
const accessToken = tokenData.access_token;

if(!accessToken){
return NextResponse.json({products:[]});
}


// STEP 2 - GET MY PRODUCTS
const productRes = await fetch(
"https://api.qikink.com/api/v1/products",
{
headers:{
Authorization:`Bearer ${accessToken}`
}
}
);

const productData = await productRes.json();

if(!productData || !productData.data){
return NextResponse.json({products:[]});
}


// STEP 3 - FORMAT PRODUCTS
const formatted = productData.data.map((p:any)=>({

id:p.id,
name:p.title || p.name,
price:p.retail_price || p.price,
image:p.images?.[0]?.src || "",
category:"Qikink"

}));

return NextResponse.json({
products:formatted
});

}catch(err){

console.log("Qikink API Error:",err);

return NextResponse.json({
products:[]
});

}

}

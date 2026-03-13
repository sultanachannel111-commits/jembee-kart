import { NextResponse } from "next/server";

export async function GET() {

const CLIENT_ID = "827265200202480";
const CLIENT_SECRET = "YOUR_CLIENT_SECRET";

try {

// TOKEN
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


// DESIGNS
const productRes = await fetch(
"https://api.qikink.com/api/v1/designs",
{
headers:{
Authorization:`Bearer ${accessToken}`
}
}
);

const productData = await productRes.json();

return NextResponse.json(productData);

}
catch(err){

return NextResponse.json({
error:"Qikink API failed"
});

}

}

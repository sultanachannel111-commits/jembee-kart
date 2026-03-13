import { NextResponse } from "next/server";

export async function GET() {

const CLIENT_ID = "827265200202480";
const CLIENT_SECRET = "4216a1ee1ef57511ef9bf2d6c4cd83689a84e4a9881d50b301c347f42354dcc7";

try {

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


// TEST ENDPOINT
const res = await fetch(
"https://api.qikink.com/api/v1/products",
{
headers:{
Authorization:`Bearer ${accessToken}`
}
}
);

const data = await res.json();

return NextResponse.json({
token:tokenData,
api:data
});

}
catch(error){

return NextResponse.json({
error:"API FAILED"
});

}

}

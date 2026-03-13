import { NextResponse } from "next/server";

export async function GET() {

  try {

    const tokenRes = await fetch(
      "https://api.qikink.com/api/v1/oauth/token",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/x-www-form-urlencoded"
        },
        body:new URLSearchParams({
          client_id:process.env.QIKINK_CLIENT_ID || "",
          client_secret:process.env.QIKINK_CLIENT_SECRET || "",
          grant_type:"client_credentials"
        })
      }
    );

    const tokenData = await tokenRes.json();

    const token = tokenData.access_token;

    const res = await fetch(
      "https://api.qikink.com/api/v1/catalog/designs",
      {
        headers:{
          Authorization:`Bearer ${token}`
        }
      }
    );

    const data = await res.json();

    return NextResponse.json({
      tokenData,
      designs:data
    });

  } catch(e){

    return NextResponse.json({
      error:String(e)
    });

  }

}

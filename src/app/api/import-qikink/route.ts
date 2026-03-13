import { NextResponse } from "next/server";

export async function GET() {

  try {

    const res = await fetch(
      "https://api.qikink.com/api/v1/oauth/token",
      {
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          client_id:process.env.QIKINK_CLIENT_ID,
          client_secret:process.env.QIKINK_CLIENT_SECRET,
          grant_type:"client_credentials"
        })
      }
    );

    const data = await res.json();

    return NextResponse.json(data);

  } catch(e){

    return NextResponse.json({
      error:String(e)
    });

  }

}

import { NextResponse } from "next/server";

export async function POST(req:Request){

const body = await req.json();

const {phone,orderId} = body;

const trackingLink = `https://yourdomain.com/track/${orderId}`;

await fetch("https://www.fast2sms.com/dev/bulkV2",{

method:"POST",

headers:{
authorization:process.env.FAST2SMS_API_KEY!,
"Content-Type":"application/json"
},

body:JSON.stringify({

route:"q",

message:`Track your order here ${trackingLink}`,

language:"english",

numbers:phone

})

});

return NextResponse.json({success:true});

}

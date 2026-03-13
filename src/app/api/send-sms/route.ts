import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){

try{

const body = await req.json();

const { phone, orderId } = body;

if(!phone || !orderId){

return NextResponse.json({
success:false,
error:"Missing phone or orderId"
});

}

const message = `JembeeKart Order Confirmed 🎉

Order ID: ${orderId}

Track Order:
${process.env.NEXT_PUBLIC_BASE_URL}/track/${orderId}

Thank you for shopping ❤️`;

const response = await fetch("https://www.fast2sms.com/dev/bulkV2",{

method:"POST",

headers:{
"authorization": process.env.FAST2SMS_API_KEY!,
"Content-Type":"application/json"
},

body:JSON.stringify({

route:"v3",

sender_id:"TXTIND",

message:message,

language:"english",

flash:0,

numbers:phone

})

});

const data = await response.json();

return NextResponse.json({
success:true,
data
});

}catch(error:any){

return NextResponse.json({
success:false,
error:error.message
});

}

}

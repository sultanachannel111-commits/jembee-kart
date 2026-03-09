export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {

try{

const { question } = await req.json();

// question empty check
if(!question){

return NextResponse.json(
{ error: "Question is required" },
{ status: 400 }
);

}

const openai = new OpenAI({
apiKey: process.env.OPENAI_API_KEY!,
});

const completion = await openai.chat.completions.create({

model: "gpt-4o-mini",

messages:[
{
role:"system",
content:"You are a helpful ecommerce product assistant."
},
{
role:"user",
content:question
}
]

});

return NextResponse.json({
answer: completion.choices[0].message.content
});

}catch(error){

console.error("AI Error:",error);

return NextResponse.json(
{ error:"AI request failed" },
{ status:500 }
);

}

}

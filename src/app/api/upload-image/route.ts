import { NextResponse } from "next/server";

export async function POST(req: Request) {

const { fileName, base64 } = await req.json();

const token = process.env.GITHUB_TOKEN;
const owner = process.env.GITHUB_REPO_OWNER;
const repo = process.env.GITHUB_REPO_NAME;

await fetch(
`https://api.github.com/repos/${owner}/${repo}/contents/public/${fileName}`,
{
method:"PUT",
headers:{
Authorization:`Bearer ${token}`,
"Content-Type":"application/json"
},
body:JSON.stringify({
message:"upload product image",
content:base64
})
}
);

return NextResponse.json({ success:true });

}

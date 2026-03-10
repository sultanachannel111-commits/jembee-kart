import { NextResponse } from "next/server";

export async function POST(req: Request) {

const { user, pass } = await req.json();

if (
user === process.env.ADMIN_USER &&
pass === process.env.ADMIN_PASS
) {

const res = NextResponse.json({ success: true });

res.cookies.set("admin", "true", {
httpOnly: true,
path: "/",
});

return res;

}

return NextResponse.json(
{ success: false },
{ status: 401 }
);

}

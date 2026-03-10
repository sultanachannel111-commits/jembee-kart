"use client";

import { useRouter } from "next/navigation";

export default function SellerSignupPage(){

const router = useRouter();

return(

<div className="p-10">

<h1>Seller Signup Page</h1>

<button onClick={()=>router.push("/seller/login")}>
Go to Login
</button>

</div>

);

}

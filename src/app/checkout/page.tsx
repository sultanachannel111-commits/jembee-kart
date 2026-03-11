"use client";

import { Suspense } from "react";
import CheckoutForm from "./CheckoutForm";

export default function CheckoutPage() {

return (

<Suspense fallback={<div className="p-6">Loading Checkout...</div>}>

<CheckoutForm />

</Suspense>

);

}

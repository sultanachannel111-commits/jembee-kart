"use client";

import { Suspense } from "react";
import SuccessInner from "./SuccessInner";

export default function Page(){
  return (
    <Suspense fallback={<div className="p-5">Loading...</div>}>
      <SuccessInner />
    </Suspense>
  );
}

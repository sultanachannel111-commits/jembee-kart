"use client";

import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function OrderSuccessPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <Header />

      <div className="container mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          🎉 Order Placed Successfully!
        </h1>

        <p className="mb-6">
          Thank you for shopping with us.
        </p>

        <Button onClick={() => router.push("/")}>
          Back to Home
        </Button>
      </div>
    </div>
  );
}

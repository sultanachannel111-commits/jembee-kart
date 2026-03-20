"use client";

import Link from "next/link";

export default function Footer() {

  return (

    <div className="bg-[#131A22] text-white mt-10">

      {/* TOP GRID */}
      <div className="grid grid-cols-2 gap-6 p-6 text-sm">

        {/* COMPANY */}
        <div>
          <h2 className="font-semibold mb-3 text-gray-300">
            About JembeeKart
          </h2>

          <div className="flex flex-col gap-2 text-gray-400">
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/policy">Terms & Conditions</Link>
            <Link href="/policy">Privacy Policy</Link>
          </div>
        </div>

        {/* HELP */}
        <div>
          <h2 className="font-semibold mb-3 text-gray-300">
            Customer Service
          </h2>

          <div className="flex flex-col gap-2 text-gray-400">
            <Link href="/policy">Return & Refund Policy</Link>
            <Link href="/policy">Shipping Policy</Link>
            <Link href="/policy">Cancellation Policy</Link>
            <Link href="/track">Track Order</Link>
          </div>
        </div>

      </div>

      {/* DISCLAIMER */}
      <div className="px-6 pb-4 text-xs text-gray-400 leading-5">

        <p>
          All orders are fulfilled and shipped by our trusted production partner Qikink.
          JembeeKart acts as a seller platform and does not manufacture products directly.
        </p>

        <p className="mt-2">
          Delivery timelines, returns, and refunds are subject to Qikink's fulfillment policies.
        </p>

      </div>

      {/* DIVIDER */}
      <div className="border-t border-gray-700"></div>

      {/* BOTTOM */}
      <div className="text-center text-gray-400 text-xs py-4">

        <p>© {new Date().getFullYear()} JembeeKart</p>

        <p className="mt-1">
          Powered by Qikink Dropshipping
        </p>

      </div>

    </div>

  );

}

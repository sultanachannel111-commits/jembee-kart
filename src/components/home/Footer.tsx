"use client";

import Link from "next/link";

export default function Footer() {

  return (

    <div className="bg-black text-white mt-10">

      {/* TOP SECTION */}
      <div className="p-6 grid grid-cols-2 gap-6 text-sm">

        <div>
          <h2 className="font-bold mb-3 text-gray-300">Get to Know Us</h2>

          <div className="flex flex-col gap-2 text-gray-400">
            <Link href="/about">About Us</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/policy">Return & Refund</Link>
            <Link href="/policy">Terms & Conditions</Link>
          </div>
        </div>

        <div>
          <h2 className="font-bold mb-3 text-gray-300">Help</h2>

          <div className="flex flex-col gap-2 text-gray-400">
            <Link href="/policy">Shipping Policy</Link>
            <Link href="/policy">Privacy Policy</Link>
            <Link href="/policy">Cancellation Policy</Link>
            <Link href="/track">Track Order</Link>
          </div>
        </div>

      </div>

      {/* DIVIDER */}
      <div className="border-t border-gray-700"></div>

      {/* BOTTOM */}
      <div className="text-center text-gray-400 text-xs py-4">

        <p>© {new Date().getFullYear()} JembeeKart. All rights reserved.</p>

        <p className="mt-1">
          Powered by Qikink Dropshipping
        </p>

      </div>

    </div>

  );

}

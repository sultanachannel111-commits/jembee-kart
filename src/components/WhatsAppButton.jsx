"use client";

import { useEffect, useState } from "react";

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);

  const phoneNumber = "917061369212";
  const message = "Hello, mujhe product ke bare me jankari chahiye";

  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  useEffect(() => {
    const show = setTimeout(() => setShowTooltip(true), 2000);
    const hide = setTimeout(() => setShowTooltip(false), 5000);

    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  return (
    <>
      {/* 💬 Tooltip */}
      {showTooltip && (
        <div className="fixed bottom-44 right-6 z-50 bg-black text-white text-xs px-3 py-2 rounded-lg shadow-lg transition-all duration-300">
          Chat with us 👋
          <div className="absolute bottom-[-6px] right-3 w-3 h-3 bg-black rotate-45"></div>
        </div>
      )}

      {/* 🟢 WhatsApp Button */}
      <a
        href={whatsappURL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        onClick={() => setShowTooltip(false)}
        className="fixed bottom-28 right-4 z-50 flex items-center justify-center
                   w-16 h-16 rounded-full bg-green-500
                   shadow-[0_10px_30px_rgba(34,197,94,0.7)]
                   hover:scale-110 hover:shadow-[0_12px_35px_rgba(34,197,94,1)]
                   active:scale-95
                   transition-all duration-300"
      >
        {/* WhatsApp SVG */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          className="w-8 h-8 fill-white"
        >
          <path d="M16.001 3C9.373 3 4 8.373 4 15.001c0 2.65.865 5.098 2.329 7.076L4 29l7.122-2.288A11.94 11.94 0 0016.001 27C22.627 27 28 21.627 28 15.001 28 8.373 22.627 3 16.001 3z" />
        </svg>
      </a>
    </>
  );
}

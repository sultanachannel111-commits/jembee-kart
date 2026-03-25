"use client";

import { useEffect, useState } from "react";

export default function WhatsAppButton() {

  const [showTooltip, setShowTooltip] = useState(false);

  const phoneNumber = "917061369212";

  const message =
    "Hello 👋\nMujhe product ke bare me jankari chahiye";

  const whatsappURL =
    `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  useEffect(() => {
    const show = setTimeout(() => setShowTooltip(true), 2000);
    const hide = setTimeout(() => setShowTooltip(false), 6000);

    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  return (
    <>
      {/* 💬 TOOLTIP */}
      {showTooltip && (
        <div className="fixed bottom-28 right-4 z-[9999]
                        bg-black text-white text-xs
                        px-3 py-2 rounded-lg shadow-lg animate-bounce">
          Chat with us 👋
          <div className="absolute bottom-[-6px] right-3 w-3 h-3 bg-black rotate-45"></div>
        </div>
      )}

      {/* 🟠 MAIN BUTTON */}
      <a
        href={whatsappURL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => setShowTooltip(false)}
        className="fixed bottom-16 right-4 z-[9999]
                   flex items-center gap-2
                   bg-orange-500 text-white
                   px-4 py-3 rounded-full
                   shadow-[0_10px_30px_rgba(255,140,0,0.6)]
                   hover:scale-110 active:scale-95
                   transition-all duration-300"
      >
        {/* ICON */}
        <span className="text-lg">💬</span>

        {/* TEXT */}
        <span className="text-sm font-medium">
          Chat
        </span>

        {/* ONLINE DOT */}
        <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
      </a>
    </>
  );
}

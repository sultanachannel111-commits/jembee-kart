"use client";

export default function WhatsAppButton() {
  const phoneNumber = "917061369212"; // 👉 apna number daalo

  const message = "Hello, mujhe product ke bare me jankari chahiye";
  const whatsappURL = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a
      href={whatsappURL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-5 right-5 z-50 flex items-center justify-center
                 w-14 h-14 rounded-full bg-green-500 text-white text-2xl
                 shadow-lg hover:scale-110 transition-all duration-300"
    >
      💬
    </a>
  );
}

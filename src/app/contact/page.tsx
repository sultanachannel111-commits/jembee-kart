"use client";

export default function ContactPage() {
  return (
    <div className="min-h-screen p-5 bg-gray-100">

      <div className="max-w-xl mx-auto bg-white p-6 rounded-2xl shadow">

        <h1 className="text-2xl font-bold mb-4">📞 Contact Us</h1>

        <p className="text-gray-600 mb-4">
          Agar aapko koi problem ho ya help chahiye, to humse contact kare 👇
        </p>

        {/* EMAIL */}
        <div className="bg-gray-50 p-4 rounded-xl mb-3">
          <p className="font-semibold">📧 Email</p>
          <a
            href="mailto:jembeekart@gmail.com"
            className="text-blue-600"
          >
            jembeekart@gmail.com
          </a>
        </div>

        {/* WHATSAPP */}
        <div className="bg-gray-50 p-4 rounded-xl">
          <p className="font-semibold">💬 WhatsApp</p>
          <a
            href="https://wa.me/917061369212"
            className="text-green-600"
          >
            Chat on WhatsApp
          </a>
        </div>

      </div>

    </div>
  );
}

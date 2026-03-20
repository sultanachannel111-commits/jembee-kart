"use client";

export default function PolicyPage() {

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-4">

      <div className="max-w-3xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-3xl shadow-lg p-6 mb-4 text-center">
          <h1 className="text-3xl font-bold">
            Return, Refund & Shipping Policy
          </h1>
          <p className="text-gray-500 mt-2 text-sm">
            Last updated: {new Date().toDateString()}
          </p>
        </div>

        {/* CARD */}
        <div className="bg-white rounded-3xl shadow-lg p-6 space-y-6">

          {/* RETURN POLICY */}
          <section>
            <h2 className="text-xl font-bold mb-2 text-black">
              🔁 Return Policy
            </h2>

            <p className="text-gray-700">
              We follow a strict quality control process to ensure the best
              experience for our customers. However, returns are only accepted
              under specific conditions.
            </p>

            <ul className="list-disc ml-5 mt-2 text-gray-700 space-y-1">
              <li>Returns are accepted only for damaged or defective items.</li>
              <li>Returns are accepted if a wrong product is delivered.</li>
              <li>Issues must be reported within 24–48 hours of delivery.</li>
              <li>Unboxing video/photo proof is required for claims.</li>
            </ul>

            <p className="mt-2 text-red-500 font-medium">
              ❌ Returns are NOT accepted for size issues, color preference, or
              change of mind.
            </p>
          </section>

          {/* REFUND POLICY */}
          <section>
            <h2 className="text-xl font-bold mb-2 text-black">
              💸 Refund Policy
            </h2>

            <p className="text-gray-700">
              We do not offer refunds in most cases. Instead, eligible issues
              are resolved through replacement.
            </p>

            <ul className="list-disc ml-5 mt-2 text-gray-700 space-y-1">
              <li>Refunds are only issued in rare cases where replacement is not possible.</li>
              <li>Approved refunds will be processed to the original payment method.</li>
              <li>Refund processing may take 5–7 business days.</li>
            </ul>
          </section>

          {/* SHIPPING POLICY */}
          <section>
            <h2 className="text-xl font-bold mb-2 text-black">
              📦 Shipping Policy
            </h2>

            <ul className="list-disc ml-5 text-gray-700 space-y-1">
              <li>Orders are processed within 2–5 business days.</li>
              <li>Delivery usually takes 5–10 business days across India.</li>
              <li>Tracking details will be shared once shipped.</li>
            </ul>
          </section>

          {/* COD POLICY */}
          <section>
            <h2 className="text-xl font-bold mb-2 text-black">
              💵 Cash on Delivery (COD)
            </h2>

            <ul className="list-disc ml-5 text-gray-700 space-y-1">
              <li>COD is available only after successful prepaid orders.</li>
              <li>We reserve the right to cancel COD orders in case of suspicious activity.</li>
              <li>Repeated order rejections may lead to COD restrictions.</li>
            </ul>
          </section>

          {/* RTO POLICY */}
          <section>
            <h2 className="text-xl font-bold mb-2 text-black">
              🚚 Return To Origin (RTO)
            </h2>

            <p className="text-gray-700">
              If a customer refuses delivery or is unreachable, the order is
              returned to our warehouse (RTO).
            </p>

            <ul className="list-disc ml-5 mt-2 text-gray-700 space-y-1">
              <li>RTO orders can be reshipped upon request.</li>
              <li>Repeated RTO cases may lead to COD restrictions.</li>
            </ul>
          </section>

          {/* AGREEMENT */}
          <section>
            <h2 className="text-xl font-bold mb-2 text-black">
              📜 Customer Agreement
            </h2>

            <p className="text-gray-700">
              By placing an order on our platform, you agree to the terms
              mentioned in this policy including returns, refunds, and shipping
              conditions.
            </p>
          </section>

        </div>

      </div>

    </div>

  );

}

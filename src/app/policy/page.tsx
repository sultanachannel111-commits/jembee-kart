export default function PolicyPage(){

  return(

    <div className="max-w-3xl mx-auto p-6 pt-[100px]">

      <h1 className="text-3xl font-bold mb-6">
        Policies
      </h1>

      {/* SHIPPING */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Shipping Policy
        </h2>

        <p className="text-gray-600 text-sm">
          Orders are processed within 2-4 business days. Delivery usually takes
          5-10 business days depending on location. All products are fulfilled
          by Qikink.
        </p>
      </section>

      {/* RETURN */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Return & Refund Policy
        </h2>

        <p className="text-gray-600 text-sm">
          Returns are only accepted in case of damaged, defective, or incorrect
          products. Customers must raise a request within 48 hours of delivery.
          Refunds are processed after verification.
        </p>
      </section>

      {/* CANCELLATION */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Cancellation Policy
        </h2>

        <p className="text-gray-600 text-sm">
          Orders can only be cancelled before they are processed. Once production
          has started, cancellation is not possible.
        </p>
      </section>

      {/* COD */}
      <section className="mb-6">
        <h2 className="text-xl font-semibold mb-2">
          Cash on Delivery (COD)
        </h2>

        <p className="text-gray-600 text-sm">
          COD is available only for eligible customers after successful prepaid
          order history. Additional charges may apply.
        </p>
      </section>

      {/* DISCLAIMER */}
      <section>
        <h2 className="text-xl font-semibold mb-2">
          Disclaimer
        </h2>

        <p className="text-gray-600 text-sm">
          JembeeKart acts as a reseller platform. All products are printed,
          packed, and shipped by Qikink.
        </p>
      </section>

    </div>

  );

}

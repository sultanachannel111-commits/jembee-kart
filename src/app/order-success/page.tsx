export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center">
        <h1 className="text-2xl font-bold text-green-600">
          ✅ Order Placed Successfully
        </h1>
        <p className="mt-3 text-gray-600">
          Your order has been received.
        </p>
        <p className="mt-2 text-gray-500">
          You can track your order anytime.
        </p>
      </div>
    </div>
  );
}

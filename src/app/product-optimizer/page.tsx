import Header from "@/components/header";

export default function ProductOptimizerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100">
      <Header />

      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">
          Product Optimizer
        </h1>

        <p className="text-gray-600">
          AI based product title & description optimization tool.
        </p>
      </div>
    </div>
  );
}

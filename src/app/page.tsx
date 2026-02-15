import Header from "@/components/header";

export default function HomePage() {
  return (
    <>
      <Header />
      
      <main className="flex items-center justify-center min-h-[80vh]">
        <div className="bg-white p-10 rounded-2xl shadow-xl text-center">
          <h1 className="text-3xl font-bold mb-2">
            JEMBEE STORE 🛍️
          </h1>
          <p className="text-gray-600 mb-6">
            Premium WhatsApp Based Store
          </p>
        </div>
      </main>
    </>
  );
}

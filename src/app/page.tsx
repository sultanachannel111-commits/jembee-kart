export default function HomePage() {
  return (
    <main className="min-h-screen">

      {/* Hero Section */}
      <section className="h-[500px] bg-red-600 flex items-center justify-center text-white text-center">
        <div>
          <h1 className="text-4xl md:text-6xl font-bold">
            Welcome to JEMBEE STORE 🚀
          </h1>
          <p className="mt-4 text-lg">
            Premium WhatsApp Based Shopping Experience
          </p>
        </div>
      </section>

      {/* Category Section */}
      <section className="py-16 px-6 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center">
          Shop by Category
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-xl shadow text-center">
            Sneakers
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            Fashion
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            Watches
          </div>
          <div className="bg-white p-6 rounded-xl shadow text-center">
            Accessories
          </div>
        </div>
      </section>

    </main>
  );
}

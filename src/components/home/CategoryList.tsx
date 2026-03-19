"use client";

export default function CategoryList({
  categories,
  selectedCategory,
  setSelectedCategory
}) {

  return (
    <div className="flex gap-4 overflow-x-auto py-3 px-2 no-scrollbar">

      {categories.map((cat) => (

        <div
          key={cat.id}
          onClick={() => setSelectedCategory(cat.name)}
          className="flex flex-col items-center cursor-pointer min-w-[80px] transition-all duration-300"
        >

          {/* 🔥 ICON BOX */}
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center
            transition-all duration-300

            ${
              selectedCategory === cat.name
                ? "bg-green-500 scale-110 shadow-[0_8px_25px_rgba(34,197,94,0.6)]"
                : "bg-gray-100"
            }
            `}
          >

            {cat.image && (
              <img
                src={cat.image}
                className="w-full h-full rounded-full object-cover"
              />
            )}

          </div>

          {/* 📝 TEXT */}
          <span
            className={`text-xs mt-2 transition-all duration-300
            ${
              selectedCategory === cat.name
                ? "text-green-600 scale-105 font-semibold"
                : "text-gray-500"
            }
            `}
          >
            {cat.name}
          </span>

        </div>

      ))}

    </div>
  );
}

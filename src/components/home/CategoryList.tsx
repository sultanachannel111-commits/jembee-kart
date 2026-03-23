"use client";

export default function CategoryList({
  categories,
  selectedCategory,
  setSelectedCategory
}) {

  return (
    <div className="flex gap-4 overflow-x-auto py-3 px-2 no-scrollbar">

      {categories.map((cat) => {

        const isActive = selectedCategory === cat.name;

        return (
          <div
            key={cat.id}
            onClick={() => setSelectedCategory(cat.name)}
            className="flex flex-col items-center cursor-pointer min-w-[80px] transition-all duration-300"
          >

            {/* 🔥 ICON BOX */}
            <div
              style={{
                background: isActive
                  ? cat.bgColor || "#22c55e"
                  : "#f3f4f6",

                boxShadow: isActive
                  ? `0 8px 25px ${cat.bgColor || "#22c55e"}80`
                  : "none"
              }}
              className={`w-16 h-16 rounded-full flex items-center justify-center
              transition-all duration-300
              ${isActive ? "scale-110" : ""}
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
              style={{
                color: isActive
                  ? cat.bgColor || "#22c55e"
                  : "#6b7280"
              }}
              className={`text-xs mt-2 transition-all duration-300
              ${isActive ? "scale-105 font-semibold" : ""}
              `}
            >
              {cat.name}
            </span>

          </div>
        );
      })}

    </div>
  );
}

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
            className="flex flex-col items-center cursor-pointer min-w-[90px] transition-all duration-300"
          >

            {/* 🔥 FLIPKART STYLE BOX */}
            <div
              style={{
                background: isActive
                  ? cat.gradient || cat.bgColor || "#22c55e"
                  : "#ffffff",

                boxShadow: isActive
                  ? `0 10px 30px ${cat.bgColor || "#22c55e"}55`
                  : "0 4px 10px rgba(0,0,0,0.05)"
              }}
              className={`
                w-20 h-20 rounded-2xl flex items-center justify-center
                transition-all duration-300 border
                ${isActive ? "scale-110 border-transparent" : "border-gray-200"}
              `}
            >

              {/* 🔥 IMAGE */}
              {cat.image && (
                <img
                  src={cat.image}
                  className="w-12 h-12 object-contain"
                />
              )}

            </div>

            {/* 📝 NAME */}
            <span
              style={{
                color: isActive
                  ? cat.bgColor || "#22c55e"
                  : "#6b7280"
              }}
              className={`text-xs mt-2 text-center transition-all duration-300
              ${isActive ? "font-semibold scale-105" : ""}
              `}
            >
              {cat.name}
            </span>

            {/* 🔥 ACTIVE UNDERLINE */}
            {isActive && (
              <div
                style={{
                  background: cat.bgColor || "#22c55e"
                }}
                className="h-1 w-6 rounded-full mt-1"
              />
            )}

          </div>
        );
      })}

    </div>
  );
}

          }}
          className="w-full mt-3 bg-white text-green-600 py-2 rounded-xl font-semibold"
        >
          📲 Share Store
        </button>

      </div>

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-500">
          Loading products...
        </p>
      )}

      {/* EMPTY */}
      {!loading && products.length === 0 && (
        <p className="text-center text-red-500">
          No products found ❌
        </p>
      )}

      {/* PRODUCTS */}
      <div className="grid grid-cols-2 gap-4">

        {products.map((p)=>{

          const price =
            p?.variations?.[0]?.sizes?.[0]?.sellPrice ||
            p.price ||
            0;

          const image =
            p?.variations?.[0]?.images?.main ||
            p.image ||
            "/no-image.png";

          return(
            <div
              key={p.id}
              className="bg-white p-3 rounded-2xl shadow"
            >

              <img
                src={image}
                className="h-32 w-full object-cover rounded-xl"
              />

              <p className="font-semibold mt-2 text-sm line-clamp-2">
                {p.name}
              </p>

              <p className="text-green-600 font-bold mt-1">
                ₹{price}
              </p>

              <button
                onClick={()=>window.location.href=`/product/${p.id}`}
                className="w-full mt-2 bg-blue-600 text-white py-2 rounded-xl text-sm"
              >
                View Product
              </button>

            </div>
          );
        })}

      </div>

    </div>
  );
}

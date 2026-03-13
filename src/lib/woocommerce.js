export const WC_URL = "https://jembeekart.kesug.com";

export const WC_KEY = "ck_4d09fe774a770b4a1f6a84b038a3f1e44f27bb72";
export const WC_SECRET = "cs_87340e6834b6f0c2fc0feb0e54238c7c93a96a04";

export async function getProducts() {
  const res = await fetch(
    `${WC_URL}/wp-json/wc/v3/products?consumer_key=${WC_KEY}&consumer_secret=${WC_SECRET}`,
    {
      cache: "no-store",
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

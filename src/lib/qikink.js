export async function getQikinkProducts() {
  const res = await fetch("https://api.qikink.com/api/v1/products", {
    headers: {
      Authorization: "Bearer YOUR_API_KEY",
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  return data;
}

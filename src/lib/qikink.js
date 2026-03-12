export async function getQikinkProducts() {
  const res = await fetch("https://api.qikink.com/api/v1/products", {
    headers: {
      Authorization: "Bearer 4216a1ee1ef57511ef9bf2d6c4cd83689a84e4a9881d50b301c347f42354dcc7",
      "Content-Type": "application/json",
    },
  });

  const data = await res.json();
  return data;
}

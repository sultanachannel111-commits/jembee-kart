export async function getQikinkProducts() {

  const tokenRes = await fetch("https://api.qikink.com/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      client_id: "827265200202480",
      client_secret: "4216a1ee1ef57511ef9bf2d6c4cd83689a84e4a9881d50b301c347f42354dcc7",
      grant_type: "client_credentials"
    })
  });

  const tokenData = await tokenRes.json();

  const res = await fetch("https://api.qikink.com/api/v1/products", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`
    }
  });

  return await res.json();
}

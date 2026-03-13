export async function getQikinkProducts() {

  const CLIENT_ID = "827265200202480";
  const CLIENT_SECRET = "4216a1ee1ef57511ef9bf2d6c4cd83689a84e4a9881d50b301c347f42354dcc7";

  const tokenRes = await fetch("https://api.qikink.com/api/v1/oauth/token",{
    method:"POST",
    headers:{ "Content-Type":"application/json"},
    body:JSON.stringify({
      client_id:CLIENT_ID,
      client_secret:CLIENT_SECRET,
      grant_type:"client_credentials"
    })
  });

  const tokenData = await tokenRes.json();

  console.log("TOKEN DATA:",tokenData);

  const accessToken = tokenData.access_token;

  const res = await fetch("https://api.qikink.com/api/v1/catalog/products",{
    headers:{
      Authorization:`Bearer ${accessToken}`
    }
  });

  const data = await res.json();

  console.log("PRODUCT API DATA:",data);

  return data.products || [];

}

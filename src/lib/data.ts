export async function getProducts(): Promise<Product[]> {
  const productsCol = collection(db, "testproduct1"); // 👈 yaha change

  const productSnapshot = await getDocs(productsCol);

  const productList = productSnapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  } as Product));

  return productList;
}

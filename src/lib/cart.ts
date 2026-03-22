import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { getAuth } from "firebase/auth";

export async function addToCart(product: any) {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    alert("Please login first");
    return;
  }

  const cartRef = doc(db, "cart", user.uid);
  const snap = await getDoc(cartRef);

  let products: any[] = [];

  if (snap.exists()) {
    products = snap.data().products || [];
  }

  // 🔍 FIND PRODUCT
  const index = products.findIndex(
    (item) =>
      item.productId === product.id &&
      item.size === (product.selectedSize?.size || product.size)
  );

  // 🔥 FINAL PRICE FIX
  const finalPrice =
    Number(product.selectedSize?.sellPrice) ||
    Number(product.selectedSize?.price) ||
    Number(product.sellPrice) ||
    Number(product.price) ||
    0;

  // 🧾 CLEAN PRODUCT DATA
  const newItem = {
    productId: product.id,
    name: product.name,
    image:
      product.image ||
      product.images?.[0] ||
      product.variations?.[0]?.images?.main ||
      "",

    size: product.selectedSize?.size || product.size || null,
    price: finalPrice,
    quantity: 1,
  };

  // 🔄 UPDATE OR ADD
  if (index > -1) {
    products[index].quantity += 1;

    // 🔥 ALWAYS UPDATE PRICE
    products[index].price = finalPrice;
  } else {
    products.push(newItem);
  }

  await setDoc(cartRef, { products });

  alert("Added to cart ✅");
}

// 🛒 GET CART
export async function getCart() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) return [];

  const snap = await getDoc(doc(db, "cart", user.uid));

  return snap.exists() ? snap.data().products || [] : [];
}

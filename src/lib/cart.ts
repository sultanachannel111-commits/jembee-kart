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

  const index = products.findIndex(
    (item) => item.qikinkProductId === product.qikinkProductId
  );

  if (index > -1) {
    products[index].quantity += 1;
  } else {
    products.push({
      ...product,
      quantity: 1,
    });
  }

  await setDoc(cartRef, { products });

  alert("Added to cart ✅");
}

export async function getCart() {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) return [];

  const snap = await getDoc(doc(db, "cart", user.uid));
  return snap.exists() ? snap.data().products : [];
}

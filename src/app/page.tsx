const placeOrder = async (product: any) => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      setMessage("Please login first 💖");
      return;
    }

    if (!product.qikinkProductId) {
      setMessage("Qikink Product ID missing ❌");
      return;
    }

    setMessage("Sending order to Qikink... ⏳");

    // 🔹 1️⃣ Firestore me order save karo
    const orderRef = await addDoc(collection(db, "orders"), {
      productId: product.id,
      productName: product.name,
      price: product.price,
      userId: user.uid,
      status: "Processing",
      createdAt: new Date(),
    });

    // 🔹 2️⃣ Qikink API call karo
    const response = await fetch("/api/qikink/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        order_id: orderRef.id,
        shipping_address: {
          name: user.displayName || "Customer Name",
          address1: "Test Address Line 1",
          city: "Delhi",
          state: "Delhi",
          pincode: "110001",
          country: "India",
          phone: "9999999999",
        },
        order_items: [
          {
            product_id: product.qikinkProductId,
            quantity: 1,
          },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error("Qikink order failed");
    }

    // 🔹 3️⃣ Order success update
    await addDoc(collection(db, "orders"), {
      qikinkResponse: data,
    });

    setMessage("Order placed successfully 💕");
  } catch (error) {
    console.error(error);
    setMessage("Order failed ❌");
  }
};

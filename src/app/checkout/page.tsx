"use client";

import { useState } from "react";

export default function CheckoutPage() {

  const [loading, setLoading] = useState(false);

  const [customer, setCustomer] = useState({
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    email: ""
  });

  const product = {
    name: "Custom T-shirt",
    sku: "TSHIRT001",
    printTypeId: "1",
    sellingPrice: 499,
    designLink: "https://example.com/design.png",
    mockupLink: "https://example.com/mockup.png"
  };

  const placeOrder = async () => {

    setLoading(true);

    const res = await fetch("/api/qikink/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        product,
        customer,
        paymentMethod: "ONLINE"
      })
    });

    const data = await res.json();

    setLoading(false);

    if (data.success) {

      alert("Order placed successfully");

    } else {

      alert("Order failed");

    }
  };

  return (
    <div className="p-6">

      <h1 className="text-xl font-bold mb-4">
        Checkout
      </h1>

      <input
        placeholder="First Name"
        onChange={(e) =>
          setCustomer({ ...customer, firstName: e.target.value })
        }
      />

      <input
        placeholder="Last Name"
        onChange={(e) =>
          setCustomer({ ...customer, lastName: e.target.value })
        }
      />

      <input
        placeholder="Address"
        onChange={(e) =>
          setCustomer({ ...customer, address: e.target.value })
        }
      />

      <input
        placeholder="City"
        onChange={(e) =>
          setCustomer({ ...customer, city: e.target.value })
        }
      />

      <input
        placeholder="State"
        onChange={(e) =>
          setCustomer({ ...customer, state: e.target.value })
        }
      />

      <input
        placeholder="Pin Code"
        onChange={(e) =>
          setCustomer({ ...customer, zip: e.target.value })
        }
      />

      <input
        placeholder="Phone"
        onChange={(e) =>
          setCustomer({ ...customer, phone: e.target.value })
        }
      />

      <input
        placeholder="Email"
        onChange={(e) =>
          setCustomer({ ...customer, email: e.target.value })
        }
      />

      <button
        onClick={placeOrder}
        className="bg-pink-500 text-white px-6 py-2 rounded mt-4"
      >
        {loading ? "Processing..." : "Place Order"}
      </button>

    </div>
  );
}

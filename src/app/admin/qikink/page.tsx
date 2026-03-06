"use client";

import { useState } from "react";

export default function QikinkPage() {

  const [productName,setProductName] = useState("");
  const [customerName,setCustomerName] = useState("");
  const [address,setAddress] = useState("");
  const [pincode,setPincode] = useState("");
  const [phone,setPhone] = useState("");
  const [loading,setLoading] = useState(false);
  const [message,setMessage] = useState("");



  const createOrder = async () => {

    setLoading(true);
    setMessage("");

    try{

      const res = await fetch("/api/qikink-order",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          productName,
          customerName,
          address,
          pincode,
          phone
        })
      });

      const data = await res.json();

      if(data.success){

        setMessage("✅ Order Sent To Qikink");

      }else{

        setMessage("❌ Order Failed");

      }

    }catch(err){

      setMessage("❌ Server Error");

    }

    setLoading(false);

  };



  return(

    <div className="p-6">

      <h1 className="text-2xl font-bold mb-6">
        Qikink Print Order
      </h1>


      <div className="bg-white p-6 rounded-xl shadow max-w-xl space-y-4">

        {/* PRODUCT */}

        <div>

          <label className="text-sm font-medium">
            Product Name
          </label>

          <input
            type="text"
            value={productName}
            onChange={(e)=>setProductName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
            placeholder="T-shirt"
          />

        </div>



        {/* CUSTOMER */}

        <div>

          <label className="text-sm font-medium">
            Customer Name
          </label>

          <input
            type="text"
            value={customerName}
            onChange={(e)=>setCustomerName(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
            placeholder="Customer Name"
          />

        </div>



        {/* PHONE */}

        <div>

          <label className="text-sm font-medium">
            Phone
          </label>

          <input
            type="text"
            value={phone}
            onChange={(e)=>setPhone(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
            placeholder="9876543210"
          />

        </div>



        {/* ADDRESS */}

        <div>

          <label className="text-sm font-medium">
            Address
          </label>

          <textarea
            value={address}
            onChange={(e)=>setAddress(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
            placeholder="Full Address"
          />

        </div>



        {/* PINCODE */}

        <div>

          <label className="text-sm font-medium">
            Pincode
          </label>

          <input
            type="text"
            value={pincode}
            onChange={(e)=>setPincode(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 mt-1"
            placeholder="800001"
          />

        </div>



        {/* BUTTON */}

        <button
          onClick={createOrder}
          disabled={loading}
          className="bg-purple-600 text-white px-5 py-2 rounded-lg"
        >

          {loading ? "Sending..." : "Send Order To Qikink"}

        </button>



        {/* MESSAGE */}

        {message && (

          <p className="text-sm mt-2">
            {message}
          </p>

        )}

      </div>

    </div>

  );

}

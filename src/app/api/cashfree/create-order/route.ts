"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

export default function CheckoutForm() {

  const searchParams = useSearchParams();
  const price = Number(searchParams.get("price")) || 0;

  const [loading,setLoading] = useState(false);

  const [customer,setCustomer] = useState({
    firstName:"",
    lastName:"",
    address:"",
    city:"",
    state:"",
    zip:"",
    phone:"",
    email:""
  });

  const placeOrder = async()=>{

    if(!customer.phone){
      alert("Enter phone number");
      return;
    }

    setLoading(true);

    try{

      const res = await fetch("/api/cashfree/create-order",{
        method:"POST",
        headers:{
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          amount:price,
          customer
        })
      });

      const data = await res.json();

      setLoading(false);

      if(data.payment_link){

        window.location.href = data.payment_link;

      }else{

        alert("Payment initialization failed");

      }

    }catch(err){

      setLoading(false);
      alert("Server error");

    }

  };

  return(

    <div className="p-6 max-w-xl mx-auto">

      <h1 className="text-2xl font-bold mb-6">
        Checkout
      </h1>

      <div className="space-y-4">

        <input
          placeholder="First Name"
          className="border p-3 w-full rounded"
          onChange={(e)=>
            setCustomer({...customer,firstName:e.target.value})
          }
        />

        <input
          placeholder="Last Name"
          className="border p-3 w-full rounded"
          onChange={(e)=>
            setCustomer({...customer,lastName:e.target.value})
          }
        />

        <textarea
          placeholder="Full Address"
          className="border p-3 w-full rounded"
          onChange={(e)=>
            setCustomer({...customer,address:e.target.value})
          }
        />

        <input
          placeholder="Phone Number"
          className="border p-3 w-full rounded"
          onChange={(e)=>
            setCustomer({...customer,phone:e.target.value})
          }
        />

        <input
          placeholder="Email"
          className="border p-3 w-full rounded"
          onChange={(e)=>
            setCustomer({...customer,email:e.target.value})
          }
        />

        <button
          onClick={placeOrder}
          className="bg-pink-500 text-white px-6 py-3 rounded w-full"
        >

          {loading ? "Processing Payment..." : `Pay ₹${price}`}

        </button>

      </div>

    </div>

  );

}

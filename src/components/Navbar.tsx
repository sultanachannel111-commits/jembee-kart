"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import BellNotification from "@/components/BellNotification";

export default function Navbar() {

const [cartCount,setCartCount] = useState(0);

useEffect(()=>{

const auth = getAuth();

let unsubscribeCart:any;

const unsubscribeAuth = onAuthStateChanged(auth,(user)=>{

if(!user){
setCartCount(0);
if(unsubscribeCart) unsubscribeCart();
return;
}

const cartItemsRef = collection(db,"cart",user.uid,"items");

unsubscribeCart = onSnapshot(cartItemsRef,(snapshot)=>{

let total = 0;

snapshot.forEach((doc)=>{

const data = doc.data();

total += Number(data.quantity || 0);

});

setCartCount(total);

});

});

return ()=>{

unsubscribeAuth();

if(unsubscribeCart) unsubscribeCart();

};

},[]);

/* Cart icon removed */

return null;

}

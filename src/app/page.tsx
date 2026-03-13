"use client";

import { useEffect, useState } from "react";

export default function HomePage(){

const [products,setProducts] = useState<any[]>([]);

useEffect(()=>{

loadProducts();

},[]);

const loadProducts = async ()=>{

try{

const res = await fetch("/api/qikink");

const data = await res.json();

alert("API RESPONSE: " + JSON.stringify(data));

setProducts(data.products || []);

}catch(err){

alert("API ERROR");

}

};

return(

<div style={{padding:"20px"}}>

<h1>Qikink Product Test</h1>

{products.length===0 && <p>No products found</p>}

{products.map((p:any)=>(
<div key={p.id} style={{border:"1px solid #ccc",margin:"10px",padding:"10px"}}>

<img src={p.image} width="120"/>

<h3>{p.name}</h3>

<p>₹ {p.price}</p>

</div>
))}

</div>

);

}

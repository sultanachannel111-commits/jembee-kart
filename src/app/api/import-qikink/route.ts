import { NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { collection, addDoc } from "firebase/firestore";

export async function GET(){

try{

const products=[
{
id:"63839724",
name:"Supima T Shirt",
price:500,
image:"https://qikink.com/image1.jpg"
},
{
id:"63788668",
name:"Unisex Hoodie",
price:700,
image:"https://qikink.com/image2.jpg"
}
];

for(const p of products){

await addDoc(collection(db,"products"),{
id:p.id,
name:p.name,
price:p.price,
image:p.image,
supplier:"qikink"
});

}

return NextResponse.json({
message:"Products Imported",
count:products.length
});

}catch(e){

return NextResponse.json({
error:"Import Failed"
});

}

}

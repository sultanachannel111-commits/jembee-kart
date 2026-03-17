"use client";

import { useState } from "react";

export default function UploadImage(){

const [file,setFile] = useState<File | null>(null);
const [preview,setPreview] = useState("");
const [loading,setLoading] = useState(false);

function handleFile(e:any){

const selected = e.target.files[0];

if(!selected) return;

if(!selected.type.startsWith("image/")){
alert("Please select an image");
return;
}

setFile(selected);
setPreview(URL.createObjectURL(selected));

}

function upload(){

if(!file){
alert("Select image first");
return;
}

setLoading(true);

const img = new Image();
img.src = URL.createObjectURL(file);

img.onload = () => {

const canvas = document.createElement("canvas");

const width = 1200;
const height = 1600;

canvas.width = width;
canvas.height = height;

const ctx = canvas.getContext("2d");

ctx?.drawImage(img,0,0,width,height);

// compress
const compressed = canvas.toDataURL("image/webp",0.8);

const params = new URLSearchParams(window.location.search);
const type = params.get("type") || "main";

if(type === "front"){
localStorage.setItem("image_front",compressed);
}
else if(type === "back"){
localStorage.setItem("image_back",compressed);
}
else if(type === "side"){
localStorage.setItem("image_side",compressed);
}
else if(type === "model"){
localStorage.setItem("image_model",compressed);
}
else{
localStorage.setItem("image_main",compressed);
}

setLoading(false);

alert("Image Uploaded Successfully");

window.history.back();

};

}

return(

<div className="min-h-screen flex items-center justify-center bg-gray-100">

<div className="bg-white p-6 rounded-xl shadow w-full max-w-md">

<h2 className="text-xl font-bold mb-4">
Upload Product Image
</h2>

<input
type="file"
accept="image/*"
onChange={handleFile}
className="border p-2 w-full rounded"
/>

{preview && (

<div className="mt-4 text-center">

<p className="text-sm mb-2 text-gray-500">
Preview
</p>

<img
src={preview}
className="w-48 mx-auto rounded-lg shadow"
/>

</div>

)}

<button
onClick={upload}
disabled={loading}
className="mt-6 w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
>

{loading ? "Uploading..." : "Upload Image"}

</button>

</div>

</div>

);

}

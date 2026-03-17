"use client";

import { useState } from "react";

export default function UploadImage(){

const [file,setFile] = useState<File | null>(null);
const [preview,setPreview] = useState("");

function handleFile(e:any){

const selected = e.target.files[0];

if(selected){
setFile(selected);
setPreview(URL.createObjectURL(selected));
}

}

function upload(){

if(!file) return alert("Select image first");

const reader = new FileReader();

reader.onload = () => {

const base64 = reader.result as string;

// url से type निकालो
const params = new URLSearchParams(window.location.search);
const type = params.get("type") || "main";

// सही key में save करो
if(type === "front"){
localStorage.setItem("image_front",base64);
}
else if(type === "back"){
localStorage.setItem("image_back",base64);
}
else if(type === "side"){
localStorage.setItem("image_side",base64);
}
else if(type === "model"){
localStorage.setItem("image_model",base64);
}
else{
localStorage.setItem("image_main",base64);
}

alert("Image Uploaded");

// वापस product page
window.history.back();

};

reader.readAsDataURL(file);

}

return(

<div style={{padding:"20px"}}>

<h2>Upload Product Image</h2>

<input type="file" onChange={handleFile} />

<br/><br/>

{preview && (

<div>

<p>Preview:</p>

<img
src={preview}
style={{width:"200px",borderRadius:"10px"}}
/>

</div>

)}

<br/>

<button
onClick={upload}
style={{
padding:"10px 20px",
background:"purple",
color:"white",
borderRadius:"6px"
}}
>

Upload Image

</button>

</div>

);

}

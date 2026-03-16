"use client";

import { useState } from "react";

export default function UploadImage() {

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

// image save
localStorage.setItem("uploadedImage", base64);

// type save
const type =
new URLSearchParams(window.location.search).get("type") || "main";

localStorage.setItem("uploadedImageType", type);

// redirect
window.location.href = "/admin/qikink-products";

};

reader.readAsDataURL(file);

}

return(

<div style={{padding:"20px"}}>

<h2>Upload Image</h2>

<input type="file" onChange={handleFile} />

<br/><br/>

{preview && (
<img src={preview} style={{width:"200px"}} />
)}

<br/><br/>

<button onClick={upload}>
Upload Image
</button>

</div>

);

}

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

async function upload(){

if(!file) return alert("Select image first");

const reader = new FileReader();

reader.onload = () => {

const base64 = reader.result as string;

// image localStorage में save
localStorage.setItem("uploadedImage", base64);

alert("Image Uploaded");

// product page पर वापस
window.location.href = "/admin/qikink-products";

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

<button onClick={upload}>
Upload Image
</button>

</div>

);

}

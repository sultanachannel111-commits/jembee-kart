"use client";

import { useState } from "react";

export default function UploadImage(){

const [file,setFile] = useState<File | null>(null);
const [preview,setPreview] = useState("");
const [imageUrl,setImageUrl] = useState("");

function handleFile(e:any){

const selected = e.target.files[0];

if(selected){

setFile(selected);

// preview
const url = URL.createObjectURL(selected);
setPreview(url);

}

}

async function upload(){

if(!file) return alert("Select image first");

const reader = new FileReader();

reader.onload = () => {

const base64 = reader.result as string;

// image url set
setImageUrl(base64);

alert("Image Uploaded");

// redirect back with image
window.location.href =
"/admin/qikink-products?image=" + encodeURIComponent(base64);

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

<br/><br/>

{imageUrl && (

<div>

<p>Image Link:</p>

<input
value={imageUrl}
readOnly
style={{width:"100%"}}
/>

</div>

)}

</div>

);

}

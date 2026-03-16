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
setPreview(URL.createObjectURL(selected));
}

}

async function upload(){

if(!file) return alert("Select image");

const reader = new FileReader();

reader.onload = async () => {

const base64 = (reader.result as string).split(",")[1];

await fetch("/api/upload-image",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
fileName:file.name,
base64
})
});

const link =
"https://jembee-kart-h39deei2i-md-alim-ansar-s-projects.vercel.app/"+file.name;

setImageUrl(link);

alert("Image Uploaded");

// redirect back to product page
window.location.href =
"/admin/qikink-products?image=" + link;

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

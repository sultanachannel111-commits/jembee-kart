"use client";

import { useState } from "react";
import { auth } from "@/lib/firebase";
import {
updatePassword,
deleteUser,
signOut
} from "firebase/auth";

export default function SellerSettings(){

const [password,setPassword] = useState("");
const [loading,setLoading] = useState(false);

const changePassword = async()=>{

try{

const user = auth.currentUser;

if(!user){
alert("Login required");
return;
}

await updatePassword(user,password);

alert("Password updated");

setPassword("");

}catch(err){

console.log(err);
alert("Password change failed");

}

};



const logout = async()=>{

await signOut(auth);

window.location.href="/seller/login";

};



const deleteAccount = async()=>{

const ok = confirm("Delete seller account?");

if(!ok) return;

try{

const user = auth.currentUser;

if(!user) return;

await deleteUser(user);

alert("Account deleted");

window.location.href="/";

}catch(err){

console.log(err);
alert("Delete failed");

}

};



return(

<div className="max-w-xl">

<h1 className="text-2xl font-bold mb-6">
Seller Settings
</h1>


{/* CHANGE PASSWORD */}

<div className="bg-white p-4 rounded-xl shadow mb-6">

<h2 className="font-semibold mb-3">
Change Password
</h2>

<input
type="password"
placeholder="New Password"
value={password}
onChange={(e)=>setPassword(e.target.value)}
className="border p-2 w-full mb-3 rounded"
/>

<button
onClick={changePassword}
className="bg-black text-white px-4 py-2 rounded"
>

Update Password

</button>

</div>


{/* LOGOUT */}

<div className="bg-white p-4 rounded-xl shadow mb-6">

<h2 className="font-semibold mb-3">
Logout
</h2>

<button
onClick={logout}
className="bg-red-500 text-white px-4 py-2 rounded"
>

Logout

</button>

</div>


{/* DELETE ACCOUNT */}

<div className="bg-white p-4 rounded-xl shadow">

<h2 className="font-semibold mb-3">
Delete Account
</h2>

<button
onClick={deleteAccount}
className="bg-red-700 text-white px-4 py-2 rounded"
>

Delete Seller Account

</button>

</div>

</div>

);

}

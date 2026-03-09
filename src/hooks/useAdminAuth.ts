"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { getUserRole } from "@/lib/authGuard";

export default function useAdminAuth(){

const router = useRouter();
const [loading,setLoading] = useState(true);

useEffect(()=>{

const unsub = onAuthStateChanged(auth, async(user)=>{

if(!user){
router.replace("/admin/login");
return;
}

const data:any = await getUserRole();

if(!data || data.role !== "admin"){
router.replace("/");
return;
}

setLoading(false);

});

return ()=>unsub();

},[]);

return loading;

}

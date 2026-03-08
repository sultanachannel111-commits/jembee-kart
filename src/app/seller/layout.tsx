useEffect(()=>{

const unsub = onAuthStateChanged(auth, async (user)=>{

console.log("AUTH USER:", user);

if(!user){
router.push("/seller/login");
return;
}

const snap = await getDoc(doc(db,"users",user.uid));

console.log("USER DOC:", snap.data());

if(!snap.exists()){
router.push("/");
return;
}

const data:any = snap.data();

if(data.role !== "seller"){
router.push("/");
return;
}

setLoading(false);

});

return ()=>unsub();

},[]);

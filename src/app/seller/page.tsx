const handleLogin = async () => {

try {

const res = await signInWithEmailAndPassword(
auth,
email,
password
);

console.log("LOGIN SUCCESS:", res.user);

router.push("/seller/dashboard");

} catch (err) {

console.log("LOGIN ERROR:", err);
alert("Login failed");

}

};

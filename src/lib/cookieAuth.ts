// src/lib/cookieAuth.ts

export function setAdminCookie() {

document.cookie = "admin=true; path=/; max-age=86400";

}

export function setSellerCookie() {

document.cookie = "seller=true; path=/; max-age=86400";

}

export function removeAdminCookie() {

document.cookie = "admin=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

}

export function removeSellerCookie() {

document.cookie = "seller=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

}

export function getCookie(name:string) {

const value = `; ${document.cookie}`;
const parts = value.split(`; ${name}=`);

if (parts.length === 2) {

return parts.pop()?.split(";").shift();

}

return null;

}

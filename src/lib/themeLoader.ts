export function loadTheme(){

const theme = localStorage.getItem("theme");

if(!theme) return;

const t = JSON.parse(theme);

/* =====================
SET CSS VARIABLES
===================== */

document.documentElement.style.setProperty("--admin-bg", t.bg);
document.documentElement.style.setProperty("--admin-header", t.header);
document.documentElement.style.setProperty("--admin-button", t.button);

/* =====================
APPLY BACKGROUND
===================== */

const body = document.getElementById("theme-body");

if(body){
body.style.background = t.bg;
}

}

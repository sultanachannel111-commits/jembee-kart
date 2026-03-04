export function loadTheme(){

const theme = localStorage.getItem("theme");

if(!theme) return;

const t = JSON.parse(theme);

document.documentElement.style.setProperty("--admin-bg",t.bg);
document.documentElement.style.setProperty("--admin-header",t.header);
document.documentElement.style.setProperty("--admin-button",t.button);

}

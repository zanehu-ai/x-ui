/* x-ui site.js (shared): 3-state theme, phone menu, copy button. */
(function(){var d=document.documentElement,zh=/^zh/.test(d.lang),O=["system","light","dark"],
N=zh?{system:"跟随系统",light:"浅色",dark:"深色"}:{system:"System",light:"Light",dark:"Dark"};
function lbl(c,n){return zh?"主题："+N[c]+"。切换到"+N[n]+"。":"Theme: "+N[c]+". Switch to "+N[n]+"."}
function apply(p){d.dataset.themePref=p;d.dataset.theme=p==="system"?(matchMedia("(prefers-color-scheme: light)").matches?"light":"dark"):p;try{p==="system"?localStorage.removeItem("theme"):localStorage.setItem("theme",p)}catch(e){}sync()}
function sync(){var p=d.dataset.themePref||"system",n=O[(O.indexOf(p)+1)%3];
 document.querySelectorAll(".xui-theme-toggle").forEach(function(b){b.setAttribute("aria-label",lbl(p,n))});
 document.querySelectorAll("[data-xui-theme-radio]").forEach(function(r){r.checked=r.value===p;r.parentNode.classList.toggle("is-checked",r.checked)})}
document.querySelectorAll(".xui-theme-toggle").forEach(function(b){b.addEventListener("click",function(){var p=d.dataset.themePref||"system";apply(O[(O.indexOf(p)+1)%3])})});
document.querySelectorAll("[data-xui-theme-radio]").forEach(function(r){r.addEventListener("change",function(){apply(r.value)})});
document.querySelectorAll(".xui-header__burger").forEach(function(b){b.addEventListener("click",function(){d.classList.add("xui-menu-open");b.setAttribute("aria-expanded","true")})});
document.querySelectorAll(".xui-drawer__close").forEach(function(b){b.addEventListener("click",function(){d.classList.remove("xui-menu-open")})});
var CHECK='<path d="M20 6 9 17l-5-5"/>';
document.querySelectorAll(".xui-copy-button").forEach(function(b){b.hidden=false;var t=b.querySelector("span"),l0=t.textContent,svg=b.querySelector("svg"),i0=svg.innerHTML,st=b.nextElementSibling,tm;
 b.addEventListener("click",function(){var v=b.getAttribute("data-copy"),ok=function(){clearTimeout(tm);b.setAttribute("data-copied","");t.textContent=b.getAttribute("data-copied-label");svg.innerHTML=CHECK;
   if(st&&st.classList.contains("xui-copy-button__status"))st.textContent=st.getAttribute("data-copied-msg");
   tm=setTimeout(function(){b.removeAttribute("data-copied");t.textContent=l0;svg.innerHTML=i0;if(st)st.textContent=""},2000)};
 if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(v).then(ok,function(){fb(v)&&ok()})}else if(fb(v))ok()})});
function fb(v){var a=document.createElement("textarea");a.value=v;a.setAttribute("readonly","");a.style.position="fixed";a.style.opacity="0";document.body.appendChild(a);a.select();var r=false;try{r=document.execCommand("copy")}catch(e){}document.body.removeChild(a);return r}
sync()})();

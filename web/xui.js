/* x-ui site.js (shared): 3-state theme (+OS follow, live announce), phone menu (Esc, focus trap, focus return), copy button. */
(function(){var d=document.documentElement,zh=/^zh/.test(d.lang),O=["system","light","dark"],
N=zh?{system:"跟随系统",light:"浅色",dark:"深色"}:{system:"System",light:"Light",dark:"Dark"};
function lbl(c,n){return zh?"主题："+N[c]+"。切换到"+N[n]+"。":"Theme: "+N[c]+". Switch to "+N[n]+"."}
var mq=matchMedia("(prefers-color-scheme: light)"),live;
function say(p){if(!live){live=document.createElement("span");live.className="xui-live";live.setAttribute("role","status");live.setAttribute("aria-live","polite");document.body.appendChild(live)}
 var m=(zh?"主题：":"Theme: ")+N[p]+(p==="system"?(zh?"（"+N[d.dataset.theme]+"）":" ("+N[d.dataset.theme]+")"):"");live.textContent="";setTimeout(function(){live.textContent=m},50)}
function apply(p,quiet){d.dataset.themePref=p;d.dataset.theme=p==="system"?(mq.matches?"light":"dark"):p;try{p==="system"?localStorage.removeItem("theme"):localStorage.setItem("theme",p)}catch(e){}sync();if(!quiet)say(p)}
function osChange(){if((d.dataset.themePref||"system")==="system")apply("system",true)}
mq.addEventListener?mq.addEventListener("change",osChange):mq.addListener(osChange);
function sync(){var p=d.dataset.themePref||"system",n=O[(O.indexOf(p)+1)%3];
 document.querySelectorAll(".xui-theme-toggle").forEach(function(b){b.setAttribute("aria-label",lbl(p,n))});
 document.querySelectorAll("[data-xui-theme-radio]").forEach(function(r){r.checked=r.value===p;r.parentNode.classList.toggle("is-checked",r.checked)})}
document.querySelectorAll(".xui-theme-toggle").forEach(function(b){b.addEventListener("click",function(){var p=d.dataset.themePref||"system";apply(O[(O.indexOf(p)+1)%3])})});
document.querySelectorAll("[data-xui-theme-radio]").forEach(function(r){r.addEventListener("change",function(){apply(r.value)})});
var opener=null,FOC='a[href],button:not([disabled]),input:not([disabled]),select,textarea,[tabindex]:not([tabindex="-1"])';
function drawer(){return document.querySelector(".xui-drawer")}
function openMenu(b){opener=b;d.classList.add("xui-menu-open");b.setAttribute("aria-expanded","true");var c=drawer()&&drawer().querySelector(".xui-drawer__close");if(c)c.focus()}
function closeMenu(){if(!d.classList.contains("xui-menu-open"))return;d.classList.remove("xui-menu-open");
 document.querySelectorAll(".xui-header__burger").forEach(function(b){b.setAttribute("aria-expanded","false")});
 var b=opener||document.querySelector(".xui-header__burger");opener=null;if(b)b.focus()}
document.querySelectorAll(".xui-header__burger").forEach(function(b){b.addEventListener("click",function(){openMenu(b)})});
document.querySelectorAll(".xui-drawer__close").forEach(function(b){b.addEventListener("click",closeMenu)});
document.addEventListener("keydown",function(e){if(!d.classList.contains("xui-menu-open"))return;var w=drawer();if(!w)return;
 if(e.key==="Escape"){e.preventDefault();closeMenu();return}
 if(e.key!=="Tab")return;var f=[].filter.call(w.querySelectorAll(FOC),function(x){return x.offsetParent!==null||x===document.activeElement});
 if(!f.length)return;var a=f[0],z=f[f.length-1],act=document.activeElement;
 if(!w.contains(act)){e.preventDefault();a.focus()}else if(e.shiftKey&&act===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&act===z){e.preventDefault();a.focus()}});
var CHECK='<path d="M20 6 9 17l-5-5"/>';
document.querySelectorAll(".xui-copy-button").forEach(function(b){b.hidden=false;var t=b.querySelector("span"),l0=t.textContent,svg=b.querySelector("svg"),i0=svg.innerHTML,st=b.nextElementSibling,tm;
 b.addEventListener("click",function(){var v=b.getAttribute("data-copy"),ok=function(){clearTimeout(tm);b.setAttribute("data-copied","");t.textContent=b.getAttribute("data-copied-label");svg.innerHTML=CHECK;
   if(st&&st.classList.contains("xui-copy-button__status"))st.textContent=st.getAttribute("data-copied-msg");
   tm=setTimeout(function(){b.removeAttribute("data-copied");t.textContent=l0;svg.innerHTML=i0;if(st&&st.classList.contains("xui-copy-button__status"))st.textContent=""},2000)};
 if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(v).then(ok,function(){fb(v)&&ok()})}else if(fb(v))ok()})});
function fb(v){var a=document.createElement("textarea");a.value=v;a.setAttribute("readonly","");a.style.position="fixed";a.style.opacity="0";document.body.appendChild(a);a.select();var r=false;try{r=document.execCommand("copy")}catch(e){}document.body.removeChild(a);return r}
sync()})();

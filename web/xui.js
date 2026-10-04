/* x-ui site.js (shared): 3-state theme, phone menu, copy button. */
(function(){var d=document.documentElement,zh=/^zh/.test(d.lang),O=["system","light","dark"],
N=zh?{system:"跟随系统",light:"浅色",dark:"深色"}:{system:"System",light:"Light",dark:"Dark"};
function lbl(c,n){return zh?"主题："+N[c]+"。切换到"+N[n]+"。":"Theme: "+N[c]+". Switch to "+N[n]+"."}
var mq;try{mq=matchMedia("(prefers-color-scheme: light)")}catch(e){}
var schemeOn=false;
function onScheme(){if((d.dataset.themePref||"system")!=="system"||!mq)return;d.dataset.theme=mq.matches?"light":"dark"}
function bindScheme(on){if(!mq||on===schemeOn)return;
 if(mq.addEventListener)mq[on?"addEventListener":"removeEventListener"]("change",onScheme);
 else if(mq.addListener)mq[on?"addListener":"removeListener"](onScheme);
 schemeOn=!!(on&&(mq.addEventListener||mq.addListener))}
var live=document.createElement("div");live.id="xui-theme-status";live.className="xui-visually-hidden";live.setAttribute("aria-live","polite");(document.body||d).appendChild(live);
function announce(p){live.textContent=zh?"主题："+N[p]:"Theme: "+N[p]}
function apply(p){d.dataset.themePref=p;d.dataset.theme=p==="system"?(mq&&mq.matches?"light":"dark"):p;bindScheme(p==="system");try{p==="system"?localStorage.removeItem("theme"):localStorage.setItem("theme",p)}catch(e){}sync();announce(p)}
function sync(){var p=d.dataset.themePref||"system",n=O[(O.indexOf(p)+1)%3];
 document.querySelectorAll(".xui-theme-toggle").forEach(function(b){b.setAttribute("aria-label",lbl(p,n))});
 document.querySelectorAll("[data-xui-theme-radio]").forEach(function(r){r.checked=r.value===p;r.parentNode.classList.toggle("is-checked",r.checked)})}
document.querySelectorAll(".xui-theme-toggle").forEach(function(b){b.addEventListener("click",function(){var p=d.dataset.themePref||"system";apply(O[(O.indexOf(p)+1)%3])})});
document.querySelectorAll("[data-xui-theme-radio]").forEach(function(r){r.addEventListener("change",function(){apply(r.value)})});
if((d.dataset.themePref||"system")==="system")bindScheme(true);
var opener=null;
function focusables(root){return Array.prototype.filter.call(root.querySelectorAll("a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex='-1'])"),function(el){return el.getAttribute("aria-hidden")!=="true"&&!el.closest("[hidden]")})}
function setMenu(open,trigger){d.classList.toggle("xui-menu-open",open);var v=open?"true":"false";
 document.querySelectorAll(".xui-header__burger").forEach(function(b){b.setAttribute("aria-expanded",v)});
 if(open){opener=trigger||document.querySelector(".xui-header__burger");var drawer=document.querySelector(".xui-drawer"),items=drawer?focusables(drawer):[];if(items[0])items[0].focus()}
 else{var back=opener||document.querySelector(".xui-header__burger");opener=null;if(back&&back.focus)back.focus()}}
document.querySelectorAll(".xui-header__burger").forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();setMenu(!d.classList.contains("xui-menu-open"),b)})});
document.querySelectorAll(".xui-drawer__close").forEach(function(b){b.addEventListener("click",function(e){e.stopPropagation();setMenu(false)})});
document.querySelectorAll(".xui-drawer a[href]").forEach(function(a){a.addEventListener("click",function(){setMenu(false)})});
document.addEventListener("keydown",function(e){if(!d.classList.contains("xui-menu-open"))return;
 if(e.key==="Escape"||e.key==="Esc"){e.preventDefault();setMenu(false);return}
 if(e.key!=="Tab")return;var drawer=document.querySelector(".xui-drawer");if(!drawer)return;var items=focusables(drawer);
 if(!items.length){e.preventDefault();return}
 var first=items[0],last=items[items.length-1],active=document.activeElement;
 if(e.shiftKey){if(active===first||!drawer.contains(active)){e.preventDefault();last.focus()}}
 else if(active===last||!drawer.contains(active)){e.preventDefault();first.focus()}});
document.addEventListener("click",function(e){if(!d.classList.contains("xui-menu-open"))return;var t=e.target;if(t&&t.nodeType!==1)t=t.parentElement;if(t&&t.closest&&(t.closest(".xui-drawer")||t.closest(".xui-header__burger")))return;setMenu(false)});
var CHECK='<path d="M20 6 9 17l-5-5"/>';
document.querySelectorAll(".xui-copy-button").forEach(function(b){b.hidden=false;var t=b.querySelector("span"),l0=t.textContent,svg=b.querySelector("svg"),i0=svg.innerHTML,st=b.nextElementSibling,tm;
 b.addEventListener("click",function(){var v=b.getAttribute("data-copy"),ok=function(){clearTimeout(tm);b.setAttribute("data-copied","");t.textContent=b.getAttribute("data-copied-label");svg.innerHTML=CHECK;
   if(st&&st.classList.contains("xui-copy-button__status"))st.textContent=st.getAttribute("data-copied-msg");
   tm=setTimeout(function(){b.removeAttribute("data-copied");t.textContent=l0;svg.innerHTML=i0;if(st)st.textContent=""},2000)};
 if(navigator.clipboard&&window.isSecureContext){navigator.clipboard.writeText(v).then(ok,function(){fb(v)&&ok()})}else if(fb(v))ok()})});
function fb(v){var a=document.createElement("textarea");a.value=v;a.setAttribute("readonly","");a.style.position="fixed";a.style.opacity="0";document.body.appendChild(a);a.select();var r=false;try{r=document.execCommand("copy")}catch(e){}document.body.removeChild(a);return r}
sync()})();

/* Device compass adapted from GPS Viewer. iPhone permission is requested only after tapping Heading/Compass. */
(function(){
"use strict";
let active=false,last=null;
const $=id=>document.getElementById(id);
function dir(v){const a=["N","NNE","NE","ENE","E","ESE","SE","S","SSE","SSW","SW","WSW","W","WNW","NW","NNW"];return a[Math.round(v/22.5)%16]}
function show(v){
 v=((Number(v)%360)+360)%360; last=v;
 const h=Math.round(v)%360, text=h+"° "+dir(v);
 if($("heading"))$("heading").textContent=text;
 if($("compassState")){$("compassState").innerHTML="<i></i>Live";$("compassState").classList.add("live")}
 const frame=$("miniCompassFrame");
 if(frame){frame.dataset.heading=String(h);frame.style.setProperty("--compass-angle",(-v)+"deg")}
}
function on(e){
 let h=null;
 if(Number.isFinite(Number(e.webkitCompassHeading))&&Number(e.webkitCompassHeading)>=0)h=Number(e.webkitCompassHeading);
 else if(Number.isFinite(Number(e.alpha)))h=360-Number(e.alpha)+(Number(screen.orientation?.angle)||Number(window.orientation)||0);
 if(h!==null)show(h);
}
function start(){
 if(active)return;
 window.addEventListener("deviceorientationabsolute",on,true);
 window.addEventListener("deviceorientation",on,true);
 active=true;
 if($("compassState"))$("compassState").innerHTML="<i></i>Live";
}
async function activate(){
 if(active)return true;
 try{
  if(typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission==="function"){
   const r=await DeviceOrientationEvent.requestPermission();
   if(r!=="granted"){if($("compassState"))$("compassState").textContent="Tap to allow";return false}
  }
  start(); return true;
 }catch(e){if($("compassState"))$("compassState").textContent="Unavailable";return false}
}
function bind(){
 const card=$("headingCard");
 if(card){card.addEventListener("click",activate);card.addEventListener("touchend",activate,{passive:true});card.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" ")activate()})}
 if(typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission!=="function")start();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",bind,{once:true});else bind();
window.MyLocationCompass={activate,start,get heading(){return last}};
})();
(function(){
"use strict";
let watchId=null;
const KEY="myLocationInfo.gps";
const $=id=>document.getElementById(id);
function set(id,v){const e=$(id);if(e)e.textContent=v}
function save(c,t){try{localStorage.setItem(KEY,JSON.stringify({lat:c.latitude,lon:c.longitude,accuracy:c.accuracy,altitude:c.altitude,speed:c.speed,heading:c.heading,time:t}))}catch(e){}}
function render(c,t){window.dispatchEvent(new CustomEvent("gpsfix",{detail:c}));
 set("latitude",c.latitude.toFixed(6)+"°");
 set("longitude",c.longitude.toFixed(6)+"°");
 set("accuracy",Number.isFinite(c.accuracy)?Math.round(c.accuracy)+" m":"—");
 set("altitude",Number.isFinite(c.altitude)?Math.round(c.altitude)+" m":"—");
 set("speed",Number.isFinite(c.speed)&&c.speed>=0?(c.speed*3.6).toFixed(1)+" km/h":"0.0 km/h");
 set("heading",Number.isFinite(c.heading)&&c.heading>=0?Math.round(c.heading)+"°":"—");
 const weak=Number.isFinite(c.accuracy)&&c.accuracy>100;
set("gpsState",watchId!==null?(weak?"GPS WEAK":"GPS ON"):"GPS OFF");
const gb=document.getElementById("gpsToggle");if(gb){gb.classList.toggle("on",watchId!==null&&!weak);gb.classList.toggle("weak",watchId!==null&&weak);gb.classList.toggle("off",watchId===null)}
set("gpsStatus",navigator.onLine?(weak?"GPS ACTIVE • WEAK":"GPS ACTIVE"):"GPS ACTIVE • OFFLINE");
 set("gpsMessage","iPhone supplied a location fix.");
 save(c,t);
}
function error(e){
 if(e&&e.code===1){set("gpsState","GPS OFF");const b=document.getElementById("gpsToggle");if(b){b.classList.remove("on","weak");b.classList.add("off")}set("gpsStatus","PERMISSION DENIED");set("gpsMessage","Allow Location for this website in Safari and enable Precise Location.");return}
 set("gpsStatus","SEARCHING");set("gpsMessage","Waiting for iPhone Location Services…");
}
function stop(){if(watchId!==null)navigator.geolocation.clearWatch(watchId);watchId=null;set("gpsState","GPS OFF");const b=document.getElementById("gpsToggle");if(b){b.classList.remove("on","weak");b.classList.add("off")};set("gpsStatus","GPS OFF");set("gpsMessage","GPS is switched off. Tap GPS ON to restart.")}
function toggle(){if(watchId!==null)stop();else start()}
function start(){
 if(!navigator.geolocation){error({code:2});return}
 if(watchId!==null)navigator.geolocation.clearWatch(watchId);
 set("gpsStatus","SEARCHING");set("gpsMessage","Requesting iPhone Location Services…");
 const opt={enableHighAccuracy:true,maximumAge:0,timeout:20000};
 navigator.geolocation.getCurrentPosition(p=>render(p.coords,p.timestamp||Date.now()),error,opt);
 watchId=navigator.geolocation.watchPosition(p=>render(p.coords,p.timestamp||Date.now()),error,{enableHighAccuracy:true,maximumAge:2000,timeout:20000});
}
window.MyLocationGPS={start,stop,toggle};
document.addEventListener("DOMContentLoaded",()=>{
 try{const x=JSON.parse(localStorage.getItem(KEY)||"null");if(x){render(x, x.time);set("gpsMessage","Last saved GPS fix. Request GPS for a fresh fix.")}}catch(e){}
 $("requestGPS")?.addEventListener("click",start);
});
})();
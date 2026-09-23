(function(){
"use strict";
const BDC="https://api.bigdatacloud.net/data/reverse-geocode-client",OWM="https://api.open-meteo.com/v1/forecast";
let ak="",at=0,wk="",wt=0;
const wx={0:"Clear sky",1:"Mainly clear",2:"Partly cloudy",3:"Overcast",45:"Fog",48:"Rime fog",51:"Light drizzle",53:"Drizzle",55:"Dense drizzle",61:"Slight rain",63:"Rain",65:"Heavy rain",71:"Slight snow",73:"Snow",75:"Heavy snow",80:"Rain showers",81:"Rain showers",82:"Heavy rain showers",95:"Thunderstorm",96:"Thunderstorm",99:"Thunderstorm"};
const key=(a,b)=>Number(a).toFixed(4)+","+Number(b).toFixed(4);
async function reverseGeocode(lat,lon,render){
 const k=key(lat,lon),n=Date.now();if(k===ak&&n-at<60000)return;ak=k;at=n;render("LOOKING UP","Finding address…");
 try{const r=await fetch(BDC+"?latitude="+lat+"&longitude="+lon+"&localityLanguage=en",{cache:"no-store"});if(!r.ok)throw 0;const d=await r.json();const parts=[d.locality,d.city,d.principalSubdivision,d.postcode,d.countryName].filter(Boolean);render("LIVE FALLBACK",[...new Set(parts)].join(", ")||"Locality unavailable",d)}catch(e){render("UNAVAILABLE","Address service unavailable.")}}
async function weather(lat,lon,render){
 const k=key(lat,lon),n=Date.now();if(k===wk&&n-wt<600000)return;wk=k;wt=n;render("LOOKING UP","Fetching weather…");
 try{const u=OWM+"?latitude="+lat+"&longitude="+lon+"&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m&timezone=auto";const r=await fetch(u,{cache:"no-store"});if(!r.ok)throw 0;const c=(await r.json()).current||{};render("LIVE FALLBACK",{temperature:c.temperature_2m,feels:c.apparent_temperature,humidity:c.relative_humidity_2m,wind:c.wind_speed_10m,windDirection:c.wind_direction_10m,description:wx[c.weather_code]||"Current conditions"})}catch(e){render("UNAVAILABLE","Weather service unavailable.")}}
window.MLIFallback={reverseGeocode,weather};
})();
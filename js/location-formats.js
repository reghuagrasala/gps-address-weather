(function(){
"use strict";
const DIGIPIN_GRID=[["F","C","9","8"],["J","3","2","7"],["K","4","5","6"],["L","M","P","T"]];
function digipin(lat,lon){
 if(!Number.isFinite(lat)||!Number.isFinite(lon)) return "—";
 if(lat<2.5||lat>38.5||lon<63.5||lon>99.5) return "Outside India";
 let minLat=2.5,maxLat=38.5,minLon=63.5,maxLon=99.5,out="";
 for(let i=0;i<10;i++){
  const h=(maxLat-minLat)/4,w=(maxLon-minLon)/4;
  const row=Math.min(3,Math.max(0,Math.floor((maxLat-lat)/h)));
  const col=Math.min(3,Math.max(0,Math.floor((lon-minLon)/w)));
  out+=DIGIPIN_GRID[row][col];
  const nextMaxLat=maxLat-row*h;
  const nextMinLon=minLon+col*w;
  minLat=nextMaxLat-h; maxLat=nextMaxLat;
  minLon=nextMinLon; maxLon=nextMinLon+w;
 }
 return out;
}
function dms(value,isLat){
 if(!Number.isFinite(value)) return "—";
 const a=Math.abs(value),deg=Math.floor(a),minutesFloat=(a-deg)*60;
 const min=Math.floor(minutesFloat),sec=((minutesFloat-min)*60).toFixed(1);
 const hem=isLat?(value>=0?"N":"S"):(value>=0?"E":"W");
 return deg+"°"+String(min).padStart(2,"0")+"′"+String(sec).padStart(4,"0")+"″ "+hem;
}
function bearing(value){
 if(!Number.isFinite(value)||value<0) return "—";
 const names=["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
 return Math.round(value)+"° "+names[Math.round(value/22.5)%16];
}
const OLC_ALPHABET="23456789CFGHJMPQRVWX";
function plusCode(lat,lon){
 if(!Number.isFinite(lat)||!Number.isFinite(lon)) return "—";
 lat=Math.min(90,Math.max(-90,lat));
 if(lat===90) lat=90-1e-12;
 lon=((lon+180)%360+360)%360-180;
 let latInt=Math.floor((lat+90)*8000);
 let lonInt=Math.floor((lon+180)*8000);
 let code="";
 for(let i=0;i<5;i++){
  const latDigit=latInt%20;
  const lonDigit=lonInt%20;
  code=OLC_ALPHABET[latDigit]+OLC_ALPHABET[lonDigit]+code;
  latInt=Math.floor(latInt/20);
  lonInt=Math.floor(lonInt/20);
 }
 return code.slice(0,8)+"+"+code.slice(8);
}
window.LocationFormats={digipin,dms,bearing,plusCode};
})();
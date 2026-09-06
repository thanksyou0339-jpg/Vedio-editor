(() => {

"use strict";

const canvas=document.getElementById("canvas");
const ctx=canvas.getContext("2d");

const imageInput=document.getElementById("imageInput");

const productName=document.getElementById("productName");
const price=document.getElementById("price");
const delivery=document.getElementById("delivery");
const brand=document.getElementById("brand");
const description=document.getElementById("description");
const orderLink=document.getElementById("orderLink");

const durationInput=document.getElementById("duration");

const previewBtn=document.getElementById("previewBtn");
const createBtn=document.getElementById("createBtn");
const stopBtn=document.getElementById("stopBtn");
const resetBtn=document.getElementById("resetBtn");

const statusBox=document.getElementById("status");
const downloadLink=document.getElementById("downloadLink");

let productImage=null;
let animationFrame=null;
let previewRunning=false;
let recording=false;
let recorder=null;
let recordedChunks=[];
let videoUrl=null;


// ==========================================
// TEXT CONFIG
// ==========================================

const textConfig={

brand:{
font:"brandFont",
size:"brandSize",
color:"brandColor",
colorCode:"brandColorCode",
bold:"brandBold",
style:"brandStyle",
animation:"brandAnimation"
},

name:{
font:"nameFont",
size:"nameSize",
color:"nameColor",
colorCode:"nameColorCode",
bold:"nameBold",
style:"nameStyle",
animation:"nameAnimation"
},

price:{
font:"priceFont",
size:"priceSize",
color:"priceColor",
colorCode:"priceColorCode",
bold:"priceBold",
style:"priceStyle",
animation:"priceAnimation"
},

delivery:{
font:"deliveryFont",
size:"deliverySize",
color:"deliveryColor",
colorCode:"deliveryColorCode",
bold:"deliveryBold",
style:"deliveryStyle",
animation:"deliveryAnimation"
},

description:{
font:"descriptionFont",
size:"descriptionSize",
color:"descriptionColor",
colorCode:"descriptionColorCode",
bold:"descriptionBold",
style:"descriptionStyle"
}

};


// ==========================================
// GET TEXT STYLE
// ==========================================

function getTextStyle(type){

const c=textConfig[type];

return {

font:document.getElementById(c.font).value,

size:Number(
document.getElementById(c.size).value
)||20,

color:document.getElementById(c.color).value,

bold:document.getElementById(c.bold).checked,

style:document.getElementById(c.style).value,

animation:c.animation
?document.getElementById(c.animation).value
:"static"

};

}


// ==========================================
// COLOR SYNC
// ==========================================

Object.keys(textConfig).forEach(type=>{

const c=textConfig[type];

const color=document.getElementById(c.color);
const code=document.getElementById(c.colorCode);

color.addEventListener("input",()=>{

code.value=color.value.toUpperCase();

renderFrame(0);

});

code.addEventListener("change",()=>{

let value=code.value.trim();

if(!value.startsWith("#")){
value="#"+value;
}

if(/^#[0-9A-Fa-f]{6}$/.test(value)){

color.value=value;

code.value=value.toUpperCase();

renderFrame(0);

}

});

});


// ==========================================
// HELPERS
// ==========================================

function clamp(v,min,max){
return Math.max(min,Math.min(max,v));
}

function easeOut(t){
return 1-Math.pow(1-t,3);
}

function setStatus(text){
statusBox.textContent=text;
}

function roundedRect(ctx,x,y,w,h,r){

r=Math.min(r,w/2,h/2);

ctx.beginPath();

ctx.moveTo(x+r,y);
ctx.lineTo(x+w-r,y);

ctx.quadraticCurveTo(x+w,y,x+w,y+r);

ctx.lineTo(x+w,y+h-r);

ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);

ctx.lineTo(x+r,y+h);

ctx.quadraticCurveTo(x,y+h,x,y+h-r);

ctx.lineTo(x,y+r);

ctx.quadraticCurveTo(x,y,x+r,y);

ctx.closePath();

}


// ==========================================
// IMAGE
// ==========================================

imageInput.addEventListener("change",function(){

const file=this.files&&this.files[0];

if(!file)return;

if(!file.type.startsWith("image/")){

setStatus("❌ یہ image file نہیں ہے۔");
return;

}

const reader=new FileReader();

reader.onload=e=>{

const img=new Image();

img.onload=()=>{

productImage=img;

setStatus("✅ Product image successfully loaded.");

renderFrame(0);

};

img.onerror=()=>{

setStatus("❌ Image load نہیں ہو سکی۔");

};

img.src=e.target.result;

};

reader.onerror=()=>{

setStatus("❌ File read نہیں ہو سکی۔");

};

reader.readAsDataURL(file);

});


// ==========================================
// ANIMATION
// ==========================================

function getAnimation(type,p){

let x=0;
let y=0;
let scale=1;
let rotation=0;
let opacity=1;

p=clamp(p,0,1);

switch(type){

case"static":
break;

case"slideLeft":
x=500*(1-easeOut(p));
break;

case"slideRight":
x=-500*(1-easeOut(p));
break;

case"slideUp":
y=400*(1-easeOut(p));
break;

case"slideDown":
y=-400*(1-easeOut(p));
break;

case"zoom":
scale=.15+.85*easeOut(p);
break;

case"bounce":
y=-35*Math.abs(Math.sin(p*Math.PI*3))*(1-p);
break;

case"spin":
rotation=p*Math.PI*2;
scale=.7+.3*easeOut(p);
break;

case"orbit":{

const angle=p*Math.PI*2;

x=Math.cos(angle)*115;
y=Math.sin(angle)*32;

const perspective=(Math.sin(angle)+1)/2;

scale=.72+perspective*.35;

rotation=angle+Math.PI/2;

opacity=.55+perspective*.45;

break;
}

case"float":

y=Math.sin(p*Math.PI*4)*22;
rotation=Math.sin(p*Math.PI*2)*.04;

break;

case"shake":

x=Math.sin(p*Math.PI*20)*12*(1-p);
rotation=Math.sin(p*Math.PI*16)*.06*(1-p);

break;

case"pop":

if(p<.7){

const q=p/.7;
scale=.1+easeOut(q)*1.08;

}else{

const q=(p-.7)/.3;
scale=1.08-q*.08;

}

break;

case"fade":

opacity=easeOut(p);

break;

}

return{x,y,scale,rotation,opacity};

}


// ==========================================
// DRAW TEXT WITH 3D SUPPORT
// ==========================================

function drawAnimatedText(
text,
x,
y,
type,
progress,
maxWidth
){

if(!text)return;

const s=getTextStyle(type);

const a=getAnimation(
s.animation,
progress
);

ctx.save();

ctx.translate(
x+a.x,
y+a.y
);

ctx.rotate(a.rotation);

ctx.scale(
a.scale,
a.scale
);

ctx.globalAlpha=
clamp(a.opacity,0,1);

ctx.direction="rtl";
ctx.textAlign="center";
ctx.textBaseline="middle";

const weight=s.bold?"bold":"normal";

ctx.font=
`${weight} ${s.size}px "${s.font}"`;


// ======================================
// REALISTIC 3D EXTRUSION
// ======================================

if(s.style==="3d"){

const depth=9;

for(let d=depth;d>=1;d--){

ctx.fillStyle=
"rgba(0,0,0,.65)";

ctx.fillText(
text,
d,
d,
maxWidth
);

}

// extra highlight edge

ctx.strokeStyle="rgba(255,255,255,.25)";
ctx.lineWidth=2;

ctx.strokeText(
text,
0,
0,
maxWidth
);

}


// ======================================
// NORMAL TEXT
// ======================================

ctx.lineWidth=7;

ctx.strokeStyle=
"rgba(0,0,0,.55)";

ctx.strokeText(
text,
0,
0,
maxWidth
);

ctx.fillStyle=s.color;

ctx.fillText(
text,
0,
0,
maxWidth
);

ctx.restore();

}


// ==========================================
// WRAP TEXT
// ==========================================

function wrapText(text,maxWidth,fontSize,font,bold){

const weight=bold?"bold":"normal";

ctx.font=
`${weight} ${fontSize}px "${font}"`;

const words=String(text||"").split(/\s+/);

const lines=[];

let current="";

for(const word of words){

const test=
current
?current+" "+word
:word;

if(ctx.measureText(test).width<=maxWidth){

current=test;

}else{

if(current)lines.push(current);

current=word;

}

}

if(current)lines.push(current);

return lines;

}


// ==========================================
// BACKGROUND
// ==========================================

function drawBackground(progress){

const gradient=
ctx.createLinearGradient(
0,0,
canvas.width,
canvas.height
);

gradient.addColorStop(0,"#111827");
gradient.addColorStop(.5,"#1e3a8a");
gradient.addColorStop(1,"#581c87");

ctx.fillStyle=gradient;

ctx.fillRect(
0,0,
canvas.width,
canvas.height
);

for(let i=0;i<7;i++){

const x=
(i*97+progress*160)
%(canvas.width+150)-75;

const y=
100+i*125+
Math.sin(progress*Math.PI*2+i)*25;

const radius=25+i*5;

ctx.beginPath();

ctx.arc(
x,y,radius,
0,
Math.PI*2
);

ctx.fillStyle=
"rgba(255,255,255,.055)";

ctx.fill();

}

}


// ==========================================
// PRODUCT IMAGE
// ==========================================

function drawProduct(progress){

const centerX=canvas.width/2;
const centerY=410;

const boxW=430;
const boxH=360;

ctx.save();

ctx.shadowBlur=30;
ctx.shadowOffsetY=15;
ctx.shadowColor="rgba(0,0,0,.45)";

roundedRect(
ctx,
centerX-boxW/2,
centerY-boxH/2,
boxW,
boxH,
30
);

ctx.fillStyle="rgba(255,255,255,.97)";
ctx.fill();

ctx.restore();

if(!productImage){

ctx.save();

ctx.fillStyle="#374151";

ctx.font="bold 25px Arial";

ctx.textAlign="center";
ctx.textBaseline="middle";

ctx.fillText(
"📷 PRODUCT IMAGE",
centerX,
centerY
);

ctx.restore();

return;

}

const img=productImage;

const imageProgress=
(Math.sin(progress*Math.PI*2)+1)/2;

const zoom=1+imageProgress*.045;

const maxW=390*zoom;
const maxH=320*zoom;

const ratio=Math.min(
maxW/img.width,
maxH/img.height
);

const w=img.width*ratio;
const h=img.height*ratio;

const x=centerX-w/2;
const y=centerY-h/2;

ctx.save();

const tilt=
Math.sin(progress*Math.PI*2)*.035;

ctx.translate(centerX,centerY);

ctx.transform(
1,
tilt,
tilt,
1,
0,
0
);

ctx.translate(-centerX,-centerY);

roundedRect(
ctx,
centerX-boxW/2+8,
centerY-boxH/2+8,
boxW-16,
boxH-16,
25
);

ctx.clip();

ctx.drawImage(
img,
x,
y,
w,
h
);

ctx.restore();

}


// ==========================================
// MAIN FRAME
// ==========================================

function renderFrame(progress){

const W=canvas.width;

ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);

drawBackground(progress);


// BRAND

const brandStyle=getTextStyle("brand");

drawAnimatedText(
brand.value,
W/2,
70,
"brand",
progress,
480
);


// PRODUCT

drawProduct(progress);


// PRODUCT NAME

drawAnimatedText(
productName.value,
W/2,
635,
"name",
progress,
500
);


// PRICE BACKGROUND

ctx.save();

roundedRect(
ctx,
120,
685,
300,
82,
25
);

ctx.fillStyle="rgba(255,255,255,.12)";
ctx.fill();

ctx.restore();


// PRICE

drawAnimatedText(
price.value,
W/2,
725,
"price",
progress,
430
);


// DELIVERY

drawAnimatedText(
delivery.value,
W/2,
805,
"delivery",
progress,
480
);


// DESCRIPTION

const ds=getTextStyle("description");

const desc=description.value.trim();

if(desc){

const lines=wrapText(
desc,
440,
ds.size,
ds.font,
ds.bold
);

ctx.save();

ctx.globalAlpha=.95;

const weight=ds.bold?"bold":"normal";

ctx.font=
`${weight} ${ds.size}px "${ds.font}"`;

ctx.textAlign="center";
ctx.textBaseline="middle";

const startY=
855-(lines.length-1)*(ds.size*.65);

lines.forEach((line,index)=>{

if(ds.style==="3d"){

for(let d=7;d>=1;d--){

ctx.fillStyle="rgba(0,0,0,.55)";

ctx.fillText(
line,
W/2+d,
startY+index*(ds.size+8)+d
);

}

}

ctx.fillStyle=ds.color;

ctx.fillText(
line,
W/2,
startY+index*(ds.size+8)
);

});

ctx.restore();

}


// ORDER BUTTON

ctx.save();

roundedRect(
ctx,
150,
915,
240,
35,
17
);

ctx.fillStyle="#f59e0b";
ctx.fill();

ctx.fillStyle="#111827";

ctx.font="bold 18px Arial";

ctx.textAlign="center";
ctx.textBaseline="middle";

ctx.fillText(
"ORDER NOW",
W/2,
933
);

ctx.restore();

}


// ==========================================
// PREVIEW
// ==========================================

function startPreview(){

stopEverything();

previewRunning=true;

const duration=
Number(durationInput.value);

const start=performance.now();

setStatus("▶ Preview چل رہا ہے...");

function loop(now){

if(!previewRunning)return;

const elapsed=
(now-start)/1000;

const progress=
(elapsed%duration)/duration;

renderFrame(progress);

animationFrame=
requestAnimationFrame(loop);

}

animationFrame=
requestAnimationFrame(loop);

}


// ==========================================
// STOP
// ==========================================

function stopEverything(){

previewRunning=false;

if(animationFrame){

cancelAnimationFrame(
animationFrame
);

animationFrame=null;

}

if(
recorder &&
recorder.state!=="inactive"
){

recorder.stop();

}

}


// ==========================================
// CREATE VIDEO
// ==========================================

function createVideo(){

stopEverything();

if(
!canvas.captureStream||
!window.MediaRecorder
){

setStatus(
"❌ آپ کے browser میں video recording support نہیں ہے۔ Google Chrome استعمال کریں۔"
);

return;

}

const duration=
Number(durationInput.value);

const stream=
canvas.captureStream(30);

let mimeType=
"video/webm;codecs=vp9";

if(!MediaRecorder.isTypeSupported(mimeType)){

mimeType=
"video/webm;codecs=vp8";

}

if(!MediaRecorder.isTypeSupported(mimeType)){

mimeType="video/webm";

}

try{

recorder=
new MediaRecorder(
stream,
{
mimeType,
videoBitsPerSecond:5000000
}
);

}catch(error){

setStatus(
"❌ Recorder start نہیں ہو سکا: "+
error.message
);

return;

}

recordedChunks=[];

recorder.ondataavailable=e=>{

if(
e.data &&
e.data.size>0
){

recordedChunks.push(e.data);

}

};

recorder.onerror=()=>{

setStatus(
"❌ Video recording error."
);

recording=false;

};

recorder.onstop=()=>{

recording=false;

const blob=
new Blob(
recordedChunks,
{type:mimeType}
);

if(videoUrl){

URL.revokeObjectURL(
videoUrl
);

}

videoUrl=
URL.createObjectURL(blob);

downloadLink.href=videoUrl;

downloadLink.download=
"product-video.webm";

downloadLink.style.display=
"inline-block";

setStatus(
"✅ Video تیار ہے۔ Download Video دبائیں۔"
);

};

downloadLink.style.display="none";

recording=true;

setStatus(
"🎥 Video بن رہی ہے... "+
duration+
" seconds انتظار کریں۔"
);

recorder.start(100);

const start=performance.now();

function recordFrame(now){

if(!recording)return;

const elapsed=
(now-start)/1000;

const progress=
clamp(elapsed/duration,0,1);

renderFrame(progress);

if(elapsed>=duration){

renderFrame(1);

setTimeout(()=>{

if(
recorder &&
recorder.state!=="inactive"
){

recorder.stop();

}

},150);

return;

}

animationFrame=
requestAnimationFrame(recordFrame);

}

animationFrame=
requestAnimationFrame(recordFrame);

}


// ==========================================
// RESET
// ==========================================

function resetAll(){

stopEverything();

productImage=null;

imageInput.value="";

productName.value="Beautiful Product";
price.value="Rs. 999";
delivery.value="FREE DELIVERY";
brand.value="WAQAR";

description.value=
"High quality product. Order now and get it delivered to your doorstep.";

orderLink.value="";

durationInput.value="15";


// Brand

document.getElementById("brandFont").value="Arial Black";
document.getElementById("brandSize").value="50";
document.getElementById("brandColor").value="#fbbf24";
document.getElementById("brandColorCode").value="#FBBF24";
document.getElementById("brandBold").checked=true;
document.getElementById("brandStyle").value="3d";
document.getElementById("brandAnimation").value="orbit";


// Name

document.getElementById("nameFont").value="Arial";
document.getElementById("nameSize").value="38";
document.getElementById("nameColor").value="#ffffff";
document.getElementById("nameColorCode").value="#FFFFFF";
document.getElementById("nameBold").checked=true;
document.getElementById("nameStyle").value="normal";
document.getElementById("nameAnimation").value="slideLeft";


// Price

document.getElementById("priceFont").value="Impact";
document.getElementById("priceSize").value="42";
document.getElementById("priceColor").value="#fde047";
document.getElementById("priceColorCode").value="#FDE047";
document.getElementById("priceBold").checked=true;
document.getElementById("priceStyle").value="3d";
document.getElementById("priceAnimation").value="zoom";


// Delivery

document.getElementById("deliveryFont").value="Arial Black";
document.getElementById("deliverySize").value="30";
document.getElementById("deliveryColor").value="#86efac";
document.getElementById("deliveryColorCode").value="#86EFAC";
document.getElementById("deliveryBold").checked=true;
document.getElementById("deliveryStyle").value="normal";
document.getElementById("deliveryAnimation").value="float";


// Description

document.getElementById("descriptionFont").value="Arial";
document.getElementById("descriptionSize").value="18";
document.getElementById("descriptionColor").value="#f3f4f6";
document.getElementById("descriptionColorCode").value="#F3F4F6";
document.getElementById("descriptionBold").checked=false;
document.getElementById("descriptionStyle").value="normal";


downloadLink.style.display="none";

if(videoUrl){

URL.revokeObjectURL(videoUrl);

videoUrl=null;

}

renderFrame(0);

setStatus(
"Reset ہوگیا۔ اب Product Image لگائیں۔"
);

}


// ==========================================
// LIVE UPDATE
// ==========================================

const liveInputs=[

productName,
price,
delivery,
brand,
description,

...document.querySelectorAll(
"select,input[type=number],input[type=checkbox]"
)

];

liveInputs.forEach(element=>{

element.addEventListener(
"input",
()=>{

if(!previewRunning&&!recording){

renderFrame(0);

}

}
);

element.addEventListener(
"change",
()=>{

if(!previewRunning&&!recording){

renderFrame(0);

}

}
);

});


// ==========================================
// BUTTONS
// ==========================================

previewBtn.addEventListener(
"click",
startPreview
);

createBtn.addEventListener(
"click",
createVideo
);

stopBtn.addEventListener(
"click",
()=>{

stopEverything();

renderFrame(0);

setStatus("⛔ Stopped.");

}
);

resetBtn.addEventListener(
"click",
resetAll
);


// ==========================================
// INITIAL
// ==========================================

renderFrame(0);

})();

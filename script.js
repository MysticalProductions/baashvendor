const API_URL = "https://script.google.com/macros/s/AKfycbxMz48LASOHJ4lMvArhtYQpjl-Kp-GSVRN0CN_6YSL8yBAWHJ7ayAK9FejV7H8Br-77/exec";
const LOCATION_API = "https://countriesnow.space/api/v0.1";

let currentStep = 1;
let drawing = false;
let hasSignature = false;
let processTimer = null;

const form = document.getElementById("registrationForm");
const canvas = document.getElementById("signaturePad");
const ctx = canvas.getContext("2d");
const stateSelect = document.getElementById("state");
const citySelect = document.getElementById("city");

/* ---------- Welcome / navigation ---------- */
function startRegistration(){
  document.getElementById("welcomePage").classList.add("hidden");
  document.getElementById("registrationPage").classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
}

document.getElementById("startRegistration").addEventListener("click", startRegistration);
document.getElementById("homeButton").addEventListener("click", ()=>{
  if(!document.getElementById("registrationPage").classList.contains("hidden")){
    if(!confirm("Return to the welcome page? Your entered information will remain on this page.")) return;
  }
  document.getElementById("registrationPage").classList.add("hidden");
  document.getElementById("welcomePage").classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
});

document.getElementById("successHome").addEventListener("click",()=>location.reload());

/* ---------- Validation ---------- */
function setCustomMessages(){
  const fields = form.querySelectorAll("input, select, textarea");
  fields.forEach(field=>{
    field.addEventListener("input",()=>{
      if(field.name === "ownerMobile" || field.name === "pinCode") field.value = field.value.replace(/\D/g, "");
      if(field.name === "panNumber" || field.name === "gstNumber") field.value = field.value.toUpperCase().replace(/\s/g, "");
      if(field.name === "ownerName") field.value = field.value.replace(/[^A-Za-zÀ-ÖØ-öø-ÿ.' -]/g, "");
    });
  });
}

function validateStep(step){
  const section = document.querySelector(`.form-step[data-step="${step}"]`);
  if(!section) return true;

  if(step === 3){
    for(const input of section.querySelectorAll('input[type="file"]')){
      if(input.required && !input.files.length){
        alert(`Please upload: ${input.closest(".upload-card").querySelector("strong").innerText.replace(" *","")}`);
        input.closest(".upload-card").scrollIntoView({behavior:"smooth",block:"center"});
        return false;
      }
      if(input.files[0] && input.files[0].size > 10 * 1024 * 1024){
        alert(`The file "${input.files[0].name}" is larger than 10 MB.`);
        return false;
      }
    }
  }

  const fields = [...section.querySelectorAll("input,select,textarea")].filter(x=>x.type !== "file");
  for(const field of fields){
    if(!field.checkValidity()){
      field.reportValidity();
      field.focus({preventScroll:true});
      return false;
    }
  }

  if(step === 4){
    if(!document.getElementById("agreementAccepted").checked){
      alert("Please accept the vendor agreement before submitting.");
      return false;
    }
    if(!hasSignature){
      alert("Please draw your signature before submitting.");
      return false;
    }
  }
  return true;
}

function showStep(step){
  currentStep = step;
  document.querySelectorAll(".form-step").forEach(x=>x.classList.toggle("active", +x.dataset.step === step));
  document.querySelectorAll(".progress-item").forEach(x=>{
    const n = +x.dataset.step;
    x.classList.toggle("active", n === step);
    x.classList.toggle("done", n < step);
  });
  document.getElementById("stepNumber").textContent = step;
  if(step === 4) populateAgreement();
  window.scrollTo({top:0,behavior:"smooth"});
}

document.querySelectorAll(".next").forEach(btn=>btn.addEventListener("click",()=>{
  if(validateStep(currentStep)) showStep(Math.min(4,currentStep+1));
}));
document.querySelectorAll(".back").forEach(btn=>btn.addEventListener("click",()=>showStep(Math.max(1,currentStep-1))));

/* ---------- State / city API ---------- */
async function loadStates(){
  stateSelect.innerHTML = '<option value="">Loading states…</option>';
  stateSelect.disabled = true;
  try{
    const response = await fetch(`${LOCATION_API}/countries/states`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({country:"India"})
    });
    const result = await response.json();
    if(result.error) throw new Error(result.msg || "Unable to load states");
    const states = result.data?.states || [];
    stateSelect.innerHTML = '<option value="">Select state</option>';
    states.sort((a,b)=>a.name.localeCompare(b.name)).forEach(item=>{
      const option = document.createElement("option");
      option.value = item.name;
      option.textContent = item.name;
      stateSelect.appendChild(option);
    });
    stateSelect.disabled = false;
    document.getElementById("stateStatus").textContent = `${states.length} states available.`;
  }catch(error){
    console.error(error);
    stateSelect.innerHTML = '<option value="">Unable to load states</option>';
    document.getElementById("stateStatus").textContent = "Please refresh the page and try again.";
  }
}

async function loadCities(state){
  citySelect.innerHTML = '<option value="">Loading cities…</option>';
  citySelect.disabled = true;
  document.getElementById("cityStatus").textContent = "Loading cities…";
  if(!state){
    citySelect.innerHTML = '<option value="">Select state first</option>';
    document.getElementById("cityStatus").textContent = "Select a state to load cities.";
    return;
  }
  try{
    const response = await fetch(`${LOCATION_API}/countries/state/cities`,{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({country:"India",state})
    });
    const result = await response.json();
    if(result.error) throw new Error(result.msg || "Unable to load cities");
    const cities = (result.data || []).filter(Boolean).sort((a,b)=>a.localeCompare(b));
    citySelect.innerHTML = '<option value="">Select city</option>';
    cities.forEach(city=>{
      const option = document.createElement("option");
      option.value = city;
      option.textContent = city;
      citySelect.appendChild(option);
    });
    citySelect.disabled = false;
    document.getElementById("cityStatus").textContent = `${cities.length} cities available.`;
  }catch(error){
    console.error(error);
    citySelect.innerHTML = '<option value="">Unable to load cities</option>';
    document.getElementById("cityStatus").textContent = "Could not load cities. Please refresh and try again.";
  }
}

stateSelect.addEventListener("change",()=>loadCities(stateSelect.value));
loadStates();

/* ---------- Upload UI ---------- */
document.querySelectorAll('.upload-card input[type="file"]').forEach(input=>{
  input.addEventListener("change",()=>{
    const card = input.closest(".upload-card");
    const name = card.querySelector(".file-name");
    if(input.files.length){
      if(input.files[0].size > 10 * 1024 * 1024){
        alert("Each document must be 10 MB or smaller.");
        input.value = "";
        name.textContent = "Choose file";
        card.classList.remove("has-file");
        return;
      }
      name.textContent = input.files[0].name;
      card.classList.add("has-file");
    }else{
      name.textContent = "Choose file";
      card.classList.remove("has-file");
    }
  });
});

/* ---------- Agreement ---------- */
function populateAgreement(){
  document.getElementById("agreementVenue").textContent = form.elements.venueName.value || "—";
  document.getElementById("agreementLegal").textContent = form.elements.legalName.value || "—";
  document.getElementById("agreementOwner").textContent = form.elements.ownerName.value || "—";
  const signatureName = document.getElementById("signatureName");
  if(!signatureName.value) signatureName.value = form.elements.legalName.value || form.elements.ownerName.value || "";
}

/* ---------- Signature ---------- */
ctx.lineWidth = 2.5;
ctx.lineCap = "round";
ctx.lineJoin = "round";

function getCanvasPoint(event){
  const rect = canvas.getBoundingClientRect();
  const touch = event.touches && event.touches.length ? event.touches[0] : event;
  return {x:(touch.clientX-rect.left)*(canvas.width/rect.width),y:(touch.clientY-rect.top)*(canvas.height/rect.height)};
}
function startSignature(event){
  event.preventDefault(); drawing=true; const p=getCanvasPoint(event); ctx.beginPath(); ctx.moveTo(p.x,p.y);
}
function drawSignature(event){
  if(!drawing) return; event.preventDefault(); const p=getCanvasPoint(event); ctx.lineTo(p.x,p.y); ctx.stroke(); hasSignature=true;
}
function stopSignature(){drawing=false;}
canvas.addEventListener("mousedown",startSignature); canvas.addEventListener("mousemove",drawSignature); window.addEventListener("mouseup",stopSignature);
canvas.addEventListener("touchstart",startSignature,{passive:false}); canvas.addEventListener("touchmove",drawSignature,{passive:false}); canvas.addEventListener("touchend",stopSignature);
document.getElementById("clearSignature").addEventListener("click",()=>{ctx.clearRect(0,0,canvas.width,canvas.height);hasSignature=false;});

/* ---------- Files / submission ---------- */
async function fileToBase64(file){
  if(!file) return null;
  const bytes = await file.arrayBuffer();
  let binary = "";
  const chunkSize = 0x8000;
  for(let i=0;i<bytes.byteLength;i+=chunkSize){
    binary += String.fromCharCode(...new Uint8Array(bytes,i,Math.min(chunkSize,bytes.byteLength-i)));
  }
  return {name:file.name,type:file.type||"application/octet-stream",data:btoa(binary)};
}
async function collectFiles(){
  const names=["tradeLicense","gstCertificate","ownerAadhaar","businessPan","cancelledCheque","otherLicense"];
  const files={};
  for(const name of names){const input=form.elements[name];files[name]=await fileToBase64(input?.files?.[0]||null);}
  return files;
}

function showProcessing(){
  const panel=document.getElementById("processingPanel");
  panel.classList.add("show"); panel.setAttribute("aria-hidden","false");
  let step=1;
  document.querySelectorAll(".processing-step").forEach(x=>x.classList.remove("active","done"));
  document.querySelector('.processing-step[data-process="1"]').classList.add("active");
  processTimer=setInterval(()=>{
    if(step>=4) return;
    document.querySelector(`.processing-step[data-process="${step}"]`).classList.remove("active");
    document.querySelector(`.processing-step[data-process="${step}"]`).classList.add("done");
    step++;
    document.querySelector(`.processing-step[data-process="${step}"]`).classList.add("active");
  },1800);
}
function hideProcessing(){
  if(processTimer) clearInterval(processTimer);
  const panel=document.getElementById("processingPanel");
  panel.classList.remove("show"); panel.setAttribute("aria-hidden","true");
}

form.addEventListener("submit",async event=>{
  event.preventDefault();
  if(!validateStep(4)) return;
  const submit=document.getElementById("submitBtn");
  submit.disabled=true;
  showProcessing();
  try{
    const payload={};
    const formData=new FormData(form);
    for(const [key,value] of formData.entries()) if(!(value instanceof File)) payload[key]=value;
    payload.files=await collectFiles();
    payload.contract={
      accepted:true,
      version:"DEMO-1.0",
      signerName:document.getElementById("signatureName").value.trim(),
      signatureDataUrl:canvas.toDataURL("image/png")
    };
    const response=await fetch(API_URL,{method:"POST",headers:{"Content-Type":"text/plain;charset=utf-8"},body:JSON.stringify(payload)});
    const text=await response.text();
    let result;
    try{result=JSON.parse(text);}catch{throw new Error("The registration server returned an unexpected response. Please try again.");}
    if(!result.success && !result.ok) throw new Error(result.error || "Submission failed");
    hideProcessing();
    showSuccess(result.registrationId);
  }catch(error){
    console.error(error);
    hideProcessing();
    submit.disabled=false;
    alert(error.message || "Unable to submit registration right now. Please try again.");
  }
});

function showSuccess(id){
  form.style.display="none";
  document.querySelector(".progress").style.display="none";
  document.querySelector(".intro").style.display="none";
  document.getElementById("registrationId").textContent=id||generateId();
  document.getElementById("successBox").classList.add("show");
  window.scrollTo({top:0,behavior:"smooth"});
}
function generateId(){
  const d=new Date(); const pad=n=>String(n).padStart(2,"0");
  return `BAASH-VEN-${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${Math.floor(1000+Math.random()*9000)}`;
}

setCustomMessages();

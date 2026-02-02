
/* ===== CONFIG ===== */
const BIN_ID="69809848ae596e708f0b60cd";
const API_KEY="$2a$10$SWRs0c4zsOCWZY5mPavGI.CFoLPsZilAUB1XKFEUU7r0kcOJ9jPSC";
const BASE_URL=`https://api.jsonbin.io/v3/b/${BIN_ID}`;

/* ===== PARAMS ===== */
const params=new URLSearchParams(location.search);
const isAdmin=params.get("admin")==="1";
const name=(params.get("query")||"You").replace(/^\w/,c=>c.toUpperCase());

/* ===== DEVICE ===== */
let deviceId=localStorage.getItem("device_id");
if(!deviceId){
  deviceId=crypto.randomUUID();
  localStorage.setItem("device_id",deviceId);
}

/* ===== AUDIO ===== */
const music=document.getElementById("bgMusic");
function startMusic(){
  music.muted=false;
  music.volume=0;
  music.play();
  let v=0;
  const i=setInterval(()=>{
    v+=0.05;
    music.volume=Math.min(v,0.6);
    if(v>=0.6) clearInterval(i);
  },200);
}
document.addEventListener("click",startMusic,{once:true});
document.addEventListener("touchstart",startMusic,{once:true});

/* ===== JSONBIN ===== */
async function getData(){
  const r=await fetch(BASE_URL,{headers:{ "X-Access-Key":API_KEY }});
  return (await r.json()).record;
}
async function saveYes(message){
  const data=await getData();
  data.responses.push({name,deviceId,message,time:new Date().toISOString()});
  await fetch(BASE_URL,{
    method:"PUT",
    headers:{ "Content-Type":"application/json","X-Access-Key":API_KEY },
    body:JSON.stringify(data)
  });
}

/* ===== PROPOSALS ===== */
const proposals=[
  "{Name}, I know what I feel. And I want you. Will you be mine?",
  "{Name}, I’m asking seriously. Will you be with me?",
  "{Name}, I want something real. With you. Will you be mine?",
  "{Name}, I choose you. Will you choose me?",
  "{Name}, I don’t want to assume. I want to ask. Will you be with me?"
];

function getRandomProposal(){
  return proposals[Math.floor(Math.random()*proposals.length)]
    .replace("{Name}",name);
}

/* ===== UI ===== */
const card=document.getElementById("card");
const modal=document.getElementById("modal");
const reply=document.getElementById("reply");

/* ===== ADMIN ===== */
function renderAdmin(list){
  card.innerHTML=`
    <h2 class="text-xl font-semibold mb-4">Admin Panel</h2>
    <div class="space-y-3 max-h-[60vh] overflow-y-auto text-left">
      ${list.map(r=>`
        <div class="p-3 bg-rose-50 rounded-xl">
          <div class="font-semibold">${r.name}</div>
          <div class="italic">"${r.message}"</div>
          <div class="text-xs text-gray-400">${new Date(r.time).toLocaleString()}</div>
        </div>
      `).join("")}
    </div>
  `;
}

/* ===== MAIN SCREENS ===== */
function renderStart(){
  const q=getRandomProposal();
  card.innerHTML=`
    <h1 class="text-3xl font-semibold">${name}</h1>

    <img class="mt-5 rounded-2xl mx-auto"
      src="https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif"/>

    <p class="mt-6 text-lg">${q}</p>

    <div class="mt-8 flex justify-center gap-4 relative">
      <button id="yes" class="px-6 py-3 rounded-full bg-pink-500 text-white">Yes</button>
      <button id="no" class="px-4 py-2 rounded-full bg-gray-200 text-sm">No</button>
    </div>

    <footer class="mt-6 text-xs text-gray-400">with love, for love ❤️</footer>
  `;

  runawayNo();
  document.getElementById("yes").onclick=()=>{
    burst();
    modal.classList.remove("hidden");
  };
}

function renderFinal(msg){
  card.innerHTML=`
    <h2 class="text-2xl">✨</h2>
    <p class="mt-4 text-lg">You chose this moment.</p>
    <blockquote class="mt-4 italic">"${msg}"</blockquote>
    <footer class="mt-6 text-xs text-gray-400">with love, for love ❤️</footer>
  `;
}

/* ===== SAVE ===== */
document.getElementById("save").onclick=async()=>{
  if(!reply.value.trim()) return;
  await saveYes(reply.value.trim());
  modal.classList.add("hidden");
  renderFinal(reply.value.trim());
};

/* ===== NO RUN ===== */
function runawayNo(){
  const no=document.getElementById("no");
  function run(x,y){
    const r=no.getBoundingClientRect();
    if(Math.hypot(x-(r.left+r.width/2),y-(r.top+r.height/2))<80){
      no.style.transform=`translate(${Math.random()*160-80}px,${Math.random()*120-60}px)`;
    }
  }
  document.addEventListener("mousemove",e=>run(e.clientX,e.clientY));
  document.addEventListener("touchmove",e=>{
    const t=e.touches[0]; run(t.clientX,t.clientY);
  },{passive:true});
}

/* ===== HEARTS ===== */
function burst(){
  for(let i=0;i<20;i++){
    const h=document.createElement("div");
    h.className="heart";
    h.innerText="❤️";
    h.style.left=Math.random()*100+"vw";
    h.style.top=Math.random()*100+"vh";
    document.body.appendChild(h);
    setTimeout(()=>h.remove(),1000);
  }
}

/* ===== INIT ===== */
(async()=>{
  const data=await getData();

  if(isAdmin){
    const pwd=prompt("Enter admin password");
    if(pwd==="mild") renderAdmin(data.responses);
    else card.innerHTML="<p class='text-red-500'>Access denied</p>";
    return;
  }

  const existing=[...data.responses].reverse()
    .find(r=>r.name===name && r.deviceId===deviceId);

  existing ? renderFinal(existing.message) : renderStart();
})();

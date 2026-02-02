/* ========= CONFIG ========= */
const BIN_ID="69809848ae596e708f0b60cd";
const API_KEY="$2a$10$SWRs0c4zsOCWZY5mPavGI.CFoLPsZilAUB1XKFEUU7r0kcOJ9jPSC";
const BASE_URL=`https://api.jsonbin.io/v3/b/${BIN_ID}`;

/* ========= PARAMS ========= */
const params=new URLSearchParams(location.search);
const isAdmin=params.get("admin")==="1";
const name=(params.get("query")||"You").replace(/^\w/,c=>c.toUpperCase());

/* ========= DEVICE ========= */
let deviceId=localStorage.getItem("device_id");
if(!deviceId){
  deviceId=crypto.randomUUID();
  localStorage.setItem("device_id",deviceId);
}

/* ========= AUDIO ========= */
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

/* ========= JSONBIN ========= */
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

/* ========= YES/NO PROPOSALS ========= */
const proposals=[
  "{Name}, would you like to be with me and see where this can honestly go?",
  "{Name}, do you want to choose us and give this a real chance?",
  "{Name}, would you like to start something meaningful with me?",
  "{Name}, do you see yourself choosing me the way I’m choosing you?",
  "{Name}, would you like us to move forward together, honestly?",
  "{Name}, do you want to build something real with me, step by step?",
  "{Name}, would you like to be my partner and see where this leads?",
  "{Name}, do you want to choose this connection with me?",
  "{Name}, would you like to explore something genuine with me?",
  "{Name}, do you want to be with me and give this a chance?",
  "{Name}, would you like us to choose each other today?",
  "{Name}, do you want to start something real with me?",
  "{Name}, would you like to walk this path with me?",
  "{Name}, do you feel ready to choose me the way I’m choosing you?",
  "{Name}, would you like to say yes to us?",
  "{Name}, do you want this to be more than just a moment?",
  "{Name}, would you like to build something meaningful together?",
  "{Name}, do you want to be with me and see this through?",
  "{Name}, would you like to choose me today?",
  "{Name}, do you want us to give this a real chance?"
];

/* ========= GIFS ========= */
const gifs=[
  "https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif",
  "https://media.giphy.com/media/l0MYt5jPR6QX5pnqM/giphy.gif",
  "https://media.giphy.com/media/26FLdmIp6wJr91JAI/giphy.gif",
  "https://media.giphy.com/media/xTiTnMhJTwNHChdTZS/giphy.gif",
  "https://media.giphy.com/media/MDJ9IbxxvDUQM/giphy.gif",
  "https://media.giphy.com/media/JIX9t2j0ZTN9S/giphy.gif"
];

function rand(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}

/* ========= UI ========= */
const card=document.getElementById("card");
const modal=document.getElementById("modal");

/* ========= ADMIN ========= */
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

/* ========= START PAGE ========= */
function renderStart(){
  const proposal=rand(proposals).replace("{Name}",name);
  const gif=rand(gifs);

  card.innerHTML=`
    <h1 class="text-3xl font-semibold">${name}</h1>

    <img src="${gif}" class="mt-5 rounded-2xl mx-auto shadow-md"/>

    <p class="mt-6 text-lg leading-relaxed">
      ${proposal}
    </p>

    <div class="mt-8 flex justify-center gap-4 relative">
      <button id="yes"
        class="px-6 py-3 rounded-full bg-pink-500 text-white">
        Yes
      </button>
      <button id="no"
        class="px-4 py-2 rounded-full bg-gray-200 text-sm">
        No
      </button>
    </div>

    <footer class="mt-6 text-xs text-gray-400">
      with love, for love ❤️
    </footer>
  `;

  runawayNo();

  document.getElementById("yes").onclick=()=>{
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  };
}

/* ========= FINAL PAGE ========= */
function renderFinal(msg){
  card.innerHTML=`
    <h2 class="text-2xl">✨</h2>

    <p class="mt-4 text-lg leading-relaxed text-gray-800">
      You chose <span class="font-medium">yes</span>.<br>
      And that choice means something real.
    </p>

    <p class="mt-4 text-sm text-gray-600">
      This wasn’t impulse.  
      It was intention.
    </p>

    <blockquote class="mt-6 italic text-gray-700 border-l-4 border-rose-400 pl-4">
      "${msg}"
    </blockquote>

    <footer class="mt-6 text-xs text-gray-400">
      with love, for love ❤️
    </footer>
  `;
}

/* ========= SAVE ========= */
document.getElementById("save").onclick=async()=>{
  const msg=document.getElementById("reply").value.trim();
  if(!msg) return;
  await saveYes(msg);
  modal.classList.add("hidden");
  renderFinal(msg);
};

/* ========= NO BUTTON RUN ========= */
function runawayNo(){
  const no=document.getElementById("no");
  function run(x,y){
    const r=no.getBoundingClientRect();
    if(Math.hypot(x-(r.left+r.width/2),y-(r.top+r.height/2))<80){
      no.style.transform=
        `translate(${Math.random()*160-80}px,${Math.random()*120-60}px)`;
    }
  }
  document.addEventListener("mousemove",e=>run(e.clientX,e.clientY));
  document.addEventListener("touchmove",e=>{
    const t=e.touches[0]; run(t.clientX,t.clientY);
  },{passive:true});
}

/* ========= INIT ========= */
(async()=>{
  const data=await getData();

  if(isAdmin){
    const pwd=prompt("Enter admin password");
    pwd==="mild"
      ? renderAdmin(data.responses)
      : card.innerHTML="<p class='text-red-500'>Access denied</p>";
    return;
  }

  const existing=[...data.responses].reverse()
    .find(r=>r.name===name && r.deviceId===deviceId);

  existing ? renderFinal(existing.message) : renderStart();
})();

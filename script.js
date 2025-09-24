const questions=[
 {q:"¿Quién se viste primero?",opts:["instrumentista","cirujano","ayudante","anestesiologo"],answer:"instrumentista",slots:1},
 {q:"¿Qué tipo de vestido realiza?",opts:["vestido-asistido","vestido-autonomo"],answer:"vestido-autonomo",slots:1},
 {q:"¿Qué vestimenta necesita usar para entrar al acto quirúrgico y en qué orden se debe colocar?",opts:["gorro","cubrebocas","botas","bata", "reloj", "lentes-protectores"],answer:["bata","cubrebocas","gorro","botas"],slots:4},
 {q:"¿Qué tipo de enguantado realiza?",opts:["asistido2","enguantado-autonomo"],answer:"enguantado-autonomo",slots:1},
 {q:"¿A quién viste el instrumentista en primer lugar?",opts:["anestesiologo","cirujano","ayudante"],answer:"ayudante",slots:1},
 {q:"¿Qué tipo de enguantado hace la segunda persona en vestirse?",opts:["autonomo","asistido"],answer:"asistido",slots:1}
];

const descriptions = {
  "instrumentista": "Instrumentista",
  "cirujano": "Cirujano",
  "ayudante": "Primer ayudante",
  "anestesiologo": "Anestesiologo",
  "vestido-asistido": "Vestido asistido",
  "vestido-autonomo": "Vestido autonomo",
  "gorro": "Gorro",
  "cubrebocas": "Cubrebocas",
  "botas": "Botas",
  "bata": "Pijama qx",
  "asistido2": "Enguantado asistido",
  "enguantado-autonomo": "Enguantado autónomo",
  "autonomo": "Enguantado autónomo",
  "asistido": "Enguantado asistido",
   "reloj": "Reloj", 
   "lentes-protectores": "Lentes protectores"
};

let current=0,score=0,highScore=localStorage.getItem("highScore")||0;
let timer, timeLeft=15;
document.getElementById("highScore").textContent=highScore;

function startGame(){
  document.getElementById("startScreen").style.display="none";
  document.getElementById("game").style.display="block";
  current=0;score=0;
  document.getElementById("score").textContent=score;
  document.getElementById("progressBar").style.width="0%";
  showQuestion();
}

function showQuestion(){
  clearInterval(timer);
  timeLeft=15;
  document.getElementById("timeLeft").textContent=timeLeft;
  document.getElementById("feedback").textContent = "";

  let q=questions[current];
  document.getElementById("question").textContent=q.q;

  let dz=document.getElementById("dropzones");
  dz.innerHTML="";
  for(let i=0;i<q.slots;i++){
    let z=document.createElement("div");
    z.className="dropzone";z.dataset.index=i;
    dz.appendChild(z);
  }

  let optDiv=document.getElementById("options");
  optDiv.innerHTML="";
  q.opts.forEach(opt=>{
    let wrapper = document.createElement("div");
    wrapper.className = "img-wrapper";

    let img=document.createElement("img");
    img.src="utils/imgs/"+ opt +".webp";
    img.alt=opt;
    img.draggable=true;
    img.dataset.key=opt;
    img.addEventListener("dragstart",dragStart);

    let tooltip = document.createElement("span");
    tooltip.className = "tooltip";
    tooltip.textContent = descriptions[opt] || opt;

    wrapper.appendChild(img);
    wrapper.appendChild(tooltip);
    optDiv.appendChild(wrapper);
  });

  setupDropzones();
  document.getElementById("confirmBtn").disabled = false;
  startTimer();
}

function startTimer(){
  timer=setInterval(()=>{
    timeLeft--;
    document.getElementById("timeLeft").textContent=timeLeft;
    if(timeLeft<=0){
      clearInterval(timer);
      autoFail();
    }
  },1000);
}

function autoFail(){
  document.getElementById("incorrectSound").play();
  document.getElementById("feedback").textContent="⏰ Tiempo agotado";
  document.getElementById("feedback").style.color="#ff1744";
  setTimeout(()=>{
    current++;
    document.getElementById("progressBar").style.width=(current/questions.length*100)+"%";
    if(current<questions.length){showQuestion();}
    else{endGame();}
  },1000);
}

let dragged=null;
function dragStart(e){
  dragged=e.target;
  e.dataTransfer.setData("text/plain", e.target.dataset.key);
}

function setupDropzones(){
  document.querySelectorAll(".dropzone").forEach(zone=>{
    zone.addEventListener("dragover",e=>{e.preventDefault();zone.classList.add("dragover")});
    zone.addEventListener("dragleave",()=>zone.classList.remove("dragover"));
    zone.addEventListener("drop",e=>{
      e.preventDefault();zone.classList.remove("dragover");
      let wrapper = dragged.parentElement;
      if(!zone.querySelector("img")){zone.appendChild(wrapper);}
      dragged = null;
    });
  });

  const optZone=document.getElementById("options");
  optZone.addEventListener("dragover",e=>e.preventDefault());
  optZone.addEventListener("drop", e => {
    e.preventDefault();
    if(dragged){
      let wrapper = dragged.parentElement;
      optZone.appendChild(wrapper);
      dragged = null;
    }
  });
}

document.addEventListener("dragend",()=>{if(dragged){dragged.style.display="block";dragged=null;}});

function checkAnswer(){
  clearInterval(timer);
  document.getElementById("confirmBtn").disabled = true;

  if(dragged){
    let wrapper = dragged.parentElement;
    document.getElementById("options").appendChild(wrapper);
    dragged.style.display = "block";
    dragged = null;
  }

  let q=questions[current];
  let chosen=[...document.querySelectorAll(".dropzone")]
    .map(z=>z.querySelector("img")?.dataset.key||null)
    .filter(x=>x);

  let correct=false;
  if(Array.isArray(q.answer)){
    correct=JSON.stringify(chosen)===JSON.stringify(q.answer);
  } else {
    correct=chosen[0]===q.answer;
  }

  if(correct){
    score++;document.getElementById("correctSound").play();
    document.getElementById("feedback").textContent="✅ Correcto";
    document.getElementById("feedback").style.color="#00e676";
  } else {
    document.getElementById("incorrectSound").play();
    document.getElementById("feedback").textContent="❌ Incorrecto";
    document.getElementById("feedback").style.color="#ff1744";
  }
  document.getElementById("score").textContent=score;

  setTimeout(()=>{
    dragged=null;
    current++;
    document.getElementById("progressBar").style.width=(current/questions.length*100)+"%";
    if(current<questions.length){showQuestion();}
    else{endGame();}
  },1000);
}

function endGame(){
  document.getElementById("finalScore").textContent = score;
  if(score > highScore){
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
  document.getElementById("bestScore").textContent = highScore;

  // Mostrar mensaje según puntaje
  let msg = "";
  if(score >= questions.length * 0.8){
    msg = "¡Excelente trabajo! Has demostrado un conocimiento sólido del protocolo de asepsia.";
  } else if(score >= questions.length * 0.5){
    msg = "Buen intento. Revisa los pasos de vestido y enguantado para perfeccionar la técnica.";
  } else {
    msg = "Necesitas practicar más. Vuelve a intentarlo para dominar cada movimiento.";
  }
  document.getElementById("scoreMessage").textContent = msg;

  document.getElementById("resultModal").style.display = "flex";
  clearInterval(timer);
}

function retry(){
  document.getElementById("resultModal").style.display="none";
  startGame();
}
function exitGame(){
  document.getElementById("resultModal").style.display="none";
  document.getElementById("game").style.display="none";
  document.getElementById("startScreen").style.display="flex";
  document.getElementById("highScore").textContent=highScore;
  clearInterval(timer);
}
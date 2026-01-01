const images = document.querySelectorAll('.visual');
const dots = document.querySelectorAll('.dots span');
const caption = document.getElementById('caption');
const nextBtn = document.getElementById('next');
const prevBtn = document.getElementById('prev');
const fullscreenBtn = document.getElementById('fullscreen');
const audioBtn = document.getElementById('toggleAudio');
const modeBtn = document.getElementById('toggleMode');
const ambient = document.getElementById('ambient');

let current = 0;

async function loadNASAImage() {
  try {
    const res = await fetch("https://api.nasa.gov/planetary/apod?api_key=6VIg0kOoD2PRkZIKmruMwiNa9jYGJLdRBQiH3aOd");
    const data = await res.json();

    // Buat elemen gambar baru
    const img = document.createElement("img");
    img.src = data.url;
    img.className = "visual";
    img.alt = data.title;

    // Tambahkan ke slideshow
    document.getElementById("slideshow").appendChild(img);

    // Tambahkan dot navigation
    const dot = document.createElement("span");
    document.querySelector(".dots").appendChild(dot);

    // Update caption otomatis
    caption.textContent = data.title;

    console.log("NASA APOD Loaded:", data.title);
  } catch (err) {
    console.error("Error loading NASA APOD:", err);
  }
}

loadNASAImage();


// Slideshow
function showImage(index) {
  images[current].classList.remove('active');
  dots[current].classList.remove('active');
  current = (index + images.length) % images.length;
  images[current].classList.add('active');
  dots[current].classList.add('active');
  caption.textContent = images[current].alt;
}
let autoTimer = setInterval(() => showImage(current + 1), 4000);
nextBtn.onclick = () => { clearInterval(autoTimer); showImage(current+1); };
prevBtn.onclick = () => { clearInterval(autoTimer); showImage(current-1); };
dots.forEach((dot,i)=>dot.onclick=()=>{clearInterval(autoTimer);showImage(i);});

// Fullscreen
fullscreenBtn.onclick = () => {
  const elem = document.getElementById('slideshow');
  if (elem.requestFullscreen) elem.requestFullscreen();
};

// Audio toggle
audioBtn.onclick = () => {
  if (ambient.paused) ambient.play(); else ambient.pause();
};

// Day/Night mode
modeBtn.onclick = () => {
  document.body.classList.toggle('day');
};

// Particle stars
const particlesCanvas = document.getElementById('particles');
const ctxP = particlesCanvas.getContext('2d');
particlesCanvas.width = 360; particlesCanvas.height = 640;
let stars = Array.from({length:100},()=>({x:Math.random()*360,y:Math.random()*640,r:Math.random()*1.5}));
function drawStars(){
  ctxP.clearRect(0,0,360,640);
  ctxP.fillStyle="white";
  stars.forEach(s=>{ctxP.beginPath();ctxP.arc(s.x,s.y,s.r,0,Math.PI*2);ctxP.fill();});
}
setInterval(drawStars,100);

// Meteors
const meteorsCanvas = document.getElementById('meteors');
const ctxM = meteorsCanvas.getContext('2d');
meteorsCanvas.width=360; meteorsCanvas.height=640;
let meteors=[];
function spawnMeteor(){ meteors.push({x:Math.random()*360,y:0,vx:-2,vy:4}); }
function drawMeteors(){
  ctxM.clearRect(0,0,360,640);
  ctxM.fillStyle="gold";
  meteors.forEach(m=>{ctxM.fillRect(m.x,m.y,2,10);m.x+=m.vx;m.y+=m.vy;});
  meteors=meteors.filter(m=>m.y<640);
}
setInterval(spawnMeteor,2000);
setInterval(drawMeteors,50);

// Spark interactivity
document.getElementById('slideshow').addEventListener('click',(e)=>{
  const spark=document.createElement('img');
  spark.src="assets/spark.png";
  spark.style.position="absolute";
  spark.style.left=e.offsetX+"px";
  spark.style.top=e.offsetY+"px";
  spark.style.width="20px";
  spark.style.pointerEvents="none";
  document.getElementById('slideshow').appendChild(spark);
  setTimeout(()=>spark.remove(),500);
});

/*******************************
 * Slideshow base + controls
 *******************************/
let visuals = document.querySelectorAll('.visual');
let dots = document.querySelectorAll('.dots span');
const caption = document.getElementById('caption');
let currentIndex = 0;

function showSlide(index) {
  visuals.forEach((v, i) => {
    v.classList.toggle('active', i === index);
    if (dots[i]) dots[i].classList.toggle('active', i === index);
  });
  caption.textContent = visuals[index]?.alt || 'Cosmic';
  currentIndex = index;
}

document.getElementById('prev').addEventListener('click', () => {
  showSlide((currentIndex - 1 + visuals.length) % visuals.length);
});
document.getElementById('next').addEventListener('click', () => {
  showSlide((currentIndex + 1) % visuals.length);
});
dots.forEach((dot, i) => dot.addEventListener('click', () => showSlide(i)));

document.getElementById('fullscreen').addEventListener('click', () => {
  if (!document.fullscreenElement) document.documentElement.requestFullscreen();
  else document.exitFullscreen();
});
const ambient = document.getElementById('ambient');
document.getElementById('toggleAudio').addEventListener('click', () => {
  if (ambient.paused) ambient.play(); else ambient.pause();
});
document.getElementById('toggleMode').addEventListener('click', () => {
  document.body.classList.toggle('day-mode');
});

/*******************************
 * NASA Multi-API Integration
 *******************************/

// 1) APOD → append image slide + dot
async function loadAPOD() {
  try {
    const res = await fetch('/nasa/apod');
    const data = await res.json();
    if (data.url) {
      const slideshow = document.getElementById('slideshow');
      const img = document.createElement('img');
      img.src = data.url;
      img.alt = data.title || 'NASA APOD';
      img.className = 'visual';
      slideshow.appendChild(img);

      const dot = document.createElement('span');
      document.querySelector('.dots').appendChild(dot);

      // re-sync visuals & dots
      visuals = document.querySelectorAll('.visual');
      dots = document.querySelectorAll('.dots span');
    }
  } catch (err) {
    console.error('APOD load error:', err);
  }
}

// 2) EPIC → append 1–3 Earth images as slides
async function loadEPIC() {
  try {
    const res = await fetch('/nasa/epic');
    const list = await res.json();
    const slideshow = document.getElementById('slideshow');
    const dotsContainer = document.querySelector('.dots');
    (list || []).forEach(item => {
      const img = document.createElement('img');
      img.src = item.url;
      img.alt = item.caption || `EPIC ${item.date}`;
      img.className = 'visual';
      slideshow.appendChild(img);
      dotsContainer.appendChild(document.createElement('span'));
    });
    visuals = document.querySelectorAll('.visual');
    dots = document.querySelectorAll('.dots span');
  } catch (err) {
    console.error('EPIC load error:', err);
  }
}

// 3) NeoWs → enrich caption + modulate meteor activity
async function loadNeoWS() {
  try {
    const res = await fetch('/nasa/neows');
    const data = await res.json();
    const nearEarthObjects = data.near_earth_objects || {};
    const days = Object.keys(nearEarthObjects);
    let total = 0, closeCalls = 0;

    days.forEach(day => {
      const arr = nearEarthObjects[day] || [];
      total += arr.length;
      arr.forEach(o => {
        const close = (o.close_approach_data || [])[0];
        if (close && close.miss_distance && Number(close.miss_distance.kilometers) < 1000000) {
          closeCalls++;
        }
      });
    });

    // Update caption with asteroid activity summary
    caption.textContent = `Asteroids today: ${total}, close calls: ${closeCalls}`;
  } catch (err) {
    console.error('NeoWs load error:', err);
  }
}

// Boot NASA multi-API
loadAPOD();
loadEPIC();
loadNeoWS();

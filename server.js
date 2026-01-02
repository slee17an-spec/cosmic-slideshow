// server.js
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const NASA_KEY = process.env.NASA_KEY || 'DEMO_KEY';

// === In-memory cache ===
const cache = {};
const CACHE_TTL = 1000 * 60 * 5; // 5 menit

function setCache(key, data) {
  cache[key] = { data, ts: Date.now() };
}
function getCache(key) {
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.ts > CACHE_TTL) {
    console.log(`[CACHE] Expired for ${key}, fetching fresh...`);
    delete cache[key];
    return null;
  }
  console.log(`[CACHE] Serving from cache: ${key}`);
  return entry.data;
}

// === Serve static files ===
app.use(express.static(__dirname));

// === Root route ===
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// === APOD ===
app.get('/nasa/apod', async (req, res) => {
  const key = 'apod';
  const cached = getCache(key);
  if (cached) return res.json(cached);

  try {
    console.log(`[FETCH] APOD fresh request...`);
    const dateParam = req.query.date ? `&date=${req.query.date}` : '';
    const r = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${NASA_KEY}${dateParam}`);
    const data = await r.json();
    setCache(key, data);
    res.json(data);
  } catch (e) {
    console.error('APOD error:', e);
    res.status(500).json({ error: 'APOD fetch failed' });
  }
});

// === NeoWs ===
app.get('/nasa/neows', async (req, res) => {
  const key = 'neows';
  const cached = getCache(key);
  if (cached) return res.json(cached);

  try {
    console.log(`[FETCH] NeoWs fresh request...`);
    const start = req.query.start_date || '';
    const end   = req.query.end_date || '';
    const range = start && end ? `&start_date=${start}&end_date=${end}` : '';
    const r = await fetch(`https://api.nasa.gov/neo/rest/v1/feed?api_key=${NASA_KEY}${range}`);
    const data = await r.json();
    setCache(key, data);
    res.json(data);
  } catch (e) {
    console.error('NeoWs error:', e);
    res.status(500).json({ error: 'NeoWs fetch failed' });
  }
});

// === EPIC ===
app.get('/nasa/epic', async (req, res) => {
  const key = 'epic';
  const cached = getCache(key);
  if (cached) return res.json(cached);

  try {
    console.log(`[FETCH] EPIC fresh request...`);
    const r = await fetch(`https://api.nasa.gov/EPIC/api/natural/images?api_key=${NASA_KEY}`);
    const list = await r.json();
    const out = (Array.isArray(list) ? list.slice(0, 3) : []).map(item => {
      const date = item.date;
      const [ymd] = date.split(' ');
      const [y, m, d] = ymd.split('-');
      const imgUrl = `https://api.nasa.gov/EPIC/archive/natural/${y}/${m}/${d}/png/${item.image}.png?api_key=${NASA_KEY}`;
      return { caption: item.caption, date: item.date, url: imgUrl };
    });
    setCache(key, out);
    res.json(out);
  } catch (e) {
    console.error('EPIC error:', e);
    res.status(500).json({ error: 'EPIC fetch failed' });
  }
});

// === Start server ===
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});

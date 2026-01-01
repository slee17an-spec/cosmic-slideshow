import express from "express";
import fetch from "node-fetch";

const app = express();

// Endpoint proxy NASA APOD
app.get("/api/nasa", async (req, res) => {
  try {
    const nasaRes = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_KEY}`);
    const data = await nasaRes.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch NASA APOD" });
  }
});

app.listen(3000, () => console.log("Server running on port 3000"));

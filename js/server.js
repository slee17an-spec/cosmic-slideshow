const express = require("express");
const axios = require("axios");

const url = "https://api.nasa.gov/planetary/apod?api_key=6VIg0kOoD2PRkZIKmruMwiNa9jYGJLdRBQiH3aOd";
console.log("NASA_KEY:", process.env.NASA_KEY);
const app = express();

app.get("/api/nasa", async (req, res) => {
  try {
    const url = `https://api.nasa.gov/planetary/apod?api_key=${process.env.NASA_KEY}`;
    console.log("Fetching:", url);

    const nasaRes = await axios.get(url); // ✅ axios handle HTTPS dengan baik
    console.log("Status:", nasaRes.status);

    const data = nasaRes.data;
    console.log("DATA:", data);

    res.json(data);
  } catch (err) {
  console.error("Error fetching NASA:", err); // log seluruh objek error
  res.status(500).json({ error: "Failed to fetch NASA APOD" });
}

});

app.listen(3000, () => console.log("Server running on port 3000"));

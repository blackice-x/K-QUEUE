import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import axios from "axios";
import cors from "cors";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Valorant Stats Proxy
  app.get("/api/valorant/stats/:riotId", async (req, res) => {
    const { riotId } = req.params;
    console.log(`Stats request for: ${riotId}`);
    
    try {
      const parts = riotId.split("#");
      
      if (parts.length !== 2) {
        return res.status(400).json({ error: "Invalid Riot ID format. Use Name#Tag" });
      }

      const name = parts[0].trim();
      const tag = parts[1].trim();
      
      if (!name || !tag) {
        return res.status(400).json({ error: "Name and Tag are required (e.g., Name#Tag)" });
      }

      // Tracker.gg Public API uses /riot/name%23tag
      const encodedRiotId = `${encodeURIComponent(name)}%23${encodeURIComponent(tag)}`;
      
      // Try Public API first, then fallback to internal if needed
      const publicUrl = `https://public-api.tracker.gg/v2/valorant/standard/profile/riot/${encodedRiotId}`;
      const internalUrl = `https://api.tracker.gg/api/v2/valorant/standard/profile/riot/${encodedRiotId}`;

      console.log(`Fetching from Tracker.gg Public API: ${publicUrl}`);

      const apiKey = process.env.TRACKER_GG_API_KEY || "3165e14f-3244-4784-aed8-144b520241fb";

      try {
        const response = await axios.get(publicUrl, {
          headers: {
            "TRN-Api-Key": apiKey,
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Referer": "https://tracker.gg/",
            "Origin": "https://tracker.gg"
          },
          timeout: 8000
        });
        console.log("Tracker.gg Public API success");
        return res.json(response.data);
      } catch (publicError: any) {
        console.warn("Public API failed, trying internal API fallback...");
        
        const response = await axios.get(internalUrl, {
          headers: {
            "TRN-Api-Key": apiKey,
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
            "Accept": "application/json",
            "Referer": "https://tracker.gg/",
            "Origin": "https://tracker.gg"
          },
          timeout: 8000
        });
        console.log("Tracker.gg Internal API success");
        return res.json(response.data);
      }
    } catch (error: any) {
      const status = error.response?.status || 500;
      const errorData = error.response?.data;
      
      console.error(`Tracker.gg API Error (${status}):`, errorData || error.message);
      
      let clientMessage = "Failed to fetch player stats";
      if (status === 404) {
        clientMessage = "Player not found. 1. Check your Riot ID (Name#Tag). 2. Make sure your profile is set to PUBLIC on Tracker.gg. 3. Search for yourself on Tracker.gg once to index your profile.";
      } else if (status === 403) {
        clientMessage = "Access denied. Tracker.gg is blocking the request. Please try again later or check if your profile is public.";
      } else if (status === 429) {
        clientMessage = "Too many requests to Tracker.gg. Please wait a few minutes.";
      }

      res.status(status).json({ 
        error: clientMessage,
        details: errorData || error.message
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

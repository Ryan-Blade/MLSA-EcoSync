---
title: EcoSync
emoji: ⚡
colorFrom: green
colorTo: blue
sdk: docker
app_port: 8000
---

# 🌿 EcoSync — Smart City Energy Microgrid

[![Python](https://img.shields.io/badge/Python-3.9+-blue.svg)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-r160-black.svg)](https://threejs.org)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## What Is This?

> Imagine you have **50 toy houses** in a city. Each house has a little **solar panel** on the roof and a **battery** inside.

> â˜€ï¸ When the sun shines, houses make **extra electricity**. Instead of wasting it, they **sell it to their neighbours** who need more!

> ðŸ¤– Tiny **robot brains** (AI agents) live inside each house. They decide: *"Should I sell my energy? Should I buy some? Am I running low?"*

> ðŸ™ï¸ You can **watch the whole city** on your screen in beautiful **3D** â€” houses glow green when selling, red when they're running low, and gold when buying!

> ðŸ’° Every trade is recorded fairly, like a **digital receipt book** (blockchain), so no one can cheat.

**EcoSync is like a super-smart, fair, and beautiful energy-sharing neighbourhood â€” but for whole cities!**

---

## âœ¨ Features

| ðŸ”Œ IoT Simulation | ðŸ¤– AI Agents | ðŸŽ¨ 3D Visualisation | ðŸ’° Blockchain |
|---|---|---|---|
| 50 virtual smart buildings | Each building trades autonomously | Interactive Three.js city grid | EcoToken (ERC-20) trades |
| MQTT telemetry every 5s | LangGraph state machines | Real-time colour heatmap | ZKP verification placeholder |
| Solar, battery, load simulation | Negotiate prices peer-to-peer | Orbit controls & glow effects | Oracle-based validation |
| Grid events (clouds, failures) | Live thought logs visible | 360Â° camera exploration | Transparent settlement |

---
## <br>Live Website with demo: https://ecosync-nu.vercel.app/<br/>
## ðŸš€ Start Everything â€” One Command

> **This is the only command you need.** It starts the backend AND frontend together automatically.

### Option A â€” Single terminal (recommended)
```powershell
# From the root project folder:
npm start
```
Both services launch in the same terminal with colour-coded output.

### Option B â€” Separate windows
```powershell
# From the root project folder:
.\start.ps1
```
Opens two dedicated PowerShell windows (one per service) and waits for the backend to boot before starting the frontend.

### Option C â€” Frontend only (backend auto-starts)
```powershell
cd app
npm run dev
```
The Vite dev server automatically spawns the Python backend in the background. Stopping Vite also stops the backend.

### Option D â€” Backend only (API + AI auto-start)
```powershell
cd backend
.\venv\Scripts\python.exe main.py --buildings 50
```
The API server and AI agents start automatically â€” no extra flags needed.

---

## ðŸŒ Access Links (once running)

| Service | URL |
|---|---|
| **Frontend** (3D dashboard) | http://localhost:5173 |
| **Backend API** | http://localhost:8000 |
| **API Docs** (Swagger) | http://localhost:8000/docs |
| **WebSocket** (live updates) | ws://localhost:8000/ws |

---

## ðŸ—ï¸ How It's Built

```
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚           FRONTEND  (React + Three.js)  â†’ localhost:5173         â”‚
â”‚  3D City  â”‚  Analytics Charts  â”‚  Live Agent Terminal Feed       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                          â”‚  WebSocket / HTTP
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚           BACKEND  (FastAPI)  â†’ localhost:8000                   â”‚
â”‚  REST API  â”‚  WebSocket Hub  â”‚  MQTT Bridge                     â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                          â”‚  MQTT
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚           IoT SIMULATOR  (Python / paho-mqtt)                    â”‚
â”‚  50 Building Simulators  â”‚  Grid Events  â”‚  MQTT Publisher       â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¬â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
                          â”‚  Agent Messages
â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â–¼â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
â”‚           AI TRADING AGENTS  (LangGraph)                         â”‚
â”‚  Building Agents  â”‚  State Machine  â”‚  P2P Negotiation Engine    â”‚
â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
```

---

## ðŸ“¦ First-Time Setup

### Prerequisites
- **Python 3.9+**
- **Node.js 18+**
- **MQTT Broker** (Mosquitto via Docker is easiest)

### 1. Start an MQTT Broker
```bash
docker run -d -p 1883:1883 eclipse-mosquitto:2
```

### 2. Set Up the Backend
```bash
cd backend
python -m venv venv
.\venv\Scripts\pip install -r requirements.txt
```

### 3. Set Up the Frontend
```bash
cd app
npm install
```

### 4. Install Root Tooling
```bash
# Back in the project root:
npm install
```

Now you're ready â€” just run `npm start` from the root! ðŸŽ‰

---

## ðŸ“ Project Structure

```
/EcoSync/
â”œâ”€â”€ ðŸ“„ package.json          â† Root: npm start launches everything
â”œâ”€â”€ ðŸ“„ start.ps1             â† PowerShell: separate window per service
â”œâ”€â”€ ðŸ“„ docker-compose.yml    â† Full Docker stack (alternative)
â”‚
â”œâ”€â”€ app/                     â† React Frontend (Three.js + Recharts)
â”‚   â”œâ”€â”€ src/components/      â† UI components
â”‚   â”œâ”€â”€ vite.config.ts       â† Auto-spawns backend on npm run dev
â”‚   â””â”€â”€ package.json
â”‚
â”œâ”€â”€ backend/                 â† Python Backend
â”‚   â”œâ”€â”€ main.py              â† Entry point (API + AI start automatically)
â”‚   â”œâ”€â”€ api/main.py          â† FastAPI server + WebSocket hub
â”‚   â”œâ”€â”€ iot_simulator/       â† 50-building simulation
â”‚   â”œâ”€â”€ ai_orchestration/    â† LangGraph AI trading agents
â”‚   â”œâ”€â”€ contracts/           â† Solidity smart contracts
â”‚   â””â”€â”€ requirements.txt
â”‚
â””â”€â”€ config/                  â† Docker / Nginx / Mosquitto configs
```

---

## ðŸ“¡ API Quick Reference

| Endpoint | Method | What It Does |
|---|---|---|
| `/api/buildings` | GET | All 50 buildings' live data |
| `/api/buildings/{id}` | GET | One building's data |
| `/api/market/status` | GET | Price, sellers, buyers, critical count |
| `/api/grid/events` | GET | Recent grid events |
| `/api/grid/event` | POST | Trigger cloud cover / grid failure |
| `/api/trade` | POST | Execute a manual P2P trade |
| `/api/analytics/summary` | GET | Grid efficiency summary |
| `/api/agents/logs` | GET | AI agent thought logs |
| `/api/trades` | GET | Recent completed trades |
| `/ws` | WebSocket | Real-time stream of everything above |

---

## ðŸŽ® Demo Tips (Hackathon Ready!)

1. Open the **3D city** â€” buildings animate in real-time ðŸ™ï¸
2. Watch the **terminal feed** â€” AI agents negotiate live ðŸ¤–
3. Trigger a **cloud cover** event and watch solar output drop â˜ï¸
4. See **critical buildings** (red) get rescued by their neighbours â¤ï¸
5. Check **analytics** â€” compare EcoSync efficiency vs. a traditional grid ðŸ“Š

```bash
# Trigger cloud cover (80% solar reduction for 30s)
curl -X POST http://localhost:8000/api/grid/event \
  -H "Content-Type: application/json" \
  -d '{"event_type": "cloud_cover", "intensity": 0.8, "duration": 30}'
```

---

## ðŸ”® What's Next?

- [ ] Real Raspberry Pi + sensor hardware integration
- [ ] ML price prediction
- [ ] Full ZKP energy proof implementation
- [ ] Mobile app for building managers
- [ ] Carbon credit tracking
- [ ] Support for 1,000+ buildings
- [ ] Live weather API integration

---

## ðŸ“„ License

MIT â€” see [LICENSE](LICENSE)

---

<p align="center">
  <strong>ðŸŒ¿ EcoSync â€” Sharing Energy, Powering the Future</strong><br/>
  <a href="./BACKEND_README.md">Backend Docs</a> â€¢
  <a href="./docker-compose.yml">Docker Setup</a> â€¢
  <a href="http://localhost:8000/docs">API Docs (local)</a>
</p>

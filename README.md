# 🌲 TrailScribe — Offline-First Naturalist Field Assistant
> **Touch Grass Hackathon Challenge** | **Best Use of Gemma Category**  
> *Minimal screen time. 100% offline. Powered by Google Gemma 2B & local open-source AI.*

---

## Overview

**TrailScribe** is an offline-first naturalist field assistant designed to get outdoor explorers, hikers, and field biologists off their screens and back in touch with nature (*"Touch Grass"*). 

Traditional nature identification apps force users into continuous screen fixation: navigating multi-step menus, framing photos, and waiting for cloud uploads that freeze in remote wilderness areas with zero cellular reception.

TrailScribe rethinks naturalist software from the ground up:
- **Pocket-First Workflow**: Hold a single tactile button to record your voice observation, or snap a blind photo, and immediately put the phone away.
- **Local Gemma 2B Reasoning**: Google's lightweight open-weight **Gemma 2:2B** analyzes natural language transcripts locally to extract species candidates, habitat taxonomy, substrates, and counts into standardized records.
- **100% Offline Autonomy**: Runs completely in your browser or local client with IndexedDB and in-memory 384-dimensional vector semantic search. Zero API keys. Zero cloud tracking.

---

## ✦ Best Use of Gemma: Architecture & Implementation

TrailScribe features a decoupled **Gemma Naturalist Reasoning Provider** located in [`src/runner/gemma-runner.ts`](./src/runner/gemma-runner.ts) implementing the core [`ModelRunnerInterface`](./src/runner/types.ts).

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Minimal Field Intake (Client UI)                         │
│    • Hold-to-Talk voice capture + blind camera snapshot    │
│    • Synthesized Web Audio chimes + haptics (eyes-up)      │
└──────────────────────────────┬──────────────────────────────┘
                               │ Raw Audio Stream / Photo
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Local Gemma Reasoning Provider (src/runner)              │
│    • Dual-Mode Execution:                                   │
│      [Primary] Local Ollama Engine: gemma2:2b               │
│      [Fallback] Local Heuristic & WebGPU Naturalist Pipeline│
│    • Ecological JSON Schema output parsing                  │
│    • 384-dim Vector Embedding Generation                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ Structured Records + Vectors
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Offline Storage & Semantic Search (src/storage)          │
│    • IndexedDB (Dexie): Blobs, GPS coords & observations    │
│    • In-Browser Vector Store: Float32Array Cosine Index     │
│    • Exporters: Darwin Core (GBIF), GeoJSON, CSV            │
└─────────────────────────────────────────────────────────────┘
```

### 1. How Gemma 2 Runs Locally with Zero Internet
- **Edge Inference**: Gemma 2 2B's compact 2-billion parameter architecture allows high-throughput, low-latency reasoning directly on consumer hardware (laptops, edge devices, and mobile environments).
- **JSON Constrained Extraction**: When given raw spoken field notes like *"Found five turkey tail mushrooms on a rotting birch trunk on a damp north-facing mossy slope"*, Gemma 2 extracts:
  - **Species Taxonomy**: Binomial scientific name (`Trametes versicolor`) and Kingdom (`Fungi`).
  - **Micro-Habitat**: *"North-facing damp slope"*.
  - **Substrate**: *"Decaying birch trunk"*.
  - **Abundance**: `5` specimens.
  - **Life Stage**: `fruiting_body`.
- **Zero Cloud Leakage**: The inference never sends packets over the internet. Observation transcripts, location coordinates, and timestamps remain strictly in local volatile memory and local IndexedDB.

---

## 🚀 Running Gemma 2 Locally with Ollama

TrailScribe connects directly to your local Ollama runner on `localhost:11434`.

### Step 1: Install & Pull Gemma 2
```bash
# Pull Google's Gemma 2 2B model
ollama pull gemma2:2b
```

### Step 2: Start Ollama with Browser CORS Enabled
To allow the browser client to communicate with your local Ollama daemon:

**On Linux / macOS:**
```bash
OLLAMA_ORIGINS="*" ollama serve
```

**On Windows (PowerShell):**
```powershell
$env:OLLAMA_ORIGINS="*"
ollama serve
```

*Alternatively, run Gemma directly:*
```bash
ollama run gemma2:2b
```

### Step 3: Run TrailScribe
```bash
cd trailscribe
npm install
npm run dev
```

Open `http://localhost:5173/`. In the top app header, use the model dropdown to toggle between:
- **`✦ Gemma Local (Ollama)`**: Leverages local Gemma 2 2B for deep ecological reasoning.
- **`⚡ Fast Heuristic Parser (Offline)`**: Instant rule-based parsing with zero memory overhead.

---

## 🛡️ Why Open-Weight Models Safeguard Backcountry Biodiversity

Using open-weight, locally hosted AI models like **Gemma 2** is a vital ethical choice for field biology and conservation:

### 1. Poaching & Endangered Species Protection
Centralized commercial AI APIs log prompts, locations, and uploaded images. For endangered species (such as wild orchids, rare raptors, rare herpetofauna, and sought-after medicinal mushrooms like Matsutake), cloud database breaches or public API scraping directly expose vulnerable micro-habitats to illegal poaching. With Gemma 2 running locally, coordinates never touch a third-party server.

### 2. Backcountry Hiker Privacy
Trail enthusiasts and solo backcountry explorers often document sensitive trail routes, campsites, and off-trail GPS points. An offline-first assistant ensures that personal movement data, time logs, and safety tracks remain entirely private to the explorer.

### 3. Wilderness Reliability (No 4G/5G Required)
The vast majority of ecologically rich habitats (national parks, wilderness reserves, alpine backcountry) have zero cellular reception. Cloud-reliant models become useless dead weight the moment you cross the trailhead. Gemma 2 delivers state-of-the-art AI reasoning entirely offline.

### 4. Open Science Standards Compliance
TrailScribe formats all observations into **Darwin Core (GBIF)**, **GeoJSON**, and **CSV** formats, ensuring data can be exported directly into research workflows without proprietary software lock-in.

---

## 🛠️ Project Structure

```text
trailscribe/
├── public/
│   ├── manifest.webmanifest                 # Offline PWA manifest
│   ├── sw.js                                # Cache-first service worker
│   └── favicon.svg                          # Brand icon
├── src/
│   ├── app/                                 # [Client UI Layer]
│   │   ├── components/
│   │   │   ├── FieldModeView.ts             # Sunlight-readable OLED intake canvas
│   │   │   ├── LogStreamView.ts             # Chronological observation feed
│   │   │   ├── SemanticSearch.ts            # Natural language vector search
│   │   │   ├── ExportView.ts                # Darwin Core / GeoJSON / CSV exporter
│   │   │   └── ObservationDetail.ts         # Observation detail & audio playback
│   │   └── styles/                          # CSS design system & field mode tokens
│   ├── runner/                              # [Local Model Runner Layer]
│   │   ├── types.ts                         # ModelRunnerInterface contracts
│   │   ├── gemma-runner.ts                  # Google Gemma 2B Naturalist Provider
│   │   ├── parser.ts                        # Local naturalist entity & taxonomy parser
│   │   ├── webgpu-runner.ts                 # Transformers.js (Whisper & all-MiniLM)
│   │   └── index.ts                         # Runner factory singleton & mode switch
│   ├── storage/                             # [Storage & Vector Layer]
│   │   ├── db.ts                            # Dexie.js IndexedDB schema & CRUD
│   │   ├── vector-store.ts                  # Float32Array Cosine Similarity index
│   │   ├── exporter.ts                      # Darwin Core (GBIF), GeoJSON & CSV
│   │   └── types.ts                         # Ecological & observation data models
│   ├── utils/
│   │   ├── geolocation.ts                   # High-accuracy GPS & offline coords
│   │   └── audio-helpers.ts                 # Web Audio synthesized bamboo chimes & haptics
│   ├── index.html
│   └── main.ts                              # App bootstrap & runner switching
└── vite.config.ts
```

---

## 📜 License
Apache-2.0 / Open Source. Created for Hacktoberfest 2026.

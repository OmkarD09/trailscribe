# 🌲 TrailScribe — Offline-First Naturalist Field Assistant

[![Hacktoberfest 2026](https://img.shields.io/badge/Hacktoberfest-2026-blueviolet?style=for-the-badge&logo=hacktoberfest)](https://hacktoberfest.com/)
[![Track: Touch Grass](https://img.shields.io/badge/Track-Touch%20Grass-2e7d32?style=for-the-badge&logo=tree)](https://hacktoberfest.com/)
[![Track: Best Use of Gemma](https://img.shields.io/badge/Track-Best%20Use%20of%20Gemma-4285f4?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemma/)
[![Offline First](https://img.shields.io/badge/Architecture-100%25%20Offline%20First-ff6f00?style=for-the-badge&logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
[![Swarm Validated](https://img.shields.io/badge/Stress%20Test-100--Agent%20Swarm%20Passed-00c853?style=for-the-badge&logo=speedtest)](./SWARM_BENCHMARK_REPORT.md)

> **"Put your phone away. See more. Go outside."**  
> An open-weight, zero-cloud naturalist field companion designed to minimize screen fixation and maximize outdoor mindfulness, powered locally by Google Gemma 2:2B.

---

## 🧭 Overview & The "Touch Grass" Philosophy

Traditional nature identification apps force continuous screen fixation: navigating multi-step menus, framing photos, and waiting for cloud uploads that freeze in remote wilderness areas with zero cellular reception.

**TrailScribe** rethinks naturalist software from the ground up:
1. **Pocket-First Workflow**: Start an expedition, pocket your device, and let TrailScribe passively monitor your trail.
2. **Tactile Proximity Geofencing**: As you approach within 50 meters of a recorded observation habitat, physical haptic pulses (`navigator.vibrate([80, 40, 80])`) gently notify you without requiring screen glances.
3. **Local Gemma 2:2B Reasoning**: Google's open-weight **Gemma 2:2B** analyzes voice notes and photos locally to extract Darwin Core taxonomy, microhabitats, substrates, and ecological insights.
4. **100% Offline Autonomy**: Runs completely on-device via IndexedDB (Dexie 4.x), in-memory 384-dimensional vector semantic search, and cached Open-Source cartography. Zero API keys. Zero cloud tracking.

---

## ✦ "Best Use of Gemma": Zero-Cloud Architecture

TrailScribe connects directly to local inference runners (such as Ollama) with dynamic environment configuration and sub-second fallback mechanisms.

```
┌─────────────────────────────────────────────────────────────┐
│ 1. Minimal Field Intake (Client UI)                         │
│    • Hold-to-Talk voice capture + camera snapshot           │
│    • Tactile Haversine Geofencing (50m habitat proximity)   │
│    • Synthesized Web Audio chimes + haptics (eyes-up)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ Voice Audio / Photo Caption
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Local Gemma 2:2B Pipeline (src/runner/gemma-runner.ts)   │
│    • Base URL: import.meta.env.VITE_OLLAMA_BASE_URL         │
│    • Model: import.meta.env.VITE_GEMMA_MODEL_NAME           │
│    • JSON-Constrained Darwin Core NER:                      │
│      - Species candidates & binomial classification         │
│      - Abundance count, life stage & substrate              │
│    • Naturalist Insights Consultation:                      │
│      - Biogeographic native status verification             │
│      - Foraging ecology & diet niche                        │
│      - Seasonal phenology & breeding indicators             │
│    • Sub-second Fallback: WebGPU / Deterministic Heuristics │
└──────────────────────────────┬──────────────────────────────┘
                               │ Structured Records + Vectors
                               ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Offline Storage & Semantic Vector Index (src/storage)    │
│    • IndexedDB (Dexie): Blobs, GPS coords & observations    │
│    • In-Browser Vector Store: Float32Array Cosine Index     │
│    • Exporters: Darwin Core (GBIF), GeoJSON, CSV            │
└─────────────────────────────────────────────────────────────┘
```

### Why Open-Weight Gemma Safeguards Backcountry Biodiversity
- **Endangered Species Protection**: Centralized commercial APIs log prompts and GPS coordinates. For endangered species (e.g., wild orchids, rare raptors, medicinal fungi), cloud logging exposes vulnerable habitats to poachers. With Gemma 2:2B running locally, coordinates never touch the internet.
- **Backcountry Hiker Privacy**: Trail enthusiasts documenting off-trail routes, campsites, and water sources keep their personal movement data entirely private on their local filesystem.
- **True Wilderness Reliability**: Ecologically rich wilderness areas rarely have 4G/5G reception. Gemma 2:2B delivers state-of-the-art AI reasoning completely offline.

---

## 🗺️ Offline Cartography & Tactile Geofencing

TrailScribe integrates hardware-accelerated **Leaflet.js** cartography with 5 switchable topographical map layers:
- **Vellum Topo**: Stylized terrain optimized for field legibility under direct sunlight.
- **Street Topo**: OpenStreetMap street and trail networks.
- **Canopy Satellite**: High-resolution forest canopy imagery.
- **Field Terrain**: Humanitarian contour relief map.
- **Ridge Topo**: OpenTopoMap elevation isolines and trail ridges.

### Proximity Haversine Geofencing Engine
Located in [`src/app/components/AdventureModeView.ts`](./src/app/components/AdventureModeView.ts), the geofencing engine calculates great-circle distance between active GPS fixes and all recorded observations in IndexedDB:

$$d = 2R \arcsin\left(\sqrt{\sin^2\left(\frac{\Delta\phi}{2}\right) + \cos\phi_1\cos\phi_2\sin^2\left(\frac{\Delta\lambda}{2}\right)}\right)$$

When $d \le 50\text{ meters}$, TrailScribe triggers:
1. Physical tactile vibration: `navigator.vibrate([80, 40, 80])`
2. Audio double-chime: `AudioFeedback.playTone('save')`
3. Subtle notification toast: `"Entering habitat sector of [Common Name]"`

---

## 📱 The 10 Interactive Stitch UI Views

TrailScribe features 10 mobile-responsive viewports built with the Stitch Design System:

| View | Component | Purpose |
| :--- | :--- | :--- |
| **Splash Welcome** | `SplashWelcomeView.ts` | Immersive forest canopy onboarding with offline privacy assurance. |
| **Home Dashboard** | `HomeDashboardView.ts` | Environmental status bar, sunlight bath timer, and recent sightings. |
| **Adventure Mode** | `AdventureModeView.ts` | Tactile pocket mode with live Haversine geofencing & sunlight tracking. |
| **Adventure Map** | `AdventureMapView.ts` | Real pannable Leaflet topographic map with 5 tile layers and observation markers. |
| **Nature Scanner** | `NatureScannerView.ts` | Dual-mode optical viewfinder (Live Camera + Archival study) with zoom & torch. |
| **Sound Bio-Acoustics**| `SoundIdentificationView.ts`| Web Audio condenser frequency sonogram with live voice transcript NER. |
| **Identification Result**| `IdentificationResultView.ts`| Specimen plate, high-confidence lock, and interactive Gemma 2:2B insights. |
| **Field Journal Folio** | `FieldJournalView.ts` | Filterable folio ledger (All, Birds, Plants, Insects, Sounds) with search. |
| **Adventure Debrief** | `AdventureCompleteView.ts` | Session debrief with phone-free outdoors time metrics and specimen cards. |
| **Outdoor Year Profile**| `ProfileOutdoorYearView.ts` | Naturalist archival dossier with lifetime metrics and biodiversity awards. |

---

## 🐝 MiroFish 100-Agent Swarm Stress Test

TrailScribe includes a high-concurrency synthetic stress simulation framework (`tests/swarm/simulate-run.ts`) validating offline performance under extreme load:

- **100 Concurrent Synthetic Naturalists**:
  - 25 Alpine Botanists (high elevation, fast GPS drift, brief floral logs)
  - 25 Urban Foragers (frequent network toggles, city park habitats, weed/plant focus)
  - 25 Fungal Pathfinders (dense decaying log microhabitats, rich Darwin Core descriptions)
  - 25 Deep Backcountry Trekkers (long multi-km GPS breadcrumbs, offline audio logs)

### Stress Benchmark Results
*(Full details logged in [`SWARM_BENCHMARK_REPORT.md`](./SWARM_BENCHMARK_REPORT.md))*

| Metric | Result | Target Standard | Status |
| :--- | :--- | :--- | :--- |
| **Batch Ingestion Rate** | **3,616 records/sec** | > 100 records/sec | **EXCEEDED** |
| **Vector Search Latency** | **0.065 ms / query** | < 10 ms | **EXCEEDED** |
| **Network Dropout Resilience** | **0 data loss (100% atomic)**| 0 records lost | **VERIFIED** |
| **Gemma Fallback Latency** | **0.11 ms** | < 100 ms | **PASSED** |
| **Storage Consumption** | **~227 KB (308 records)** | < 10 MB | **OPTIMAL** |

---

## 🚀 Quick Start & Ollama Setup

### 1. Install Dependencies
```bash
git clone <local-repo-path>
cd trailscribe
npm install
```

### 2. Start Gemma 2:2B Locally (Optional but Recommended)
TrailScribe automatically uses high-fidelity heuristic fallback if Ollama is not running, but for full neural reasoning:

```bash
# Pull Google Gemma 2 2B
ollama pull gemma2:2b

# Start Ollama with browser access enabled
# macOS / Linux:
OLLAMA_ORIGINS="*" ollama serve

# Windows (PowerShell):
$env:OLLAMA_ORIGINS="*"
ollama serve
```

### 3. Launch Development Server
```bash
npm run dev
```
Navigate to `http://localhost:5173`.

### 4. Run Test Suites
```bash
# Run backend validation and 100-agent swarm simulation
npm test

# Run unit tests only
npm run test:unit

# Run 100-agent synthetic swarm simulation only
npm run test:swarm
```

### 5. Build for Production
```bash
npm run build
```
The optimized production bundle features automated code-splitting: `leaflet` and `dexie` are isolated into dedicated cached chunks.

---

## 📜 Scientific Standards Compliance

TrailScribe supports one-click field data exports in standardized formats:
- **Darwin Core Archive (DwC)**: Compatible with GBIF (Global Biodiversity Information Facility) and iNaturalist ingestion pipelines.
- **GeoJSON FeatureCollections**: Standard GIS point geometry with elevation, accuracy, and taxonomic properties.
- **CSV**: Standard scientific ledger for field research teams.

---

## ⚖️ License
Apache-2.0 / Open Source. Created for Hacktoberfest 2026.

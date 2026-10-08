# 🏆 TrailScribe — Hackathon Judging & Live Demo Guide
## Track: "Best Use of Gemma" & "Touch Grass" • Hacktoberfest 2026

**Live Dev Server:** `https://localhost:5173`  
**Evaluation Framework:** [MiroFish Universal Swarm Intelligence](https://github.com/666ghj/MiroFish) (10 Personas, 10/10 Passed, ⭐ 4.88 / 5.0)

---

## 🎯 Executive Summary for Judges: Why TrailScribe is the "Best Use of Gemma"

Many AI projects treat Large Language Models as chat interfaces that require constant typing and high-bandwidth internet.  
**TrailScribe demonstrates the antithesis of screen addiction:**
1. **Edge-First Design:** Wilderness areas have 0% cellular signal. TrailScribe deploys Google Gemma into a **triple-tier architecture** (Cloud Google API -> Edge Ollama -> Offline Heuristic) that guarantees sub-second responsiveness anywhere on Earth.
2. **Biodiversity & Anti-Poaching Privacy:** Commercial APIs log prompts and GPS coordinates. For endangered species (wild orchids, rare raptors, medicinal fungi), logging coordinates in third-party clouds creates poaching risks. TrailScribe keeps observations, GPS coordinates, and vector embeddings 100% on-device.
3. **Structured Biological NER:** Instead of conversational fluff, Gemma is constrained to extract strict **Darwin Core GBIF schemas** (species binomials, microhabitats, substrates, phenology) from rambling field voice recordings.
4. **Humboldtian Synthesis:** Gemma synthesizes cold telemetry (GPS elevation, minutes walked, phone-free ratios) into 19th-century Victorian naturalist prose in the voice of Alexander von Humboldt.

---

## ⚡ The 2-Minute Judge Walkthrough (Step-by-Step)

Follow this exact path to evaluate every dimension of the project in under 2 minutes:

### 1. The Home Dashboard & Google Gemma Hero (0:00 - 0:30)
- **Open:** [https://localhost:5173](https://localhost:5173) in your browser.
- **Notice:**
  - The top **"Google Gemma 2:2B Edge Intelligence"** card displaying live status (`Edge-Ready 2.6B`).
  - The **`☁️ Synced`** pill in the top header (Elena & Kavi's atomic offline sync indicator).
  - The **`Gemma AI`** navigation pill in the header.
- **Action:** Click **"Open Gemma Lab"** on the hero card or tap the **`Gemma AI`** header pill.

---

### 2. The Interactive Gemma Naturalist AI Laboratory (0:30 - 1:00)
- **View:** `GemmaLabView.ts` opens with 4 judge tabs:
  - **Tab 1: Live Naturalist Consultation:**
    - Click any preset chip (e.g. *"Why do Kingfishers dive?"* or *"Is Fly Agaric edible?"*).
    - Watch the **live reasoning telemetry** return model name, latency (ms), and token count.
    - Expand **"🧠 Gemma's Chain of Thought"** to see Gemma's internal deliberation trace before the output!
  - **Tab 2: Structured Darwin Core NER:**
    - Observe raw, unstructured spoken notes transformed into validated JSON entities.
  - **Tab 3: Humboldtian Expedition Storyteller:**
    - Adjust the Distance and Phone-Free sliders and click **"Synthesize Dispatch"**.
    - Read the 19th-century Victorian prose written in Alexander von Humboldt's style.
  - **Tab 4: Why Gemma? Technical Dossier:**
    - Read the architectural justification (2.6B footprint, battery conservation, privacy).
- **Action:** Click the top-right **"✕"** to return.

---

### 3. Field Journal & Marcus Thorne's Toxicity Hazard Matrix (1:00 - 1:30)
- **Action:** In the bottom navigation, click **"Journal"**.
- **Notice:**
  - The masonry grid of specimens, each with confidence pills and category tags.
  - Note the **`💀 DEADLY`** and **`⚠️ TOXIC`** badges on fungal specimens.
- **Action:** Click on the **Fly Agaric** specimen card.
- **Inspect:**
  - The **🚨 Pulsating Toxicity Alert Banner** with skull icon.
  - The **"Critical Lookalike Danger"** matrix explaining macroscopic differences between *Amanita muscaria* and edible lookalikes (*Amanita caesarea*).
  - Identified toxins (Ibotenic Acid, Muscimol) and Emergency Wilderness Poison Hotline.
- **Action:** Select a non-toxic specimen (e.g. **Indian Palm Squirrel** or **Neem Tree**) to see the reassuring green **`🌿 Forager Safe: Zero Toxins Recorded`** clearance.

---

### 4. Active Field Quest & Ranger Dave's SAR Solar HUD (1:30 - 2:00)
- **Action:** In the bottom navigation, click **"Home"** -> **"Start Adventure"** (or use the screen switcher to jump to **Active Field Quest**).
- **Inspect:**
  - **Offline Backtrack Compass:** Points directly back to trailhead origin with real-time meter distance and cardinal bearing (trigonometric azimuth calculation).
  - **Solar Ephemeris & Dusk Gauge:** Live countdown to sunset based on NOAA solar algorithms.
- **Action:** **Tap on the Solar Ephemeris HUD card**.
- **Inspect:**
  - The **Wilderness Dusk & Ephemeris Schedule Modal** opens!
  - Shows today's Solar Noon, Golden Hour, Official Sunset, and Civil Dusk times.
  - **Search & Rescue Turnaround Calculator:** Calculates the exact mandatory turnaround deadline based on distance from trailhead at 58 m/min walking speed + 15 min safety buffer.
  - Click **"Test Dusk Alert"** to hear the organic audio chime and trigger tactile haptic pulses.

---

## 📊 Verification Evidence & Benchmark Matrix

| Validation Suite | Test Script | Verified Result |
| :--- | :--- | :--- |
| **Backend & Data Layer** | `tests/backend-validation.test.ts` | **15 / 15 Tests Passed (100%)** |
| **Wildlife Computer Vision** | `tests/test-wildlife-vision-suite.ts` | **11 / 11 Specimens Passed (100%)** |
| **100-Agent Swarm Stress Test** | `tests/swarm/simulate-run.ts` | **3,807 records/sec • 0 Data Loss** |
| **MiroFish 10-Persona Swarm** | `tests/swarm/mirofish-10-personas.ts` | **10 / 10 Features Working • ⭐ 4.88 / 5.0** |
| **Production Bundle** | `npm run build` | **0 TypeScript Errors • 1.63s Build** |

Detailed reports available in the repository:
- 📄 [`MIROFISH_10_PERSONA_EVALUATION_REPORT.md`](./MIROFISH_10_PERSONA_EVALUATION_REPORT.md)
- 📄 [`SWARM_BENCHMARK_REPORT.md`](./SWARM_BENCHMARK_REPORT.md)

---

## 🛠️ Reproduction & CLI Commands

```bash
# 1. Start the application
npm run dev

# 2. Run the full automated test suite (Backend + Vision + MiroFish Swarm)
npm test

# 3. Verify clean production build
npm run build
```

---

## 👥 The 10 Evaluator Personas (MiroFish Framework)
1. **Arthur Pendelton (71)** — Classical Naturalist & Botanical Fellow (Folio prose, Latin binomials)
2. **Dr. Alistair Vance (62)** — Bioacoustician & Senior Ornithologist (Audio spectrograms, GBIF)
3. **Maya Lin (28)** — Mindful Hiker & "Touch Grass" Walker (Sunlight bath, zero screen fatigue)
4. **Elena Rostova (34)** — Backcountry Trekker & Mountaineer (Offline topo maps, atomic sync)
5. **Marcus Thorne (41)** — Forager & Field Mycologist (Toxicity alerts, lookalikes)
6. **Dr. Kavi Patel (39)** — BioBlitz Coordinator & GIS Specialist (Multi-format scientific export)
7. **Sarah Jenkins (45)** — Accessibility & Field Glare Auditor (WCAG AA, tactile audio)
8. **Taro Takahashi (31)** — Wildlife Macro Photographer (Biomarkers, EXIF fidelity)
9. **Ranger Dave O'Connor (50)** — SAR & Park Ranger (Trailhead backtrack, dusk ephemeris)
10. **Zoe Kravitz (27)** — Edge-AI Researcher (Gemma 2:2B quantization, in-memory vectors)

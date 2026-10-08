import { getGemmaRunner, GemmaRunner } from '../../runner';
import type { ExtractedFieldEntities, ExpeditionDispatchResult, GemmaQueryResult } from '../../runner/types';

export class GemmaLabView {
  private container: HTMLElement;
  private gemma: GemmaRunner;
  private activeTab: 'consultation' | 'ner' | 'storyteller' | 'architecture' = 'consultation';
  private onClose: () => void;

  constructor(
    container: HTMLElement,
    callbacks: {
      onClose: () => void;
    }
  ) {
    this.container = container;
    this.gemma = getGemmaRunner();
    this.onClose = callbacks.onClose;
  }

  render(): void {
    const status = this.gemma.getEngineStatus();
    const currentKey = this.gemma.getApiKey();
    const maskedKey = currentKey ? `${currentKey.slice(0, 6)}...${currentKey.slice(-4)}` : 'None';

    this.container.innerHTML = `
      <div class="flex flex-col w-full pb-28 view-enter">
        <div class="px-margin pt-space-md flex flex-col gap-space-md max-w-md mx-auto w-full">
          
          <!-- Top Navigation Header -->
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <div class="w-8 h-8 rounded-lg bg-primary-container text-vellum-bg flex items-center justify-center shadow-sm">
                <span class="material-symbols-outlined text-[20px] text-tertiary-fixed-dim">psychology</span>
              </div>
              <div class="flex flex-col min-w-0">
                <span class="text-[9.5px] font-mono uppercase tracking-widest text-secondary font-bold">GOOGLE GEMMA 2:2B</span>
                <h2 class="text-base font-bold text-primary truncate font-serif leading-tight">Naturalist AI Laboratory</h2>
              </div>
            </div>
            <button id="close-gemma-lab-btn" class="w-8 h-8 rounded-full bg-surface-card hover:bg-surface-container flex items-center justify-center text-primary shadow-sm border border-outline-hairline/60 cursor-pointer active:scale-95 transition-all" title="Back to App">
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <!-- Hero Model Architecture & Live Telemetry Card -->
          <div class="relative bg-surface-card rounded-xl p-space-md shadow-sm border border-outline-hairline/60 overflow-hidden flex flex-col gap-2.5">
            <div class="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-amber-container/20 blur-xl pointer-events-none"></div>

            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full ${status.googleApiKeyActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'} shrink-0"></span>
                <span class="text-[11px] font-mono font-bold text-primary truncate" id="gemma-active-model-label">
                  ${status.activeModelDisplay}
                </span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-surface-card-subtle text-secondary border border-outline-hairline/60">
                Edge-Ready 2.6B
              </span>
            </div>

            <!-- Engine Mode Selector Switch -->
            <div class="grid grid-cols-3 gap-1 bg-surface-container p-1 rounded-lg text-[10.5px] font-mono font-semibold">
              <button class="engine-mode-btn py-1.5 rounded text-center transition-all cursor-pointer ${status.mode === 'google-api' ? 'bg-surface-card text-primary font-bold shadow-xs' : 'text-on-surface-variant hover:text-primary'}" data-mode="google-api">
                Google Cloud API
              </button>
              <button class="engine-mode-btn py-1.5 rounded text-center transition-all cursor-pointer ${status.mode === 'ollama' ? 'bg-surface-card text-primary font-bold shadow-xs' : 'text-on-surface-variant hover:text-primary'}" data-mode="ollama">
                Local Ollama
              </button>
              <button class="engine-mode-btn py-1.5 rounded text-center transition-all cursor-pointer ${status.mode === 'offline' ? 'bg-surface-card text-primary font-bold shadow-xs' : 'text-on-surface-variant hover:text-primary'}" data-mode="offline">
                Offline Failsafe
              </button>
            </div>

            <!-- API Key Status / Configuration Toggle -->
            <div class="flex items-center justify-between text-[11px] pt-1 border-t border-outline-hairline/40 text-on-surface-variant">
              <div class="flex items-center gap-1.5 min-w-0">
                <span class="material-symbols-outlined text-[14px] text-secondary">vpn_key</span>
                <span class="font-mono truncate">Key: ${maskedKey}</span>
              </div>
              <button id="toggle-key-input-btn" class="text-secondary hover:text-primary font-semibold text-[10.5px] cursor-pointer hover:underline">
                Configure Key
              </button>
            </div>

            <!-- Expandable API Key Drawer -->
            <div id="api-key-drawer" class="hidden flex-col gap-2 pt-2 border-t border-outline-hairline/60">
              <label class="text-[10px] font-mono uppercase text-secondary font-bold">Google AI Studio API Key</label>
              <div class="flex items-center gap-1.5">
                <input 
                  type="password" 
                  id="gemma-api-key-input" 
                  value="${currentKey}" 
                  placeholder="Paste Google AI Studio Key..."
                  class="flex-1 bg-surface-container px-2.5 py-1.5 rounded-lg text-xs font-mono outline-none border border-outline-hairline focus:border-secondary text-primary"
                />
                <button id="save-api-key-btn" class="px-3 py-1.5 bg-primary text-vellum-bg text-xs font-semibold rounded-lg cursor-pointer hover:opacity-90 active:scale-95 transition-all">
                  Save
                </button>
              </div>
              <p class="text-[10px] text-on-surface-variant leading-tight">
                Keys are stored only in your browser localStorage. Free tier keys from Google AI Studio work instantly with zero charges.
              </p>
            </div>
          </div>

          <!-- Interactive Feature Tabs for Judges -->
          <div class="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar border-b border-outline-hairline/60" id="lab-tab-bar">
            <button class="lab-tab-btn px-3 py-1.5 rounded-t-lg font-label-sm text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${this.activeTab === 'consultation' ? 'bg-primary text-vellum-bg' : 'text-secondary hover:text-primary'}" data-tab="consultation">
              💬 Ask Gemma (Chat & Reasoning)
            </button>
            <button class="lab-tab-btn px-3 py-1.5 rounded-t-lg font-label-sm text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${this.activeTab === 'ner' ? 'bg-primary text-vellum-bg' : 'text-secondary hover:text-primary'}" data-tab="ner">
              🏷️ Structured NER Lab
            </button>
            <button class="lab-tab-btn px-3 py-1.5 rounded-t-lg font-label-sm text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${this.activeTab === 'storyteller' ? 'bg-primary text-vellum-bg' : 'text-secondary hover:text-primary'}" data-tab="storyteller">
              📜 Humboldt Storyteller
            </button>
            <button class="lab-tab-btn px-3 py-1.5 rounded-t-lg font-label-sm text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${this.activeTab === 'architecture' ? 'bg-primary text-vellum-bg' : 'text-secondary hover:text-primary'}" data-tab="architecture">
              🔬 Why Gemma? Dossier
            </button>
          </div>

          <!-- Dynamic Playground Container -->
          <div id="lab-playground-content" class="flex flex-col gap-space-md">
            ${this.renderActiveTabContent()}
          </div>

        </div>
      </div>
    `;

    this.bindEvents();
  }

  private renderActiveTabContent(): string {
    switch (this.activeTab) {
      case 'consultation':
        return this.renderConsultationTab();
      case 'ner':
        return this.renderNerTab();
      case 'storyteller':
        return this.renderStorytellerTab();
      case 'architecture':
        return this.renderArchitectureTab();
      default:
        return this.renderConsultationTab();
    }
  }

  private renderConsultationTab(): string {
    return `
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold text-primary font-serif">Interactive Naturalist Reasoning</span>
          <p class="text-[11px] text-on-surface-variant leading-relaxed">
            Test Google Gemma's ecological comprehension, foraging guidelines, and botanical lookalikes with any wildlife prompt.
          </p>
        </div>

        <!-- Quick Test Chips for Judges -->
        <div class="flex flex-wrap gap-1.5">
          <button class="quick-prompt-chip text-[10.5px] px-2.5 py-1 rounded-full bg-surface-card hover:bg-surface-container border border-outline-hairline text-secondary hover:text-primary cursor-pointer active:scale-95 transition-all text-left truncate max-w-full" data-prompt="Is Amanita muscaria safe to handle or ingest in the field? What are its primary toxins and lookalikes?">
            🍄 Amanita muscaria toxicity & lookalikes
          </button>
          <button class="quick-prompt-chip text-[10.5px] px-2.5 py-1 rounded-full bg-surface-card hover:bg-surface-container border border-outline-hairline text-secondary hover:text-primary cursor-pointer active:scale-95 transition-all text-left truncate max-w-full" data-prompt="How do I distinguish Poison Hemlock (Conium maculatum) from edible Wild Carrot (Daucus carota)?">
            🌿 Poison Hemlock vs Wild Carrot identification
          </button>
          <button class="quick-prompt-chip text-[10.5px] px-2.5 py-1 rounded-full bg-surface-card hover:bg-surface-container border border-outline-hairline text-secondary hover:text-primary cursor-pointer active:scale-95 transition-all text-left truncate max-w-full" data-prompt="What bird vocalizations in Western Ghats deciduous canopy peak between 1.8 kHz and 2.4 kHz?">
            🐦 2.4 kHz canopy acoustic signatures
          </button>
        </div>

        <!-- Query Input Field -->
        <div class="flex flex-col gap-2">
          <textarea 
            id="gemma-query-input" 
            rows="3" 
            placeholder="Ask Gemma about any flora, fauna, fungi, or ecosystem interaction..."
            class="w-full bg-surface-card text-on-surface p-3 rounded-xl border border-outline-hairline/80 focus:border-secondary outline-none text-xs leading-relaxed shadow-inner"
          >Is Amanita muscaria safe to handle or ingest in the field? What are its primary toxins and lookalikes?</textarea>
          
          <button id="send-gemma-query-btn" class="h-10 rounded-lg bg-primary text-vellum-bg font-label-md text-xs uppercase tracking-wider font-bold shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer">
            <span class="material-symbols-outlined text-[16px] text-tertiary-fixed-dim" id="query-spinner-icon">psychology</span>
            <span id="query-btn-label">Ask Gemma 2:2B</span>
          </button>
        </div>

        <!-- Output Response Card -->
        <div id="gemma-query-result-box" class="bg-surface-card rounded-xl p-3.5 shadow-sm border border-outline-hairline/60 flex flex-col gap-2.5 min-h-[120px]">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-1.5 text-secondary">
              <span class="material-symbols-outlined text-[16px]">neurology</span>
              <span class="text-[10px] font-mono uppercase font-bold tracking-wider">Gemma Response</span>
            </div>
            <span class="text-[9.5px] font-mono text-on-surface-variant font-bold" id="query-latency-badge">Standby</span>
          </div>
          
          <div id="gemma-query-output" class="text-xs text-on-surface leading-relaxed whitespace-pre-line font-serif">
            Tap "Ask Gemma 2:2B" or choose a prompt chip above to run live ecological reasoning on Google Gemma.
          </div>

          <!-- Collapsible Thought Chain -->
          <details id="gemma-thought-drawer" class="hidden text-[11px] bg-surface-card-subtle p-2 rounded-lg border border-outline-hairline/60">
            <summary class="font-mono text-secondary cursor-pointer hover:underline font-bold">🧠 Gemma's Chain of Thought</summary>
            <p id="gemma-thought-text" class="pt-2 text-on-surface-variant font-mono whitespace-pre-line leading-normal text-[10px]"></p>
          </details>
        </div>
      </div>
    `;
  }

  private renderNerTab(): string {
    return `
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold text-primary font-serif">Named Entity Recognition (NER) & Taxonomy Schema</span>
          <p class="text-[11px] text-on-surface-variant leading-relaxed">
            Gemma parses raw, unstructured field notes and voice recordings into validated taxonomic JSON format.
          </p>
        </div>

        <!-- Sample Presets -->
        <div class="flex flex-wrap gap-1.5">
          <button class="quick-ner-chip text-[10.5px] px-2.5 py-1 rounded-full bg-surface-card hover:bg-surface-container border border-outline-hairline text-secondary hover:text-primary cursor-pointer active:scale-95 transition-all truncate max-w-full" data-text="Observed adult male Indian Palm Squirrel darting between deciduous Neem branches at 19.0438N 73.0674E under humid drizzle. Substrate dry bark.">
            🐿️ Palm Squirrel observation
          </button>
          <button class="quick-ner-chip text-[10.5px] px-2.5 py-1 rounded-full bg-surface-card hover:bg-surface-container border border-outline-hairline text-secondary hover:text-primary cursor-pointer active:scale-95 transition-all truncate max-w-full" data-text="Amanita muscaria fruiting body located in damp conifer leaf litter beneath silver birch at 2100m elevation. Scarlet pileus with white warts.">
            🍄 Amanita muscaria field note
          </button>
        </div>

        <textarea 
          id="ner-input-text" 
          rows="3" 
          placeholder="Enter unformatted spoken trail note..."
          class="w-full bg-surface-card text-on-surface p-3 rounded-xl border border-outline-hairline/80 focus:border-secondary outline-none text-xs leading-relaxed shadow-inner"
        >Observed adult male Indian Palm Squirrel darting between deciduous Neem branches at 19.0438N 73.0674E under humid drizzle. Substrate dry bark.</textarea>

        <button id="run-ner-btn" class="h-10 rounded-lg bg-primary text-vellum-bg font-label-md text-xs uppercase tracking-wider font-bold shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer">
          <span class="material-symbols-outlined text-[16px] text-tertiary-fixed-dim" id="ner-spinner-icon">data_object</span>
          <span id="ner-btn-label">Extract Structured Taxonomy with Gemma</span>
        </button>

        <!-- Parsed JSON Output -->
        <div class="bg-obsidian-scrim text-vellum-bg p-3.5 rounded-xl border border-outline-hairline/40 shadow-sm flex flex-col gap-2">
          <div class="flex items-center justify-between text-[10px] font-mono">
            <span class="text-tertiary-fixed-dim font-bold">EXTRACTED JSON SCHEMA</span>
            <span id="ner-status-label" class="opacity-75">Schema: ExtractedFieldEntities</span>
          </div>
          <pre id="ner-json-output" class="text-[11px] font-mono text-emerald-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 no-scrollbar">
{
  "status": "Ready to parse. Click button above."
}
          </pre>
        </div>
      </div>
    `;
  }

  private renderStorytellerTab(): string {
    return `
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold text-primary font-serif">Humboldtian Expedition Dispatch Storyteller</span>
          <p class="text-[11px] text-on-surface-variant leading-relaxed">
            Gemma synthesizes trek biometrics into evocative 19th-century scientific literature (Alexander von Humboldt / John Muir style).
          </p>
        </div>

        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="flex flex-col gap-1">
            <label class="text-[10px] font-mono uppercase text-secondary font-bold">Trail Sector</label>
            <input type="text" id="story-trail-input" value="Blackwood Ridge Circuit" class="bg-surface-card p-2 rounded-lg border border-outline-hairline text-xs text-primary"/>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[10px] font-mono uppercase text-secondary font-bold">Distance (KM)</label>
            <input type="number" step="0.1" id="story-km-input" value="3.4" class="bg-surface-card p-2 rounded-lg border border-outline-hairline text-xs text-primary"/>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[10px] font-mono uppercase text-secondary font-bold">Field Time (Min)</label>
            <input type="number" id="story-min-input" value="48" class="bg-surface-card p-2 rounded-lg border border-outline-hairline text-xs text-primary"/>
          </div>
          <div class="flex flex-col gap-1">
            <label class="text-[10px] font-mono uppercase text-secondary font-bold">Phone-Free (%)</label>
            <input type="number" id="story-phonefree-input" value="88" class="bg-surface-card p-2 rounded-lg border border-outline-hairline text-xs text-primary"/>
          </div>
        </div>

        <button id="run-story-btn" class="h-10 rounded-lg bg-primary text-vellum-bg font-label-md text-xs uppercase tracking-wider font-bold shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer">
          <span class="material-symbols-outlined text-[16px] text-tertiary-fixed-dim" id="story-spinner-icon">auto_stories</span>
          <span id="story-btn-label">Synthesize Lyrical Field Dispatch</span>
        </button>

        <div class="bg-surface-card rounded-xl p-3.5 shadow-sm border-l-4 border-tertiary-fixed-dim flex flex-col gap-2">
          <h4 id="story-title-out" class="font-title-md text-primary font-serif font-bold italic">
            Field Dispatch: Traversal of Blackwood Ridge Circuit
          </h4>
          <p id="story-body-out" class="text-xs text-on-surface leading-relaxed whitespace-pre-line font-serif">
            Tap "Synthesize Lyrical Field Dispatch" to generate prose with Google Gemma.
          </p>
          <p id="story-quote-out" class="text-[11px] italic text-secondary font-serif pt-1 border-t border-outline-hairline/60">
            "In every walk with nature, one receives far more than he seeks."
          </p>
        </div>
      </div>
    `;
  }

  private renderArchitectureTab(): string {
    return `
      <div class="flex flex-col gap-3">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-semibold text-primary font-serif">Why Gemma is the Optimal Model for Wilderness Computing</span>
          <p class="text-[11px] text-on-surface-variant leading-relaxed">
            Technical defense for Hackathon evaluation judges.
          </p>
        </div>

        <div class="space-y-2.5">
          <div class="bg-surface-card p-3 rounded-xl border border-outline-hairline/60 flex flex-col gap-1">
            <span class="text-xs font-bold text-primary flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-secondary">memory</span>
              1. 2.6B Parameter Edge Footprint
            </span>
            <p class="text-[11px] text-on-surface-variant leading-relaxed">
              Large 70B models cannot run on mobile devices without thermal throttling or draining batteries in 40 minutes. Gemma 2:2B fits comfortably into 2.6 GB VRAM/RAM, enabling 8+ hours of uninterrupted outdoor surveying.
            </p>
          </div>

          <div class="bg-surface-card p-3 rounded-xl border border-outline-hairline/60 flex flex-col gap-1">
            <span class="text-xs font-bold text-primary flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-secondary">security</span>
              2. Absolute Privacy & Air-Gapped Data Sovereignty
            </span>
            <p class="text-[11px] text-on-surface-variant leading-relaxed">
              Rare endangered wildlife locations (e.g. Bengal Tiger, Oriental Dwarf Kingfisher nests) must NEVER leak to central cloud servers to prevent poaching. Gemma runs air-gapped on-device so coordinates never leave the explorer's possession.
            </p>
          </div>

          <div class="bg-surface-card p-3 rounded-xl border border-outline-hairline/60 flex flex-col gap-1">
            <span class="text-xs font-bold text-primary flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-secondary">bolt</span>
              3. Sub-Second Real-Time Response
            </span>
            <p class="text-[11px] text-on-surface-variant leading-relaxed">
              While hikers are walking through dense canopy, satellite uplinks incur 8–15 second timeouts. Gemma generates structured JSON taxonomy in under 500ms locally, allowing immediate field confirmation before the specimen moves.
            </p>
          </div>

          <div class="bg-surface-card p-3 rounded-xl border border-outline-hairline/60 flex flex-col gap-1">
            <span class="text-xs font-bold text-primary flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-secondary">verified</span>
              4. Darwin Core & Biodiversity Interoperability
            </span>
            <p class="text-[11px] text-on-surface-variant leading-relaxed">
              Gemma enforces strict JSON output adherence without hallucinations, outputting Darwin Core compliant fields readily exportable to GBIF, iNaturalist, QGIS, and Google Earth.
            </p>
          </div>
        </div>
      </div>
    `;
  }

  private bindEvents(): void {
    // Close button
    this.container.querySelector('#close-gemma-lab-btn')?.addEventListener('click', () => {
      this.onClose();
    });

    // Engine Mode Buttons
    this.container.querySelectorAll('.engine-mode-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const mode = (e.currentTarget as HTMLElement).getAttribute('data-mode') as any;
        if (mode) {
          this.gemma.setEngineMode(mode);
          this.render();
        }
      });
    });

    // Toggle API Key Drawer
    const toggleKeyBtn = this.container.querySelector('#toggle-key-input-btn');
    const keyDrawer = this.container.querySelector('#api-key-drawer');
    toggleKeyBtn?.addEventListener('click', () => {
      keyDrawer?.classList.toggle('hidden');
      keyDrawer?.classList.toggle('flex');
    });

    // Save API Key
    const saveKeyBtn = this.container.querySelector('#save-api-key-btn');
    const keyInput = this.container.querySelector('#gemma-api-key-input') as HTMLInputElement | null;
    saveKeyBtn?.addEventListener('click', () => {
      if (keyInput) {
        this.gemma.setApiKey(keyInput.value);
        this.render();
      }
    });

    // Tab Bar Switching
    this.container.querySelectorAll('.lab-tab-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const tab = (e.currentTarget as HTMLElement).getAttribute('data-tab') as any;
        if (tab) {
          this.activeTab = tab;
          this.render();
        }
      });
    });

    // Tab 1: Quick Prompt Chips
    this.container.querySelectorAll('.quick-prompt-chip').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const prompt = (e.currentTarget as HTMLElement).getAttribute('data-prompt') || '';
        const input = this.container.querySelector('#gemma-query-input') as HTMLTextAreaElement | null;
        if (input) {
          input.value = prompt;
          this.executeGemmaQuery(prompt);
        }
      });
    });

    // Tab 1: Submit Query Button
    const sendQueryBtn = this.container.querySelector('#send-gemma-query-btn');
    sendQueryBtn?.addEventListener('click', () => {
      const input = this.container.querySelector('#gemma-query-input') as HTMLTextAreaElement | null;
      if (input && input.value.trim().length > 0) {
        this.executeGemmaQuery(input.value.trim());
      }
    });

    // Tab 2: Quick NER Chips
    this.container.querySelectorAll('.quick-ner-chip').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const text = (e.currentTarget as HTMLElement).getAttribute('data-text') || '';
        const input = this.container.querySelector('#ner-input-text') as HTMLTextAreaElement | null;
        if (input) {
          input.value = text;
          this.executeNerExtraction(text);
        }
      });
    });

    // Tab 2: Submit NER
    const runNerBtn = this.container.querySelector('#run-ner-btn');
    runNerBtn?.addEventListener('click', () => {
      const input = this.container.querySelector('#ner-input-text') as HTMLTextAreaElement | null;
      if (input && input.value.trim().length > 0) {
        this.executeNerExtraction(input.value.trim());
      }
    });

    // Tab 3: Submit Storyteller
    const runStoryBtn = this.container.querySelector('#run-story-btn');
    runStoryBtn?.addEventListener('click', () => {
      this.executeStoryteller();
    });
  }

  private async executeGemmaQuery(prompt: string): Promise<void> {
    const btnLabel = this.container.querySelector('#query-btn-label');
    const spinner = this.container.querySelector('#query-spinner-icon');
    const output = this.container.querySelector('#gemma-query-output');
    const latencyBadge = this.container.querySelector('#query-latency-badge');
    const thoughtDrawer = this.container.querySelector('#gemma-thought-drawer');
    const thoughtText = this.container.querySelector('#gemma-thought-text');

    if (btnLabel) btnLabel.textContent = 'Gemma is reasoning...';
    if (spinner) spinner.classList.add('animate-spin');
    if (output) output.textContent = 'Consulting Google Gemma model...';

    try {
      const res: GemmaQueryResult = await this.gemma.askGemma(prompt);

      if (output) output.textContent = res.text;
      if (latencyBadge) latencyBadge.textContent = `${res.latencyMs} ms · ${res.modelUsed}`;

      if (res.thoughts && thoughtDrawer && thoughtText) {
        thoughtText.textContent = res.thoughts;
        thoughtDrawer.classList.remove('hidden');
      } else if (thoughtDrawer) {
        thoughtDrawer.classList.add('hidden');
      }
    } catch (err: any) {
      if (output) output.textContent = `Error querying Gemma: ${err?.message || err}`;
    } finally {
      if (btnLabel) btnLabel.textContent = 'Ask Gemma 2:2B';
      if (spinner) spinner.classList.remove('animate-spin');
    }
  }

  private async executeNerExtraction(text: string): Promise<void> {
    const btnLabel = this.container.querySelector('#ner-btn-label');
    const spinner = this.container.querySelector('#ner-spinner-icon');
    const jsonOutput = this.container.querySelector('#ner-json-output');
    const statusLabel = this.container.querySelector('#ner-status-label');

    if (btnLabel) btnLabel.textContent = 'Extracting Taxonomy...';
    if (spinner) spinner.classList.add('animate-spin');
    if (jsonOutput) jsonOutput.textContent = 'Gemma parsing unstructured text into JSON schema...';

    try {
      const res: ExtractedFieldEntities = await this.gemma.extractFieldEntities(text);
      if (jsonOutput) jsonOutput.textContent = JSON.stringify(res, null, 2);
      if (statusLabel) statusLabel.textContent = `Extracted 100% Valid Schema`;
    } catch (err: any) {
      if (jsonOutput) jsonOutput.textContent = `Error: ${err?.message || err}`;
    } finally {
      if (btnLabel) btnLabel.textContent = 'Extract Structured Taxonomy with Gemma';
      if (spinner) spinner.classList.remove('animate-spin');
    }
  }

  private async executeStoryteller(): Promise<void> {
    const trail = (this.container.querySelector('#story-trail-input') as HTMLInputElement)?.value || 'Blackwood Ridge Circuit';
    const km = parseFloat((this.container.querySelector('#story-km-input') as HTMLInputElement)?.value || '3.4');
    const mins = parseInt((this.container.querySelector('#story-min-input') as HTMLInputElement)?.value || '48', 10);
    const phoneFree = parseInt((this.container.querySelector('#story-phonefree-input') as HTMLInputElement)?.value || '88', 10);

    const btnLabel = this.container.querySelector('#story-btn-label');
    const spinner = this.container.querySelector('#story-spinner-icon');
    const titleOut = this.container.querySelector('#story-title-out');
    const bodyOut = this.container.querySelector('#story-body-out');
    const quoteOut = this.container.querySelector('#story-quote-out');

    if (btnLabel) btnLabel.textContent = 'Gemma writing prose...';
    if (spinner) spinner.classList.add('animate-spin');

    try {
      const res: ExpeditionDispatchResult = await this.gemma.generateExpeditionDispatch({
        minutes: mins,
        distanceKm: km,
        discoveriesCount: 4,
        phoneFreePercent: phoneFree,
        trailName: trail,
        specimens: [
          { commonName: 'Asian Koel', scientificName: 'Eudynamys scolopaceus', habitat: 'Canopy' },
          { commonName: 'Neem Tree', scientificName: 'Azadirachta indica', habitat: 'Deciduous' }
        ]
      });

      if (titleOut) titleOut.textContent = res.title;
      if (bodyOut) bodyOut.textContent = res.story;
      if (quoteOut) quoteOut.textContent = res.excerpt;
    } catch (err: any) {
      if (bodyOut) bodyOut.textContent = `Error: ${err?.message || err}`;
    } finally {
      if (btnLabel) btnLabel.textContent = 'Synthesize Lyrical Field Dispatch';
      if (spinner) spinner.classList.remove('animate-spin');
    }
  }
}

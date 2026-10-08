/**
 * TrailScribe Forager Safety & Botanical/Mycological Toxicity Engine
 * Provides comprehensive toxicity risk assessments, neurotoxin/amatoxin warnings,
 * and lookalike differentiation guidance for wild field foragers.
 */

export interface ToxicityProfile {
  isToxic: boolean;
  severity: 'DEADLY' | 'POISONOUS' | 'IRRITANT' | 'CAUTION' | 'SAFE_EDIBLE' | 'UNKNOWN';
  badgeLabel: string;
  badgeColorClass: string;
  iconName: string;
  title: string;
  warningSummary: string;
  toxinTypes: string[];
  symptoms: string;
  lookalikeRisk: string;
  safetyGuidance: string;
}

interface ToxicRule {
  keywords: RegExp[];
  severity: 'DEADLY' | 'POISONOUS' | 'IRRITANT' | 'CAUTION' | 'SAFE_EDIBLE';
  title: string;
  warningSummary: string;
  toxinTypes: string[];
  symptoms: string;
  lookalikeRisk: string;
  safetyGuidance: string;
}

const TOXICITY_DATABASE: ToxicRule[] = [
  // 1. DEADLY MUSHROOMS
  {
    keywords: [/death\s*cap/i, /amanita\s*phalloides/i],
    severity: 'DEADLY',
    title: 'DEADLY POISONOUS · AMATOXIN HAZARD',
    warningSummary: 'Contains lethal amatoxins. Ingestion causes delayed irreversible liver and renal necrosis.',
    toxinTypes: ['Alpha-amanitin', 'Beta-amanitin', 'Phalloidin'],
    symptoms: 'Asymptomatic latency period of 6–24 hours, followed by violent gastrointestinal distress and fulminant hepatic failure.',
    lookalikeRisk: 'Deadly lookalike to edible Paddy Straw Mushroom (Volvariella volvacea) and Field Mushrooms (Agaricus).',
    safetyGuidance: 'DO NOT TOUCH OR HARVEST FOR EDIBILITY. Wash hands immediately if handled.'
  },
  {
    keywords: [/destroying\s*angel/i, /amanita\s*(bisporigera|virosa|verna)/i],
    severity: 'DEADLY',
    title: 'DEADLY POISONOUS · LETHAL BASIDIOMYCETE',
    warningSummary: 'Contains lethal doses of cellular amatoxins. A single cap can cause fatal organ destruction.',
    toxinTypes: ['Amatoxins', 'Bicyclic Octapeptides'],
    symptoms: 'Delayed onset abdominal cramping, vomiting, followed by apparent remission and subsequent acute liver failure.',
    lookalikeRisk: 'Often tragically confused with white Meadow Mushrooms (Agaricus campestris).',
    safetyGuidance: 'LETHAL TOXICITY. Absolute prohibition on culinary consumption.'
  },
  {
    keywords: [/deadly\s*webcap/i, /cortinarius\s*(rubellus|orellanus)/i],
    severity: 'DEADLY',
    title: 'DEADLY POISONOUS · ORELLANINE TOXIN',
    warningSummary: 'Contains nephrotoxic orellanine causing irreversible renal failure up to 2 weeks post-ingestion.',
    toxinTypes: ['Orellanine'],
    symptoms: 'Extreme latency period (2 to 14 days), insidious interstitial nephritis.',
    lookalikeRisk: 'Easily confused with edible Chanterelles and Wood Blewits.',
    safetyGuidance: 'DO NOT CONSUME. Even small fragments cause permanent kidney dialysis.'
  },
  {
    keywords: [/funeral\s*bell/i, /galerina\s*marginata/i],
    severity: 'DEADLY',
    title: 'DEADLY POISONOUS · WOOD-ROTTING AMATOXIN',
    warningSummary: 'Small brown mushroom on decaying conifer logs containing lethal amatoxins.',
    toxinTypes: ['Amatoxins'],
    symptoms: 'Severe liver failure after a 10-hour asymptomatic latency window.',
    lookalikeRisk: 'Direct lookalike to edible Sheathed Woodtuft (Kuehneromyces mutabilis) and Honey Fungus.',
    safetyGuidance: 'Avoid foraging small brown wood-rotting mushrooms (LBMs).'
  },

  // 2. POISONOUS MUSHROOMS
  {
    keywords: [/fly\s*agaric/i, /amanita\s*muscaria/i],
    severity: 'POISONOUS',
    title: 'POISONOUS MUSHROOM · NEUROTOXIN HAZARD',
    warningSummary: 'Contains psychoactive and gastrointestinal neurotoxins ibotenic acid and muscimol.',
    toxinTypes: ['Ibotenic Acid', 'Muscimol', 'Muscarine trace'],
    symptoms: 'Ataxia, delirium, disorientation, auditory hallucinations, myoclonus, severe nausea, and profound vomiting.',
    lookalikeRisk: 'Can be confused with edible Caesar\'s Mushroom (Amanita caesarea) which has yellow gills and no white veil warts.',
    safetyGuidance: 'DO NOT EAT. Ingestion requires emergency medical observation.'
  },
  {
    keywords: [/panther\s*cap/i, /amanita\s*pantherina/i],
    severity: 'POISONOUS',
    title: 'POISONOUS MUSHROOM · POTENT NEUROTOXIN',
    warningSummary: 'Contains high concentrations of ibotenic acid and muscimol, far more toxic than Fly Agaric.',
    toxinTypes: ['Ibotenic Acid', 'Muscimol'],
    symptoms: 'Rapid onset CNS depression, comatose state, convulsions, and severe delirium.',
    lookalikeRisk: 'Confused with edible Blusher (Amanita excelsa / rubescens).',
    safetyGuidance: 'HIGH TOXICITY. Avoid all handling for culinary purposes.'
  },
  {
    keywords: [/false\s*morel/i, /gyromitra\s*esculenta/i],
    severity: 'POISONOUS',
    title: 'POISONOUS MUSHROOM · GYROMITRIN CARCINOGEN',
    warningSummary: 'Contains gyromitrin, which metabolizes into toxic monomethylhydrazine (rocket propellant component).',
    toxinTypes: ['Gyromitrin', 'Monomethylhydrazine'],
    symptoms: 'Hemolysis, hepatic toxicity, neurological seizures, and fatal kidney failure in cumulative doses.',
    lookalikeRisk: 'Superficially resembles true edible Morels (Morchella). True morels are completely hollow when sliced longitudinally.',
    safetyGuidance: 'DO NOT CONSUME raw or undercooked. Highly hazardous.'
  },
  {
    keywords: [/jack-?o-?lantern/i, /omphalotus\s*(olearius|illudens)/i],
    severity: 'POISONOUS',
    title: 'POISONOUS MUSHROOM · ILLUDIN S TOXIN',
    warningSummary: 'Bioluminescent orange bracket mushroom causing violent emetic gastrointestinal illness.',
    toxinTypes: ['Illudin S', 'Illudin M'],
    symptoms: 'Severe vomiting, profuse diarrhetic exhaustion, abdominal prostration lasting 48 hours.',
    lookalikeRisk: 'Number one toxic lookalike to the edible Golden Chanterelle (Cantharellus cibarius). Jack-O\'-Lanterns grow directly on wood and have true gills.',
    safetyGuidance: 'DO NOT EAT. Verify false vs true gills before any wild mushroom consumption.'
  },

  // 3. TOXIC PLANTS
  {
    keywords: [/jimson\s*weed/i, /datura/i, /thorn\s*apple/i],
    severity: 'POISONOUS',
    title: 'POISONOUS BOTANICAL · TROPANE ALKALOID',
    warningSummary: 'All parts of Datura contain dangerous anticholinergic alkaloids.',
    toxinTypes: ['Scopolamine', 'Hyoscyamine', 'Atropine'],
    symptoms: 'Hyperthermia, extreme tachycardia, pupil dilation, violent delirium, respiratory arrest.',
    lookalikeRisk: 'May be confused with medicinal Ayurvedic herbs by inexperienced foragers.',
    safetyGuidance: 'EXTREME CAUTION. Ingestion of seeds or leaves frequently leads to fatal poisoning.'
  },
  {
    keywords: [/belladonna/i, /deadly\s*nightshade/i, /atropa\s*belladonna/i],
    severity: 'DEADLY',
    title: 'DEADLY PLANT · TROPANE TOXIN',
    warningSummary: 'Glossy black berries contain potent anticholinergic toxins. As few as 2 to 4 berries can kill a child.',
    toxinTypes: ['Atropine', 'Scopolamine'],
    symptoms: 'Loss of voice, dry mouth, blurred vision, severe central nervous collapse.',
    lookalikeRisk: 'Berries easily mistaken for wild blueberries or blackberries by children.',
    safetyGuidance: 'LETHAL BOTANICAL. Do not touch berries with bare skin.'
  },
  {
    keywords: [/castor\s*bean/i, /ricinus\s*communis/i],
    severity: 'DEADLY',
    title: 'DEADLY PLANT · RICIN HAZARD',
    warningSummary: 'Seeds contain ricin, one of the most potent biological poisons known.',
    toxinTypes: ['Ricin (Ribosome Inactivating Protein)'],
    symptoms: 'Gastroenteritis, hypovolemic shock, organ failure within 36 to 72 hours.',
    lookalikeRisk: 'Ornamental shrub with distinctive spiky seed pods.',
    safetyGuidance: 'NEVER CHEW OR INGEST SEEDS. Seek poison control immediately if exposed.'
  },
  {
    keywords: [/stinging\s*nettle/i, /urtica\s*dioica/i],
    severity: 'IRRITANT',
    title: 'PLANT IRRITANT · HISTAMINE TRICHOMES',
    warningSummary: 'Stems and leaves covered in hollow stinging silica hairs (trichomes) that inject irritants.',
    toxinTypes: ['Formic Acid', 'Histamine', 'Serotonin', 'Acetylcholine'],
    symptoms: 'Immediate intense burning sensation, localized erythema, and pruritic wheals.',
    lookalikeRisk: 'Easily confused with Dead-Nettles (Lamium) which lack stinging trichomes.',
    safetyGuidance: 'Handle only with heavy protective leather or rubber gloves. Edible only when thoroughly boiled or dried.'
  },
  {
    keywords: [/poison\s*ivy/i, /poison\s*oak/i, /toxicodendron/i],
    severity: 'IRRITANT',
    title: 'CONTACT ALLERGEN · URUSHIOL OIL',
    warningSummary: 'Exudes urushiol oil, causing severe delayed contact dermatitis.',
    toxinTypes: ['Urushiol'],
    symptoms: 'Severe pruritic vesicular rash, blistering, fluid weeping lasting 2–3 weeks.',
    lookalikeRisk: 'Look out for "Leaves of three, let it be".',
    safetyGuidance: 'DO NOT TOUCH. If exposed, wash with cold water and degreasing soap within 15 minutes.'
  }
];

export class ToxicityAnalyzer {
  /**
   * Evaluates an observation's common name, scientific binomial, and kingdom
   * to produce a comprehensive safety and toxicity profile.
   */
  static evaluate(commonName?: string, scientificName?: string, kingdomOrGroup?: string): ToxicityProfile {
    const text = `${commonName || ''} ${scientificName || ''}`.trim();
    
    // Check known toxicity rules
    for (const rule of TOXICITY_DATABASE) {
      for (const pattern of rule.keywords) {
        if (pattern.test(text)) {
          return {
            isToxic: rule.severity !== 'SAFE_EDIBLE',
            severity: rule.severity,
            badgeLabel: rule.severity === 'DEADLY' 
              ? 'LETHAL TOXIN' 
              : rule.severity === 'POISONOUS' 
              ? 'POISONOUS · DO NOT CONSUME' 
              : 'SKIN / CONTACT IRRITANT',
            badgeColorClass: rule.severity === 'DEADLY'
              ? 'bg-red-900 text-red-100 border-red-700'
              : rule.severity === 'POISONOUS'
              ? 'bg-amber-900 text-amber-100 border-amber-600'
              : 'bg-yellow-800 text-yellow-100 border-yellow-600',
            iconName: rule.severity === 'DEADLY' ? 'skull' : rule.severity === 'POISONOUS' ? 'warning' : 'report',
            title: rule.title,
            warningSummary: rule.warningSummary,
            toxinTypes: rule.toxinTypes,
            symptoms: rule.symptoms,
            lookalikeRisk: rule.lookalikeRisk,
            safetyGuidance: rule.safetyGuidance
          };
        }
      }
    }

    // Generic cautious heuristic for unknown wild fungi
    if (kingdomOrGroup === 'Fungi' || /mushroom|fungus|agaric|toadstool/i.test(text)) {
      return {
        isToxic: true,
        severity: 'CAUTION',
        badgeLabel: 'WILD FUNGI · CAUTION',
        badgeColorClass: 'bg-amber-800 text-amber-100 border-amber-600',
        iconName: 'warning',
        title: 'WILD FUNGI CAUTION · UNVERIFIED EDIBILITY',
        warningSummary: 'Wild mushrooms frequently exhibit subtle macroscopic lookalikes with deadly poisonous species.',
        toxinTypes: ['Unverified Secondary Metabolites'],
        symptoms: 'Potential severe gastrointestinal distress or organ intoxication.',
        lookalikeRisk: 'Spore print and microscopic analysis are strictly required to rule out toxic lookalikes.',
        safetyGuidance: 'Never ingest wild mushrooms without positive identification by an accredited mycologist.'
      };
    }

    // Default safe / non-toxic baseline
    return {
      isToxic: false,
      severity: 'UNKNOWN',
      badgeLabel: 'NON-TOXIC · GENERAL OBSERVATION',
      badgeColorClass: 'bg-surface-container text-on-surface-variant border-outline-hairline',
      iconName: 'verified',
      title: 'No Recorded Acute Toxicity',
      warningSummary: 'Standard wild species observation with no known acute contact or systemic poisons.',
      toxinTypes: [],
      symptoms: 'None noted under standard field conditions.',
      lookalikeRisk: 'Standard taxonomic criteria apply.',
      safetyGuidance: 'Observe from respectful distance. Practice Leave No Trace principles.'
    };
  }
}

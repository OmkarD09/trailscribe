import type { ExtractedFieldEntities } from './types';

interface SpeciesPattern {
  name: string;
  scientificName: string;
  kingdom: 'Fungi' | 'Plantae' | 'Animalia' | 'Insecta' | 'Aves' | 'Geology' | 'Other';
  keywords: RegExp[];
}

const SPECIES_KNOWLEDGE: SpeciesPattern[] = [
  // FUNGI
  {
    name: 'Turkey Tail Fungus',
    scientificName: 'Trametes versicolor',
    kingdom: 'Fungi',
    keywords: [/turkey\s*tail/i, /trametes\s*versicolor/i]
  },
  {
    name: 'Chanterelle',
    scientificName: 'Cantharellus cibarius',
    kingdom: 'Fungi',
    keywords: [/chanterelle/i, /golden\s*chanterelle/i]
  },
  {
    name: 'Artist Conk / Bracket Fungus',
    scientificName: 'Ganoderma applanatum',
    kingdom: 'Fungi',
    keywords: [/bracket\s*fung(us|i)/i, /shelf\s*fung(us|i)/i, /artist'?s?\s*conk/i, /ganoderma/i]
  },
  {
    name: 'Fly Agaric',
    scientificName: 'Amanita muscaria',
    kingdom: 'Fungi',
    keywords: [/fly\s*agaric/i, /amanita/i]
  },
  {
    name: 'Polypore Fungus',
    scientificName: 'Polyporales',
    kingdom: 'Fungi',
    keywords: [/polypore/i, /pore\s*fungus/i]
  },
  {
    name: 'Crustose / Foliose Lichen',
    scientificName: 'Lichenized fungi',
    kingdom: 'Fungi',
    keywords: [/lichen/i, /crustose/i, /foliose/i, /reindeer\s*moss/i]
  },

  // PLANTAE
  {
    name: 'Western Sword Fern',
    scientificName: 'Polystichum munitum',
    kingdom: 'Plantae',
    keywords: [/sword\s*fern/i, /fern/i, /polystichum/i, /bracken/i]
  },
  {
    name: 'Sphagnum Peat Moss',
    scientificName: 'Sphagnum palustre',
    kingdom: 'Plantae',
    keywords: [/sphagnum/i, /peat\s*moss/i, /moss\s*bed/i, /mossy/i]
  },
  {
    name: 'Western Redcedar',
    scientificName: 'Thuja plicata',
    kingdom: 'Plantae',
    keywords: [/redcedar/i, /cedar/i, /thuja/i]
  },
  {
    name: 'Douglas Fir',
    scientificName: 'Pseudotsuga menziesii',
    kingdom: 'Plantae',
    keywords: [/douglas\s*fir/i, /fir\s*tree/i, /fir\s*needle/i]
  },
  {
    name: 'Bigleaf Maple',
    scientificName: 'Acer macrophyllum',
    kingdom: 'Plantae',
    keywords: [/bigleaf\s*maple/i, /maple\s*leaf/i, /acer/i]
  },
  {
    name: 'Wild Blackberry / Bramble',
    scientificName: 'Rubus armeniacus',
    kingdom: 'Plantae',
    keywords: [/blackberry/i, /bramble/i, /rubus/i]
  },
  {
    name: 'Stinging Nettle',
    scientificName: 'Urtica dioica',
    kingdom: 'Plantae',
    keywords: [/stinging\s*nettle/i, /nettle/i]
  },
  {
    name: 'Pacific Trillium',
    scientificName: 'Trillium ovatum',
    kingdom: 'Plantae',
    keywords: [/trillium/i, /three-petaled/i]
  },

  // AVES
  {
    name: 'Black-capped Chickadee',
    scientificName: 'Poecile atricapillus',
    kingdom: 'Aves',
    keywords: [/chickadee/i, /poecile/i]
  },
  {
    name: 'Common Raven',
    scientificName: 'Corvus corax',
    kingdom: 'Aves',
    keywords: [/raven/i, /corvus/i, /crow/i]
  },
  {
    name: 'Pileated Woodpecker',
    scientificName: 'Dryocopus pileatus',
    kingdom: 'Aves',
    keywords: [/pileated\s*woodpecker/i, /woodpecker/i, /tree\s*tapping/i]
  },
  {
    name: 'Red-tailed Hawk',
    scientificName: 'Buteo jamaicensis',
    kingdom: 'Aves',
    keywords: [/red-?tailed\s*hawk/i, /hawk/i, /buteo/i, /raptor/i]
  },
  {
    name: 'Great Blue Heron',
    scientificName: 'Ardea herodias',
    kingdom: 'Aves',
    keywords: [/blue\s*heron/i, /heron/i]
  },

  // ANIMALIA / REPTILES / AMPHIBIANS
  {
    name: 'Rough-skinned Newt',
    scientificName: 'Taricha granulosa',
    kingdom: 'Animalia',
    keywords: [/rough-?skinned\s*newt/i, /newt/i, /taricha/i]
  },
  {
    name: 'Pacific Tree Frog',
    scientificName: 'Pseudacris regilla',
    kingdom: 'Animalia',
    keywords: [/tree\s*frog/i, /chorus\s*frog/i, /pseudacris/i, /frog/i]
  },
  {
    name: 'Black-tailed Deer',
    scientificName: 'Odocoileus hemionus',
    kingdom: 'Animalia',
    keywords: [/deer/i, /buck/i, /doe/i, /fawn/i]
  },
  {
    name: 'Banana Slug',
    scientificName: 'Ariolimax columbianus',
    kingdom: 'Animalia',
    keywords: [/banana\s*slug/i, /slug/i, /ariolimax/i]
  },
  {
    name: 'Garter Snake',
    scientificName: 'Thamnophis sirtalis',
    kingdom: 'Animalia',
    keywords: [/garter\s*snake/i, /snake/i]
  },

  // INSECTA
  {
    name: 'Yellow-faced Bumblebee',
    scientificName: 'Bombus vosnesenskii',
    kingdom: 'Insecta',
    keywords: [/bumble\s*bee/i, /bombus/i, /honeybee/i, /pollinator/i]
  },
  {
    name: 'Dragonfly / Darner',
    scientificName: 'Aeshnidae',
    kingdom: 'Insecta',
    keywords: [/dragonfly/i, /darner/i, /damselfly/i]
  },

  // GEOLOGY
  {
    name: 'Basalt Outcropping',
    scientificName: 'Igneous Rock',
    kingdom: 'Geology',
    keywords: [/basalt/i, /volcanic\s*rock/i, /columnar/i]
  },
  {
    name: 'Quartz Vein / River Cobble',
    scientificName: 'Silicate Mineral',
    kingdom: 'Geology',
    keywords: [/quartz/i, /river\s*cobble/i, /granite/i, /shale/i, /bedrock/i]
  }
];

export class FieldEntityParser {
  /**
   * Parses natural language spoken by a naturalist in the field
   * into structured ecological data attributes.
   */
  static parse(transcript: string): ExtractedFieldEntities {
    const text = transcript.trim();
    if (!text) {
      return {
        rawTranscript: '',
        speciesCandidates: ['Unidentified Observation'],
        commonName: 'General Field Note',
        kingdomOrGroup: 'Other'
      };
    }

    // 1. Identify species / taxonomy candidates
    const matchedSpecies: SpeciesPattern[] = [];
    for (const species of SPECIES_KNOWLEDGE) {
      for (const pattern of species.keywords) {
        if (pattern.test(text)) {
          if (!matchedSpecies.includes(species)) {
            matchedSpecies.push(species);
          }
          break;
        }
      }
    }

    const primarySpecies = matchedSpecies[0];
    const speciesCandidates = matchedSpecies.map((s) => s.name);
    if (speciesCandidates.length === 0) {
      speciesCandidates.push('Unclassified Observation');
    }

    // 2. Extract Substrate
    let substrate: string | undefined;
    const substrateMatch = text.match(
      /(on|upon|under|attached to|growing on|over)\s+(a\s+|an\s+|the\s+)?([a-z\s]+?)(log|trunk|bark|rock|stone|boulder|soil|ground|leaf litter|creek bed|stream|branch|stump)/i
    );
    if (substrateMatch) {
      substrate = `${substrateMatch[3].trim()} ${substrateMatch[4].trim()}`.replace(/\s+/g, ' ').trim();
    } else if (/decaying\s+log|nurse\s+log/i.test(text)) {
      substrate = 'Decaying nurse log';
    } else if (/rock\s+face|boulder/i.test(text)) {
      substrate = 'Rock face';
    } else if (/damp\s+soil|leaf\s+litter/i.test(text)) {
      substrate = 'Damp forest soil / leaf litter';
    }

    // 3. Extract Habitat / Microclimate
    let habitat: string | undefined;
    const habitatKeywords = [
      'north-facing slope',
      'north slope',
      'south slope',
      'riparian zone',
      'creek bank',
      'stream bank',
      'river bank',
      'conifer canopy',
      'old growth',
      'shaded ravine',
      'damp understory',
      'bog',
      'wetland',
      'mossy bank',
      'trailside clearing',
      'meadow'
    ];
    for (const kw of habitatKeywords) {
      if (new RegExp(kw, 'i').test(text)) {
        habitat = kw.charAt(0).toUpperCase() + kw.slice(1);
        break;
      }
    }

    // 4. Extract Abundance / Count
    let abundanceCount: number | undefined;
    const numberWords: Record<string, number> = {
      one: 1,
      single: 1,
      two: 2,
      pair: 2,
      three: 3,
      four: 4,
      five: 5,
      six: 6,
      seven: 7,
      eight: 8,
      nine: 9,
      ten: 10,
      dozen: 12
    };

    const countMatch = text.match(/\b(roughly|about|around|at least)?\s*(\d+|one|single|two|pair|three|four|five|six|seven|eight|nine|ten|dozen)\s+(specimens|individuals|fruiting bodies|clusters|plants|birds|insects)?/i);
    if (countMatch) {
      const token = countMatch[2].toLowerCase();
      abundanceCount = numberWords[token] ?? parseInt(token, 10);
    } else if (/cluster|colony|patch|carpet/i.test(text)) {
      abundanceCount = 5;
    }

    // 5. Extract Life Stage
    let lifeStage: ExtractedFieldEntities['lifeStage'] = 'unknown';
    if (/fruiting\s*bod(y|ies)|spore|conk|mushroom\s*cap/i.test(text)) {
      lifeStage = 'fruiting_body';
    } else if (/flower(ing|s)?|in bloom|blossom/i.test(text)) {
      lifeStage = 'flowering';
    } else if (/seedling|sprout/i.test(text)) {
      lifeStage = 'seedling';
    } else if (/juvenile|young|fawn|chick|larva|caterpillar/i.test(text)) {
      lifeStage = 'juvenile';
    } else if (/mature|adult/i.test(text)) {
      lifeStage = 'adult';
    }

    // 6. Extract Weather
    let weatherObservation: string | undefined;
    const weatherPhrases = [
      'damp and foggy',
      'misty morning',
      'high humidity',
      'dappled sunlight',
      'overcast',
      'light rain',
      'breezy',
      'chilly morning'
    ];
    for (const phrase of weatherPhrases) {
      if (new RegExp(phrase, 'i').test(text)) {
        weatherObservation = phrase.charAt(0).toUpperCase() + phrase.slice(1);
        break;
      }
    }

    return {
      rawTranscript: transcript,
      speciesCandidates,
      commonName: primarySpecies?.name || speciesCandidates[0],
      scientificName: primarySpecies?.scientificName,
      kingdomOrGroup: primarySpecies?.kingdom || 'Other',
      habitat,
      substrate,
      abundanceCount: abundanceCount || 1,
      lifeStage,
      weatherObservation,
      fieldNotes: transcript
    };
  }
}

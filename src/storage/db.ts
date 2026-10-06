import Dexie, { type Table } from 'dexie';
import type { FieldObservation } from './types';

export class TrailScribeDB extends Dexie {
  observations!: Table<FieldObservation, string>;

  constructor() {
    super('TrailScribeDatabase');
    this.version(1).stores({
      observations: 'id, timestamp, commonName, kingdomOrGroup, habitat'
    });
  }

  async saveObservation(obs: FieldObservation): Promise<string> {
    await this.observations.put(obs);
    return obs.id;
  }

  async getObservation(id: string): Promise<FieldObservation | undefined> {
    return await this.observations.get(id);
  }

  async getAllObservations(): Promise<FieldObservation[]> {
    return await this.observations.orderBy('timestamp').reverse().toArray();
  }

  async getRecentObservations(limit = 10): Promise<FieldObservation[]> {
    return await this.observations.orderBy('timestamp').reverse().limit(limit).toArray();
  }

  async deleteObservation(id: string): Promise<void> {
    await this.observations.delete(id);
  }

  async updateObservation(id: string, updates: Partial<FieldObservation>): Promise<void> {
    await this.observations.update(id, updates);
  }

  async clearAllObservations(): Promise<void> {
    await this.observations.clear();
  }

  async getCount(): Promise<number> {
    return await this.observations.count();
  }

  async searchAndFilter(options?: { category?: string; query?: string }): Promise<FieldObservation[]> {
    let all = await this.getAllObservations();

    if (options?.category && options.category !== 'all') {
      const cat = options.category.toLowerCase();
      all = all.filter((obs) => {
        if (cat === 'birds') return obs.kingdomOrGroup === 'Aves';
        if (cat === 'plants') return obs.kingdomOrGroup === 'Plantae';
        if (cat === 'insects') return obs.kingdomOrGroup === 'Insecta';
        if (cat === 'sounds') return obs.audioBlob !== undefined || obs.habitat?.toLowerCase().includes('acoustic') || obs.rawTranscript?.toLowerCase().includes('call') || obs.commonName?.toLowerCase().includes('owlet');
        return true;
      });
    }

    if (options?.query && options.query.trim()) {
      const q = options.query.toLowerCase().trim();
      all = all.filter((obs) => 
        obs.commonName?.toLowerCase().includes(q) ||
        obs.scientificName?.toLowerCase().includes(q) ||
        obs.habitat?.toLowerCase().includes(q) ||
        obs.fieldNotes?.toLowerCase().includes(q)
      );
    }

    return all;
  }

  async seedDefaultDataIfEmpty(): Promise<void> {
    const count = await this.getCount();
    if (count > 0) return;

    const sampleSightings: FieldObservation[] = [
      {
        id: 'oriental-dwarf-kingfisher',
        timestamp: Date.now() - 3600000 * 3,
        readableDate: 'Today · 09:15 AM',
        coordinates: { latitude: 18.9167, longitude: 73.3333, accuracy: 5 },
        photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCUa7mlEqL-Zl5MFy4hnfhdb1rSjhFiMP1X2DNG6Vo5QovjzpAhGZsqbSaUoPeyOcac-PgnfeM8FFl_kPrsPvaOnNMTifalb_GSZB8s5oB8VO9tc_ONVjzW9A-j8k015iT3EKJtrBT4ayxnjnMgbAmtNRkMPd-wXFa8Lfohw3pwxzB24U3-dsErWXk_cjLbviD12wqubyzkz1azwasGYEuckAoJmtzvlJmLCNsWLQbH_kn2pvGy8vb',
        rawTranscript: 'Oriental Dwarf Kingfisher (Jewel of the Forest) observed perching quietly near shaded forest stream. Vivid magenta/violet crown, cobalt-blue wings, bright golden belly, and coral-red dagger bill.',
        speciesCandidates: ['Oriental Dwarf Kingfisher', 'Ceyx erithaca', 'Black-backed Kingfisher'],
        commonName: 'Oriental Dwarf Kingfisher',
        scientificName: 'Ceyx erithaca',
        confidenceScore: 0.97,
        kingdomOrGroup: 'Aves',
        habitat: 'Dense shaded stream gully, wet evergreen forest understory',
        substrate: 'Low horizontal mossy perch above stream',
        abundanceCount: 1,
        lifeStage: 'adult',
        weatherObservation: '25°C, humid shaded ravine',
        fieldNotes: 'Diminutive, hyper-colorful river kingfisher often referred to as the Jewel of the Forest. Feeds on forest stream geckos, frogs, and aquatic insects.',
        synced: true
      },
      {
        id: 'malabar-trogon',
        timestamp: Date.now() - 3600000 * 5,
        readableDate: 'Today · 11:20 AM',
        coordinates: { latitude: 19.0438, longitude: 73.0674, accuracy: 6 },
        photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCUa7mlEqL-Zl5MFy4hnfhdb1rSjhFiMP1X2DNG6Vo5QovjzpAhGZsqbSaUoPeyOcac-PgnfeM8FFl_kPrsPvaOnNMTifalb_GSZB8s5oB8VO9tc_ONVjzW9A-j8k015iT3EKJtrBT4ayxnjnMgbAmtNRkMPd-wXFa8Lfohw3pwxzB24U3-dsErWXk_cjLbviD12wqubyzkz1azwasGYEuckAoJmtzvlJmLCNsWLQbH_kn2pvGy8vb',
        rawTranscript: 'Male Malabar Trogon perched quietly in middle forest canopy. Jet black hood, white necklace, and brilliant crimson-red breast.',
        speciesCandidates: ['Malabar Trogon', 'Harpactes fasciatus'],
        commonName: 'Malabar Trogon',
        scientificName: 'Harpactes fasciatus',
        confidenceScore: 0.96,
        kingdomOrGroup: 'Aves',
        habitat: 'Moist deciduous & evergreen forest, middle canopy',
        substrate: 'Horizontal sub-canopy branch',
        abundanceCount: 1,
        lifeStage: 'adult',
        weatherObservation: '26°C, dappled shade canopy',
        fieldNotes: 'Iconic Western Ghats forest bird. Distinctive upright perched silhouette, black head, white crescent collar, and bright crimson belly.',
        synced: true
      },
      {
        id: 'asian-koel',
        timestamp: Date.now() - 3600000 * 2,
        readableDate: 'Today · 07:42 AM',
        coordinates: { latitude: 18.9553, longitude: 72.8055, accuracy: 5 },
        photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCUa7mlEqL-Zl5MFy4hnfhdb1rSjhFiMP1X2DNG6Vo5QovjzpAhGZsqbSaUoPeyOcac-PgnfeM8FFl_kPrsPvaOnNMTifalb_GSZB8s5oB8VO9tc_ONVjzW9A-j8k015iT3EKJtrBT4ayxnjnMgbAmtNRkMPd-wXFa8Lfohw3pwxzB24U3-dsErWXk_cjLbviD12wqubyzkz1azwasGYEuckAoJmtzvlJmLCNsWLQbH_kn2pvGy8vb',
        rawTranscript: 'A male Asian Koel observed calling high in the fig canopy near Hanging Gardens. Striking ruby red eyes with glossy blue-black plumage.',
        speciesCandidates: ['Asian Koel', 'Eudynamys scolopaceus'],
        commonName: 'Asian Koel',
        scientificName: 'Eudynamys scolopaceus',
        confidenceScore: 0.92,
        kingdomOrGroup: 'Aves',
        habitat: 'Tropical canopy, fig trees',
        substrate: 'Ficus benghalensis branch',
        abundanceCount: 1,
        lifeStage: 'adult',
        weatherObservation: '27°C, partly cloudy morning',
        fieldNotes: 'Diurnal vocalizer, brood parasite laying in house crow nests. Loud ku-oo call.',
        synced: true
      },
      {
        id: 'neem',
        timestamp: Date.now() - 3600000 * 24,
        readableDate: 'Yesterday · Sanjay Gandhi NP',
        coordinates: { latitude: 19.2288, longitude: 72.9182, accuracy: 8 },
        photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBU5AyQmau62lXdjO44GXKkEft5pqUqvNCMNxkjCAHjj75_bUCNfvaKU8nS--flHUqJRWeYl1kPQ0wItC7_DfVdrcibFZDWYWKV3m7pAJfmsKV708cDqoM8K8p7ccy-4P079Jdd9QB4-jP2wRVwDQm_SLZiSG34vcFg3phjF1eMJSTX7jm-omRWuHwDOqFDjE6yFaXQglUdRWGqdK8mMqCWxtMxohbilvn3RBxgUqMKYMsEsyjUaAYJ',
        rawTranscript: 'Mature Neem tree specimen with fragrant pinnate foliage and delicate white floral clusters. Known for medicinal properties.',
        speciesCandidates: ['Neem', 'Azadirachta indica'],
        commonName: 'Neem Tree',
        scientificName: 'Azadirachta indica',
        confidenceScore: 0.98,
        kingdomOrGroup: 'Plantae',
        habitat: 'Deciduous dry forest edge',
        substrate: 'Laterite rich loam',
        abundanceCount: 3,
        lifeStage: 'flowering',
        fieldNotes: 'Leaves heavily serrated; notable antiseptic bitter sap.',
        synced: true
      },
      {
        id: 'common-mormon',
        timestamp: Date.now() - 3600000 * 48,
        readableDate: 'May 16 · Aarey Milk Colony',
        coordinates: { latitude: 19.1485, longitude: 72.8821, accuracy: 12 },
        photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEOIrzEhn0yiro68Ye6UR-IloHx77QrlTYn_OVzSYPBrYPOqIqD_RLRafVus8rvnmL7VUsZEZ2k3V-S2V7feYPbWh0GsateibIoMylvA4vioqNzNXRnTki8AUblNqc6L_krl9G4l3rOjhRE-yf6UYWwfhCfHRUuWeqbG5DsQzo40LT6RfLQud9mpb27xUQx6ZKG9cxOOjgvGAMkBwIBIQ21AX7mouNzmpWP71zf1evF3VOhB09Ao51',
        rawTranscript: 'Common Mormon butterfly basking on moist forest soil. Velvet black wings patterned with pale yellow spots and ruby markings.',
        speciesCandidates: ['Common Mormon', 'Papilio polytes'],
        commonName: 'Common Mormon',
        scientificName: 'Papilio polytes',
        confidenceScore: 0.95,
        kingdomOrGroup: 'Insecta',
        habitat: 'Damp clearing near riparian understory',
        substrate: 'Moist mud patch',
        abundanceCount: 2,
        lifeStage: 'adult',
        fieldNotes: 'Famous Batesian mimic; females mimic the unpalatable Common Rose.',
        synced: false
      },
      {
        id: 'indian-palm-squirrel',
        timestamp: Date.now() - 3600000 * 72,
        readableDate: '09 Oct · Kharghar Hills',
        coordinates: { latitude: 19.0438, longitude: 73.0674, accuracy: 6 },
        photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDUq24kjNUYNTxx9ant7TAfN6xjpb3UCN8Pz0n8SGwbECI6fi2QCTTf08Rw5Ge9umcFh8_DgRLspfVvTWRU6X_rfLL3o3ytL4gYWdOZ2aLxiUZZHIenRLjPdmJ0C82-P3XnQYfBHFCKX1IhZo-_yHk31R-G4e4Nc6SG-P_zyj1caoetLM0zRplIe0WFMlQ_Y4clQKixljMHS-onwfNLuqVvwB5h-wenFx2oD6Y3yv3MjP-lcuXDzYKq',
        rawTranscript: 'Three-striped Indian Palm Squirrel foraging on teak bark in morning light. Alert posture with twitching tail and bird-like chirping alarm call.',
        speciesCandidates: ['Indian Palm Squirrel', 'Funambulus palmarum'],
        commonName: 'Indian Palm Squirrel',
        scientificName: 'Funambulus palmarum',
        confidenceScore: 0.94,
        kingdomOrGroup: 'Animalia',
        habitat: 'Teak woodland and garden margins',
        substrate: 'Weathered teak tree bark',
        abundanceCount: 1,
        lifeStage: 'adult',
        fieldNotes: 'Fast agile rodent with distinct 3 dorsal white stripes.',
        synced: true
      },
      {
        id: 'ghost-tree',
        timestamp: Date.now() - 3600000 * 96,
        readableDate: '07 Oct · Matheran Foothills',
        coordinates: { latitude: 18.9866, longitude: 73.2684, accuracy: 9 },
        photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD3NlJbVj8Hqj6W1O8m7B8V6x4C2z0A9N8S5p4R3q2t1u0Y7X6W5v4U3t2S1R0q9P8o7N6M5l4K3j2h1G0f9E8d7C6b5a4Z3y2x1W0v9U8t7S6r5Q4p3O2n1M0l9K8j7H6g5F4e3D2c1B0a9Z8y7X6w5V4u3T2s1R0q9P8',
        rawTranscript: 'Striking pale deciduous trunk standing stark against dry forest slopes. The peeling papery bark reveals smooth white inner layers resembling bone.',
        speciesCandidates: ['Ghost Tree', 'Sterculia urens'],
        commonName: 'Ghost Tree',
        scientificName: 'Sterculia urens',
        confidenceScore: 0.96,
        kingdomOrGroup: 'Plantae',
        habitat: 'Rocky dry deciduous cliffside',
        substrate: 'Basalt outcrop',
        abundanceCount: 1,
        lifeStage: 'adult',
        fieldNotes: 'Also known as Gum Karaya tree. Completely sheds leaves in dry months.',
        synced: true
      },
      {
        id: 'spotted-owlet',
        timestamp: Date.now() - 3600000 * 120,
        readableDate: '02 Oct · Yeoor Hills',
        coordinates: { latitude: 19.2312, longitude: 72.9541, accuracy: 7 },
        photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCUa7mlEqL-Zl5MFy4hnfhdb1rSjhFiMP1X2DNG6Vo5QovjzpAhGZsqbSaUoPeyOcac-PgnfeM8FFl_kPrsPvaOnNMTifalb_GSZB8s5oB8VO9tc_ONVjzW9A-j8k015iT3EKJtrBT4ayxnjnMgbAmtNRkMPd-wXFa8Lfohw3pwxzB24U3-dsErWXk_cjLbviD12wqubyzkz1azwasGYEuckAoJmtzvlJmLCNsWLQbH_kn2pvGy8vb',
        rawTranscript: 'Acoustic Audio ID #829: Dual trill nocturnal vocalization detected at 2.4 kHz band. Perched quietly in tree cavity.',
        speciesCandidates: ['Spotted Owlet', 'Athene brama'],
        commonName: 'Spotted Owlet',
        scientificName: 'Athene brama',
        confidenceScore: 0.91,
        kingdomOrGroup: 'Aves',
        habitat: 'Deciduous grove and tree hollows',
        substrate: 'Mango tree cavity',
        abundanceCount: 2,
        lifeStage: 'adult',
        fieldNotes: 'Nocturnal raptor call recorded at dusk. 2.4 kHz signature dual trill.',
        synced: true
      },
      {
        id: 'purple-sunbird',
        timestamp: Date.now() - 3600000 * 144,
        readableDate: '28 Sep · Hanging Gardens',
        coordinates: { latitude: 18.9556, longitude: 72.8052, accuracy: 4 },
        photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDCUa7mlEqL-Zl5MFy4hnfhdb1rSjhFiMP1X2DNG6Vo5QovjzpAhGZsqbSaUoPeyOcac-PgnfeM8FFl_kPrsPvaOnNMTifalb_GSZB8s5oB8VO9tc_ONVjzW9A-j8k015iT3EKJtrBT4ayxnjnMgbAmtNRkMPd-wXFa8Lfohw3pwxzB24U3-dsErWXk_cjLbviD12wqubyzkz1azwasGYEuckAoJmtzvlJmLCNsWLQbH_kn2pvGy8vb',
        rawTranscript: 'Male in non-breeding eclipse plumage foraging actively on hibiscus flowers. Downcurved beak sipping nectar.',
        speciesCandidates: ['Purple Sunbird', 'Cinnyris asiaticus'],
        commonName: 'Purple Sunbird',
        scientificName: 'Cinnyris asiaticus',
        confidenceScore: 0.94,
        kingdomOrGroup: 'Aves',
        habitat: 'Urban parkland and botanical garden',
        substrate: 'Hibiscus shrub',
        abundanceCount: 1,
        lifeStage: 'adult',
        fieldNotes: 'Hyperactive nectar feeder with iridescent purple-black plumage in breeding season.',
        synced: true
      },
      {
        id: 'blue-tiger',
        timestamp: Date.now() - 3600000 * 168,
        readableDate: '24 Sep · Kanheri Caves',
        coordinates: { latitude: 19.2064, longitude: 72.9066, accuracy: 10 },
        photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCEOIrzEhn0yiro68Ye6UR-IloHx77QrlTYn_OVzSYPBrYPOqIqD_RLRafVus8rvnmL7VUsZEZ2k3V-S2V7feYPbWh0GsateibIoMylvA4vioqNzNXRnTki8AUblNqc6L_krl9G4l3rOjhRE-yf6UYWwfhCfHRUuWeqbG5DsQzo40LT6RfLQud9mpb27xUQx6ZKG9cxOOjgvGAMkBwIBIQ21AX7mouNzmpWP71zf1evF3VOhB09Ao51',
        rawTranscript: 'Blue Tiger butterfly migratory individual resting in damp ravine shade. Blue-tinted white streaks across deep brown wings.',
        speciesCandidates: ['Blue Tiger', 'Tirumala limniace'],
        commonName: 'Blue Tiger Butterfly',
        scientificName: 'Tirumala limniace',
        confidenceScore: 0.93,
        kingdomOrGroup: 'Insecta',
        habitat: 'Riparian forested valley',
        substrate: 'Moist fern frond',
        abundanceCount: 4,
        lifeStage: 'adult',
        fieldNotes: 'Danaine brush-footed butterfly known for mass seasonal migratory flights across the Western Ghats.',
        synced: true
      }
    ];

    for (const item of sampleSightings) {
      await this.saveObservation(item);
    }
  }
}

export const db = new TrailScribeDB();

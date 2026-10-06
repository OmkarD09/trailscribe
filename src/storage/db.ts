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

  async seedDefaultDataIfEmpty(): Promise<void> {
    const count = await this.getCount();
    if (count > 0) return;

    const sampleSightings: FieldObservation[] = [
      {
        id: 'specimen-047',
        timestamp: Date.now() - 3600000 * 2,
        readableDate: 'Today · 07:42 AM',
        coordinates: { latitude: 18.922, longitude: 72.8346, accuracy: 5 },
        photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBZruNU5OzscDzFmOUIUrBq_rRAkMv7R9YeRyA9fWsbFGVdyE9yHiWUAjwn1MqTALLIhuMRAeuv0-0Qvemsq_VWA9qftsCctpNqit-zbPZ9fP0anyZGF6yapuhihIb9Dnh2DXvyo6gQME3Wm2dUj16Q_1n54IhQR7YQloKlq0iuhZOt0u1ft2Lj3C6NOXCtvXzWZhZGlZF4fwWc2anyK0rMy0oSWCMzx08pEju7Ykc74Ya2C82QDp9H',
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
        fieldNotes: 'Diurnal vocalizer, brood parasite laying in house crow nests.',
        synced: true
      },
      {
        id: 'specimen-046',
        timestamp: Date.now() - 3600000 * 24,
        readableDate: 'Yesterday · Sanjay Gandhi NP',
        coordinates: { latitude: 19.2288, longitude: 72.9182, accuracy: 8 },
        photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuACW9Uk4_w77Z_nUlQr5mOUZ0S6FaQWQXtHthTfRd7v0YT90G0Zl5Oz6wI62vRaJyfq_aXMIhurGZzBhDgX_NoxMkGJS60mXWCSl5BkcshECXF9dqmyyng4tRFVAQq1BZ9C08mMIBfx_XwAk05eu05TxjRJnFCJY8oReTEydd2t98M5GKOcd5V9mLncbGXZjlmK8bjFJ3QcFHS4rk0qEWrnFISCpw70Kh2aVJsd6TpeoYu7O8xzxz_s',
        rawTranscript: 'Mature Neem tree specimen with fragrant pinnate foliage and delicate white floral clusters. Known for medicinal properties.',
        speciesCandidates: ['Neem', 'Azadirachta indica'],
        commonName: 'Neem',
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
        id: 'specimen-045',
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
        id: 'specimen-044',
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
      }
    ];

    for (const item of sampleSightings) {
      await this.saveObservation(item);
    }
  }
}

export const db = new TrailScribeDB();

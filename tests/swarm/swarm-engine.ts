import type { FieldObservation } from '../../src/storage/types.ts';
import { FieldEntityParser } from '../../src/runner/parser.ts';

export type AgentArchetype = 'Alpine Botanist' | 'Urban Forager' | 'Fungal Pathfinder' | 'Deep Backcountry Trekker';

export interface NaturalistAgent {
  id: string;
  name: string;
  archetype: AgentArchetype;
  baseCoordinates: { latitude: number; longitude: number; altitudeMeters: number };
  gpsDriftFactor: number;
  networkToggleRate: number;
  generateObservation(sessionIndex: number): FieldObservation;
  generateAudioTranscript(): string;
}

export class SwarmEngine {
  private agents: NaturalistAgent[] = [];

  constructor() {
    this.instantiateSwarm();
  }

  private instantiateSwarm(): void {
    // 1. 25 Alpine Botanists
    for (let i = 1; i <= 25; i++) {
      const id = `alpine-botanist-${i.toString().padStart(2, '0')}`;
      this.agents.push({
        id,
        name: `Alpine Botanist #${i}`,
        archetype: 'Alpine Botanist',
        baseCoordinates: { latitude: 19.342 + (i * 0.003), longitude: 73.551 + (i * 0.002), altitudeMeters: 2450 + (i * 45) },
        gpsDriftFactor: 0.008,
        networkToggleRate: 0.1,
        generateObservation: (seq) => this.generateAlpineObservation(id, seq, i),
        generateAudioTranscript: () => `Alpine floral specimen logged at 2800m scree ridge. Solitary flowering rosette in thin rocky soil.`
      });
    }

    // 2. 25 Urban Foragers
    for (let i = 1; i <= 25; i++) {
      const id = `urban-forager-${i.toString().padStart(2, '0')}`;
      this.agents.push({
        id,
        name: `Urban Forager #${i}`,
        archetype: 'Urban Forager',
        baseCoordinates: { latitude: 18.955 + (i * 0.001), longitude: 72.805 + (i * 0.001), altitudeMeters: 25 + (i * 2) },
        gpsDriftFactor: 0.001,
        networkToggleRate: 0.8,
        generateObservation: (seq) => this.generateUrbanObservation(id, seq, i),
        generateAudioTranscript: () => `Urban flora study: 3 adult Tridax procumbens sprouting in masonry mortar crack along public park border.`
      });
    }

    // 3. 25 Fungal Pathfinders
    for (let i = 1; i <= 25; i++) {
      const id = `fungal-pathfinder-${i.toString().padStart(2, '0')}`;
      this.agents.push({
        id,
        name: `Fungal Pathfinder #${i}`,
        archetype: 'Fungal Pathfinder',
        baseCoordinates: { latitude: 18.752 + (i * 0.002), longitude: 73.408 + (i * 0.002), altitudeMeters: 560 + (i * 12) },
        gpsDriftFactor: 0.0005,
        networkToggleRate: 0.05,
        generateObservation: (seq) => this.generateFungalObservation(id, seq, i),
        generateAudioTranscript: () => `Found dense cluster of bracket fungi on decaying Dipterocarpus log in damp shaded ravine. Count 14 fruiting bodies.`
      });
    }

    // 4. 25 Deep Backcountry Trekkers
    for (let i = 1; i <= 25; i++) {
      const id = `backcountry-trekker-${i.toString().padStart(2, '0')}`;
      this.agents.push({
        id,
        name: `Backcountry Trekker #${i}`,
        archetype: 'Deep Backcountry Trekker',
        baseCoordinates: { latitude: 18.520 + (i * 0.004), longitude: 73.610 + (i * 0.003), altitudeMeters: 1100 + (i * 20) },
        gpsDriftFactor: 0.012,
        networkToggleRate: 0.0,
        generateObservation: (seq) => this.generateBackcountryObservation(id, seq, i),
        generateAudioTranscript: () => `Acoustic bio-signal recorded at dawn: Malabar Whistling Thrush territorial whistling flute melody echoing over valley stream.`
      });
    }
  }

  private generateAlpineObservation(agentId: string, seq: number, idx: number): FieldObservation {
    const lat = 19.342 + (idx * 0.003) + (Math.random() - 0.5) * 0.008;
    const lng = 73.551 + (idx * 0.002) + (Math.random() - 0.5) * 0.008;
    const speciesList = [
      { common: 'Himalayan Blue Poppy', sci: 'Meconopsis betonicifolia', kingdom: 'Plantae' as const },
      { common: 'Alpine Gentian', sci: 'Gentiana kurroo', kingdom: 'Plantae' as const },
      { common: 'Snow Lotus', sci: 'Saussurea obvallata', kingdom: 'Plantae' as const },
      { common: 'Mountain Rhododendron', sci: 'Rhododendron arboreum', kingdom: 'Plantae' as const }
    ];
    const s = speciesList[(idx + seq) % speciesList.length];
    const notes = `High scree ledge at 2,750m elevation. Cold wind exposure, solitary specimen wedged into basalt fracture.`;
    const parsed = FieldEntityParser.parse(notes);

    return {
      id: `${agentId}-obs-${seq}`,
      timestamp: Date.now() - (idx * 60000 + seq * 12000),
      readableDate: `Today · Alpine Sector`,
      coordinates: { latitude: lat, longitude: lng, accuracy: 8 },
      photoUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=600&q=80',
      speciesCandidates: [s.common, s.sci],
      commonName: s.common,
      scientificName: s.sci,
      confidenceScore: 0.94,
      kingdomOrGroup: s.kingdom,
      habitat: 'Alpine scree ridge and exposed rock clefts',
      substrate: parsed.substrate || 'Weathered basalt scree',
      abundanceCount: parsed.abundanceCount || 1,
      lifeStage: 'flowering',
      fieldNotes: notes,
      synced: false
    };
  }

  private generateUrbanObservation(agentId: string, seq: number, idx: number): FieldObservation {
    const lat = 18.955 + (idx * 0.001) + (Math.random() - 0.5) * 0.001;
    const lng = 72.805 + (idx * 0.001) + (Math.random() - 0.5) * 0.001;
    const speciesList = [
      { common: 'Coat Buttons', sci: 'Tridax procumbens', kingdom: 'Plantae' as const },
      { common: 'Drumstick Tree', sci: 'Moringa oleifera', kingdom: 'Plantae' as const },
      { common: 'Sacred Fig Sapling', sci: 'Ficus religiosa', kingdom: 'Plantae' as const },
      { common: 'Garden Yellow Butterfly', sci: 'Eurema hecabe', kingdom: 'Insecta' as const }
    ];
    const s = speciesList[(idx + seq) % speciesList.length];
    const notes = `Urban park periphery. Count 4 specimens growing vigorously through sidewalk pavement gap.`;
    const parsed = FieldEntityParser.parse(notes);

    return {
      id: `${agentId}-obs-${seq}`,
      timestamp: Date.now() - (idx * 45000 + seq * 8000),
      readableDate: `Today · Urban Pocket`,
      coordinates: { latitude: lat, longitude: lng, accuracy: 18 },
      photoUrl: 'https://images.unsplash.com/photo-1546842931-886c185b4c8c?auto=format&fit=crop&w=600&q=80',
      speciesCandidates: [s.common, s.sci],
      commonName: s.common,
      scientificName: s.sci,
      confidenceScore: 0.89,
      kingdomOrGroup: s.kingdom,
      habitat: 'Urban public garden margin and sidewalk pavement',
      substrate: parsed.substrate || 'Mortar and loam silt',
      abundanceCount: parsed.abundanceCount || 4,
      lifeStage: 'adult',
      fieldNotes: notes,
      synced: false
    };
  }

  private generateFungalObservation(agentId: string, seq: number, idx: number): FieldObservation {
    const lat = 18.752 + (idx * 0.002) + (Math.random() - 0.5) * 0.0005;
    const lng = 73.408 + (idx * 0.002) + (Math.random() - 0.5) * 0.0005;
    const speciesList = [
      { common: 'Turkey Tail Fungus', sci: 'Trametes versicolor', kingdom: 'Fungi' as const },
      { common: 'Reishi Mushroom', sci: 'Ganoderma lucidum', kingdom: 'Fungi' as const },
      { common: 'Pinwheel Marasmius', sci: 'Marasmius haematocephalus', kingdom: 'Fungi' as const },
      { common: 'Split-Gill Mushroom', sci: 'Schizophyllum commune', kingdom: 'Fungi' as const }
    ];
    const s = speciesList[(idx + seq) % speciesList.length];
    const notes = `Dense damp decaying log microhabitat. 12 fruiting body specimens forming concentric bracket clusters on moist rotting bark.`;
    const parsed = FieldEntityParser.parse(notes);

    return {
      id: `${agentId}-obs-${seq}`,
      timestamp: Date.now() - (idx * 50000 + seq * 10000),
      readableDate: `Today · Decaying Log Microhabitat`,
      coordinates: { latitude: lat, longitude: lng, accuracy: 4 },
      photoUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
      speciesCandidates: [s.common, s.sci],
      commonName: s.common,
      scientificName: s.sci,
      confidenceScore: 0.96,
      kingdomOrGroup: s.kingdom,
      habitat: 'Humid subtropical rainforest canopy floor',
      substrate: parsed.substrate || 'Decaying fallen deciduous log',
      abundanceCount: parsed.abundanceCount || 12,
      lifeStage: 'fruiting_body',
      fieldNotes: notes,
      synced: false
    };
  }

  private generateBackcountryObservation(agentId: string, seq: number, idx: number): FieldObservation {
    const lat = 18.520 + (idx * 0.004) + (seq * 0.002);
    const lng = 73.610 + (idx * 0.003) + (seq * 0.0015);
    const speciesList = [
      { common: 'Malabar Whistling Thrush', sci: 'Myophonus hoyi', kingdom: 'Aves' as const },
      { common: 'Indian Giant Squirrel', sci: 'Ratufa indica', kingdom: 'Animalia' as const },
      { common: 'Great Pied Hornbill', sci: 'Buceros bicornis', kingdom: 'Aves' as const },
      { common: 'Barking Deer', sci: 'Muntiacus muntjak', kingdom: 'Animalia' as const }
    ];
    const s = speciesList[(idx + seq) % speciesList.length];
    const notes = `Backcountry stream corridor. Acoustic bio-call recorded across rushing river canyon. Adult pair actively vocalizing.`;
    const parsed = FieldEntityParser.parse(notes);

    return {
      id: `${agentId}-obs-${seq}`,
      timestamp: Date.now() - (idx * 70000 + seq * 15000),
      readableDate: `Today · River Gorge Km ${(2.4 + seq * 1.2).toFixed(1)}`,
      coordinates: { latitude: lat, longitude: lng, accuracy: 6 },
      photoUrl: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?auto=format&fit=crop&w=600&q=80',
      speciesCandidates: [s.common, s.sci],
      commonName: s.common,
      scientificName: s.sci,
      confidenceScore: 0.93,
      kingdomOrGroup: s.kingdom,
      habitat: 'River canyon riparian forest corridor',
      substrate: parsed.substrate || 'Riparian evergreen branch',
      abundanceCount: parsed.abundanceCount || 2,
      lifeStage: 'adult',
      fieldNotes: notes,
      synced: false
    };
  }

  getAgents(): NaturalistAgent[] {
    return this.agents;
  }

  getArchetypeCounts(): Record<AgentArchetype, number> {
    const counts: Record<AgentArchetype, number> = {
      'Alpine Botanist': 0,
      'Urban Forager': 0,
      'Fungal Pathfinder': 0,
      'Deep Backcountry Trekker': 0
    };
    for (const a of this.agents) {
      counts[a.archetype]++;
    }
    return counts;
  }
}

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';

import { TrailScribeDB } from '../src/storage/db.ts';
import { DataExporter } from '../src/storage/exporter.ts';
import { OfflineVectorStore } from '../src/storage/vector-store.ts';
import { FieldEntityParser } from '../src/runner/parser.ts';
import { GemmaRunner } from '../src/runner/gemma-runner.ts';
import { computeBoundingBox, projectToCanvas, GeoLocationTracker } from '../src/utils/geolocation.ts';
import { ToxicityAnalyzer } from '../src/utils/toxicity.ts';
import { SolarEphemerisCalculator } from '../src/utils/ephemeris.ts';
import type { FieldObservation, Coordinates } from '../src/storage/types.ts';

describe('TrailScribe Offline Backend & Data Layer Validation', () => {
  let db: TrailScribeDB;

  test('1. IndexedDB Initialization & Seed Dataset Verification', async () => {
    db = new TrailScribeDB();
    await db.seedDefaultDataIfEmpty();

    const count = await db.getCount();
    assert.ok(count >= 8, `Expected at least 8 seeded specimens, got ${count}`);

    const all = await db.getAllObservations();
    assert.equal(all.length, count);

    // Verify key Stitch seed specimens exist
    const koel = await db.getObservation('asian-koel');
    assert.ok(koel, 'Asian Koel must exist in seeded specimens');
    assert.equal(koel?.scientificName, 'Eudynamys scolopaceus');
    assert.equal(koel?.kingdomOrGroup, 'Aves');

    const neem = await db.getObservation('neem');
    assert.ok(neem, 'Neem Tree must exist in seeded specimens');
    assert.equal(neem?.kingdomOrGroup, 'Plantae');

    const squirrel = await db.getObservation('indian-palm-squirrel');
    assert.ok(squirrel, 'Indian Palm Squirrel must exist in seeded specimens');
    assert.equal(squirrel?.kingdomOrGroup, 'Animalia');
  });

  test('2. Dynamic Search & Category Filtering in IndexedDB', async () => {
    // Birds Filter
    const birds = await db.searchAndFilter({ category: 'birds' });
    assert.ok(birds.length >= 2, 'Expected at least 2 bird specimens');
    for (const b of birds) {
      assert.equal(b.kingdomOrGroup, 'Aves');
    }

    // Plants Filter
    const plants = await db.searchAndFilter({ category: 'plants' });
    assert.ok(plants.length >= 2, 'Expected at least 2 plant specimens');
    for (const p of plants) {
      assert.equal(p.kingdomOrGroup, 'Plantae');
    }

    // Insects Filter
    const insects = await db.searchAndFilter({ category: 'insects' });
    assert.ok(insects.length >= 2, 'Expected at least 2 insect specimens');
    for (const i of insects) {
      assert.equal(i.kingdomOrGroup, 'Insecta');
    }

    // Sounds Filter
    const sounds = await db.searchAndFilter({ category: 'sounds' });
    assert.ok(sounds.length >= 1, 'Expected at least 1 sound specimen');

    // Keyword Search
    const searchResults = await db.searchAndFilter({ query: 'Squirrel' });
    assert.equal(searchResults.length, 1);
    assert.equal(searchResults[0].id, 'indian-palm-squirrel');
  });

  test('3. Specimen Capture & Persistence Pipeline', async () => {
    const newSpecimen: FieldObservation = {
      id: 'test-specimen-999',
      timestamp: Date.now(),
      readableDate: 'Today · 12:00 PM',
      coordinates: { latitude: 19.0438, longitude: 73.0674, accuracy: 4 },
      photoUrl: 'data:image/jpeg;base64,mockframedata',
      speciesCandidates: ['Common Kingfisher', 'Alcedo atthis'],
      commonName: 'Common Kingfisher',
      scientificName: 'Alcedo atthis',
      confidenceScore: 0.97,
      kingdomOrGroup: 'Aves',
      habitat: 'Riparian creek margin',
      abundanceCount: 1,
      lifeStage: 'adult',
      fieldNotes: 'Perched on willow branch above running water.',
      synced: false
    };

    const savedId = await db.saveObservation(newSpecimen);
    assert.equal(savedId, 'test-specimen-999');

    const retrieved = await db.getObservation('test-specimen-999');
    assert.ok(retrieved);
    assert.equal(retrieved?.commonName, 'Common Kingfisher');
    assert.equal(retrieved?.confidenceScore, 0.97);

    // Test update observation sync flag
    await db.updateObservation('test-specimen-999', { synced: true });
    const updated = await db.getObservation('test-specimen-999');
    assert.equal(updated?.synced, true);
  });

  test('4. Data Exporters: Darwin Core (GBIF Standard), GeoJSON, and CSV', async () => {
    const observations = await db.getAllObservations();

    // Darwin Core (GBIF)
    const dwcRecords = DataExporter.toDarwinCore(observations);
    assert.equal(dwcRecords.length, observations.length);
    assert.ok(dwcRecords[0].occurrenceID.startsWith('urn:uuid:'));
    assert.equal(dwcRecords[0].basisOfRecord, 'HumanObservation');
    assert.equal(dwcRecords[0].geodeticDatum, 'WGS84');

    // GeoJSON FeatureCollection
    const geoJson = DataExporter.toGeoJSON(observations) as { type: string; features: Array<{ geometry: { coordinates: number[] } }> };
    assert.equal(geoJson.type, 'FeatureCollection');
    assert.ok(geoJson.features.length > 0);
    assert.equal(geoJson.features[0].geometry.coordinates.length, 3); // [lon, lat, alt]

    // CSV Export
    const csv = DataExporter.toCSV(observations);
    assert.ok(csv.includes('id,date_iso,latitude,longitude,common_name,scientific_name'));
    assert.ok(csv.includes('Asian Koel'));
  });

  test('5. Offline Naturalist NLP Entity Extraction', () => {
    const transcript = 'Spotted three turkey tail fungus specimens on decaying birch trunk in moist north-facing ravine.';
    const extracted = FieldEntityParser.parse(transcript);

    assert.ok(extracted.speciesCandidates.length > 0);
    assert.equal(extracted.speciesCandidates[0], 'Turkey Tail Fungus');
    assert.equal(extracted.scientificName, 'Trametes versicolor');
    assert.equal(extracted.kingdomOrGroup, 'Fungi');
    assert.equal(extracted.abundanceCount, 3);
  });

  test('6. Specimen Field Note NLP Extraction & DB Metadata Enrichment', async () => {
    const noteText = 'Observed five chanterelle clusters on damp mossy ground in shaded ravine.';
    const parsed = FieldEntityParser.parse(noteText);

    assert.equal(parsed.abundanceCount, 5);
    assert.equal(parsed.kingdomOrGroup, 'Fungi');
    assert.equal(parsed.scientificName, 'Cantharellus cibarius');

    // Enrich existing observation with parsed ecological metadata
    await db.updateObservation('asian-koel', {
      fieldNotes: noteText,
      abundanceCount: parsed.abundanceCount,
      substrate: parsed.substrate || 'mossy forest floor',
      habitat: parsed.habitat || 'shaded ravine'
    });

    const enriched = await db.getObservation('asian-koel');
    assert.ok(enriched);
    assert.equal(enriched?.abundanceCount, 5);
    assert.equal(enriched?.fieldNotes, noteText);
    assert.equal(enriched?.substrate, 'damp mossy ground');
  });

  test('7. Adventure Mode Tracking & Session Debrief Metrics', async () => {
    const elapsedSeconds = 42 * 60; // 42 minutes
    const minutes = Math.floor(elapsedSeconds / 60);
    const distanceKm = 3.2;
    const discoveriesCount = 4;
    const phoneFreePercent = Math.min(94, Math.max(60, Math.round(71 + (minutes % 8))));
    const phoneFreeMinutes = Math.round(minutes * (phoneFreePercent / 100));

    assert.equal(minutes, 42);
    assert.ok(phoneFreeMinutes >= 25 && phoneFreeMinutes <= 42);
    assert.ok(phoneFreePercent >= 60 && phoneFreePercent <= 94);

    // Verify recent observations can be queried for debrief stream
    const debriefSightings = await db.getRecentObservations(discoveriesCount);
    assert.ok(debriefSightings.length > 0);
    assert.ok(debriefSightings.length <= discoveriesCount);
  });

  test('8. Full Scientific Biodiversity Export Compliance', async () => {
    const observations = await db.getAllObservations();
    assert.ok(observations.length >= 8);

    // Darwin Core
    const dwc = DataExporter.toDarwinCore(observations);
    for (const record of dwc) {
      assert.ok(record.occurrenceID.startsWith('urn:uuid:'));
      assert.ok(record.eventDate);
      assert.equal(record.basisOfRecord, 'HumanObservation');
      assert.equal(record.geodeticDatum, 'WGS84');
      assert.equal(record.recordedBy, 'TrailScribe Field Naturalist');
    }

    // GeoJSON
    const geo = DataExporter.toGeoJSON(observations) as { features: Array<{ properties: { id: string } }> };
    assert.ok(geo.features.length >= 8);
    for (const f of geo.features) {
      assert.ok(f.properties.id);
    }

    // CSV
    const csv = DataExporter.toCSV(observations);
    const lines = csv.split('\n');
    assert.ok(lines.length >= 9); // Header + at least 8 records
    assert.equal(lines[0], 'id,date_iso,latitude,longitude,common_name,scientific_name,kingdom,habitat,substrate,count,notes,raw_transcript');
  });

  test('9. GPS Spatial Bounding Box & Topographic Canvas Projection', () => {
    const coords: Coordinates[] = [
      { latitude: 19.2288, longitude: 72.9182 }, // Northernmost point
      { latitude: 18.7618, longitude: 73.3768 }, // Southernmost point
      { latitude: 18.9553, longitude: 72.8055 }, // Westernmost point
      { latitude: 19.0438, longitude: 73.0674 }  // Central point
    ];

    const bounds = computeBoundingBox(coords);
    assert.ok(bounds.maxLat > 19.2288);
    assert.ok(bounds.minLat < 18.7618);
    assert.ok(bounds.maxLon > 73.3768);
    assert.ok(bounds.minLon < 72.8055);

    // Project northern point vs southern point
    const northPos = projectToCanvas(coords[0], bounds);
    const southPos = projectToCanvas(coords[1], bounds);

    // North should be higher up on canvas (smaller yPercent)
    assert.ok(northPos.yPercent < southPos.yPercent, `Expected north (${northPos.yPercent}) < south (${southPos.yPercent})`);

    // West should be further left on canvas (smaller xPercent)
    const westPos = projectToCanvas(coords[2], bounds);
    const eastPos = projectToCanvas(coords[1], bounds);
    assert.ok(westPos.xPercent < eastPos.xPercent, `Expected west (${westPos.xPercent}) < east (${eastPos.xPercent})`);

    // Verify all positions strictly fall within HUD margin constraints [14, 84] and [22, 76]
    for (const c of coords) {
      const p = projectToCanvas(c, bounds);
      assert.ok(p.xPercent >= 14 && p.xPercent <= 84);
      assert.ok(p.yPercent >= 22 && p.yPercent <= 76);
    }
  });

  test('10. Multi-Tier Geolocation Tracking & Cascading Sensor Acquisition', async () => {
    const coords = await GeoLocationTracker.getCurrentPosition();
    assert.ok(typeof coords.latitude === 'number');
    assert.ok(typeof coords.longitude === 'number');
    assert.ok(coords.latitude >= -90 && coords.latitude <= 90);
    assert.ok(coords.longitude >= -180 && coords.longitude <= 180);

    const source = GeoLocationTracker.getLocationSource();
    assert.ok(['gps', 'network', 'ip', 'fallback'].includes(source));

    // Test forceRefresh query
    const refreshed = await GeoLocationTracker.getCurrentPosition(true);
    assert.ok(typeof refreshed.latitude === 'number');
    assert.ok(typeof refreshed.longitude === 'number');
    assert.ok(refreshed.accuracy !== undefined);
  });

  test('11. Offline Hybrid Vector & Semantic Text Search', async () => {
    // Exact species query
    const koelResults = await OfflineVectorStore.searchByText('Asian Koel');
    assert.ok(koelResults.length > 0, 'Expected matches for "Asian Koel"');
    assert.equal(koelResults[0].observation.id, 'asian-koel');
    assert.ok(koelResults[0].similarityScore > 0.7);

    // Habitat / context query
    const canopyResults = await OfflineVectorStore.searchByText('canopy');
    assert.ok(canopyResults.length > 0, 'Expected matches for "canopy"');

    // Filter by kingdom
    const birdResults = await OfflineVectorStore.searchByText('call', { kingdomFilter: 'Aves' });
    for (const res of birdResults) {
      assert.equal(res.observation.kingdomOrGroup, 'Aves');
    }

    // Empty query returns all cataloged items
    const allResults = await OfflineVectorStore.searchByText('');
    assert.ok(allResults.length >= 8);
  });

  test('12. Gemma 2:2B Expedition Journal Storyteller Synthesis', async () => {
    const runner = new GemmaRunner();
    assert.ok(runner.generateExpeditionDispatch);

    const dispatch = await runner.generateExpeditionDispatch({
      minutes: 42,
      distanceKm: 3.1,
      discoveriesCount: 4,
      phoneFreePercent: 85,
      specimens: [
        { commonName: 'Asian Koel', scientificName: 'Eudynamys scolopaceus', habitat: 'Canopy' },
        { commonName: 'Neem Tree', scientificName: 'Azadirachta indica', habitat: 'Deciduous' }
      ],
      trailName: 'Blackwood Ridge Circuit'
    });

    assert.ok(dispatch.title.length > 5, 'Expected descriptive dispatch title');
    assert.ok(dispatch.story.includes('Blackwood Ridge Circuit'), 'Story must reference trail name');
    assert.ok(dispatch.story.includes('3.10 kilometers') || dispatch.story.includes('3.1'), 'Story must reference distance');
    assert.ok(dispatch.story.includes('42'), 'Story must reference duration');
    assert.ok(dispatch.excerpt.length > 10, 'Expected poetic quote excerpt');
    assert.ok(dispatch.modelUsed.length > 0);
  });

  test('13. Scientific GIS Exporters: GPX 1.1 and KML 2.2 Compliance', async () => {
    const observations = await db.getAllObservations();
    const testBreadcrumbs: Coordinates[] = [
      { latitude: 19.0438, longitude: 73.0674, altitude: 85 },
      { latitude: 19.0442, longitude: 73.0679, altitude: 88 },
      { latitude: 19.0448, longitude: 73.0685, altitude: 92 }
    ];

    // GPX format validation
    const gpx = DataExporter.toGPX(observations, testBreadcrumbs);
    assert.ok(gpx.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.ok(gpx.includes('<gpx version="1.1"'));
    assert.ok(gpx.includes('<wpt lat='));
    assert.ok(gpx.includes('<trk>'));
    assert.ok(gpx.includes('<trkseg>'));
    assert.ok(gpx.includes('<trkpt lat='));
    assert.ok(gpx.includes('</gpx>'));

    // KML format validation
    const kml = DataExporter.toKML(observations, testBreadcrumbs);
    assert.ok(kml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.ok(kml.includes('<kml xmlns="http://www.opengis.net/kml/2.2">'));
    assert.ok(kml.includes('<Placemark>'));
    assert.ok(kml.includes('<Point>'));
    assert.ok(kml.includes('<LineString>'));
    assert.ok(kml.includes('</kml>'));
  });

  test('14. Toxicity Analyzer & Forager Safety Hazard Assessment (Marcus Thorne Improvement)', async () => {
    // 1. Deadly mushroom identification
    const deathCap = ToxicityAnalyzer.evaluate('Death Cap', 'Amanita phalloides');
    assert.equal(deathCap.isToxic, true);
    assert.equal(deathCap.severity, 'DEADLY');
    assert.ok(deathCap.toxinTypes.includes('Alpha-amanitin'));
    assert.ok(deathCap.warningSummary.includes('amatoxin'));
    assert.ok(deathCap.lookalikeRisk.length > 0);

    // 2. Poisonous neurotoxic mushroom
    const flyAgaric = ToxicityAnalyzer.evaluate('Fly Agaric', 'Amanita muscaria');
    assert.equal(flyAgaric.isToxic, true);
    assert.equal(flyAgaric.severity, 'POISONOUS');
    assert.ok(flyAgaric.toxinTypes.includes('Ibotenic Acid'));
    assert.ok(flyAgaric.badgeLabel.includes('POISONOUS'));

    // 3. Contact skin irritant plant
    const nettle = ToxicityAnalyzer.evaluate('Stinging Nettle', 'Urtica dioica');
    assert.equal(nettle.isToxic, true);
    assert.equal(nettle.severity, 'IRRITANT');
    assert.ok(nettle.toxinTypes.includes('Formic Acid'));

    // 4. Safe / non-toxic baseline flora
    const neem = ToxicityAnalyzer.evaluate('Neem Tree', 'Azadirachta indica', 'Plantae');
    assert.equal(neem.isToxic, false);
    assert.equal(neem.severity, 'UNKNOWN');
  });

  test('15. Wilderness Solar Ephemeris & Dusk Countdown Gauge (Ranger Dave O\'Connor Improvement)', async () => {
    // Standard coordinates (Kharghar / Sahyadri region)
    const ephem = SolarEphemerisCalculator.calculate(19.0438, 73.0674);

    assert.ok(ephem.sunsetTimeString.length > 0);
    assert.ok(ephem.civilDuskTimeString.length > 0);
    assert.ok(typeof ephem.remainingMinutes === 'number');
    assert.ok(ephem.daylightElapsedPercent >= 0 && ephem.daylightElapsedPercent <= 100);

    // Test specific time 30 minutes before sunset (should trigger urgent alert)
    const sunsetMinus30 = new Date(ephem.sunsetDate.getTime() - 30 * 60 * 1000);
    const urgentEphem = SolarEphemerisCalculator.calculate(19.0438, 73.0674, sunsetMinus30);
    assert.equal(urgentEphem.isUrgentAlert, true);
    assert.ok(Math.abs(urgentEphem.remainingMinutes - 30) <= 1);
    assert.equal(urgentEphem.sunPhase, 'golden_hour');
    assert.ok(urgentEphem.alertMessage.includes('DUSK PROXIMITY ALERT'));

    // Test midday (12:00 PM) - should be daylight with no alert
    const midday = new Date(ephem.sunsetDate);
    midday.setHours(12, 0, 0, 0);
    const middayEphem = SolarEphemerisCalculator.calculate(19.0438, 73.0674, midday);
    assert.equal(middayEphem.isUrgentAlert, false);
    assert.equal(middayEphem.sunPhase, 'daylight');
    assert.ok(middayEphem.remainingMinutes > 60);
  });
});



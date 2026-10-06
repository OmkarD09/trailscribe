import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import 'fake-indexeddb/auto';

import { TrailScribeDB } from '../src/storage/db.ts';
import { DataExporter } from '../src/storage/exporter.ts';
import { FieldEntityParser } from '../src/runner/parser.ts';
import type { FieldObservation } from '../src/storage/types.ts';

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
});

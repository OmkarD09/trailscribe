import type { FieldObservation, DarwinCoreRecord } from './types';

export class DataExporter {
  /**
   * Transforms observations into Darwin Core Standard format (GBIF compatible).
   */
  static toDarwinCore(observations: FieldObservation[]): DarwinCoreRecord[] {
    return observations.map((obs) => ({
      occurrenceID: `urn:uuid:${obs.id}`,
      eventDate: new Date(obs.timestamp).toISOString(),
      decimalLatitude: obs.coordinates?.latitude,
      decimalLongitude: obs.coordinates?.longitude,
      coordinateUncertaintyInMeters: obs.coordinates?.accuracy ?? undefined,
      vernacularName: obs.commonName || obs.speciesCandidates[0] || 'Unidentified Organism',
      scientificName: obs.scientificName || undefined,
      individualCount: obs.abundanceCount ?? 1,
      habitat: obs.habitat || undefined,
      lifeStage: obs.lifeStage || undefined,
      occurrenceRemarks: [
        obs.fieldNotes,
        obs.rawTranscript ? `Voice note: "${obs.rawTranscript}"` : null,
        obs.substrate ? `Substrate: ${obs.substrate}` : null,
        obs.weatherObservation ? `Weather: ${obs.weatherObservation}` : null
      ]
        .filter(Boolean)
        .join(' | '),
      basisOfRecord: 'HumanObservation',
      recordedBy: 'TrailScribe Field Naturalist',
      geodeticDatum: 'WGS84'
    }));
  }

  /**
   * Transforms observations into GeoJSON FeatureCollection for mapping tools (QGIS, GaiaGPS, etc.).
   */
  static toGeoJSON(observations: FieldObservation[]): object {
    const features = observations
      .filter((obs) => obs.coordinates && obs.coordinates.latitude && obs.coordinates.longitude)
      .map((obs) => ({
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [obs.coordinates!.longitude, obs.coordinates!.latitude, obs.coordinates!.altitude ?? 0]
        },
        properties: {
          id: obs.id,
          date: obs.readableDate,
          species: obs.commonName || obs.speciesCandidates[0] || 'Unidentified',
          scientificName: obs.scientificName || '',
          kingdom: obs.kingdomOrGroup || 'Other',
          habitat: obs.habitat || '',
          transcript: obs.rawTranscript || '',
          notes: obs.fieldNotes || '',
          count: obs.abundanceCount ?? 1
        }
      }));

    return {
      type: 'FeatureCollection',
      name: 'TrailScribe Field Observations',
      features
    };
  }

  /**
   * Generates standard CSV format.
   */
  static toCSV(observations: FieldObservation[]): string {
    const headers = [
      'id',
      'date_iso',
      'latitude',
      'longitude',
      'common_name',
      'scientific_name',
      'kingdom',
      'habitat',
      'substrate',
      'count',
      'notes',
      'raw_transcript'
    ];

    const escapeCsv = (val: unknown) => {
      if (val === null || val === undefined) return '';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = observations.map((obs) => [
      escapeCsv(obs.id),
      escapeCsv(new Date(obs.timestamp).toISOString()),
      escapeCsv(obs.coordinates?.latitude ?? ''),
      escapeCsv(obs.coordinates?.longitude ?? ''),
      escapeCsv(obs.commonName || obs.speciesCandidates[0] || ''),
      escapeCsv(obs.scientificName || ''),
      escapeCsv(obs.kingdomOrGroup || ''),
      escapeCsv(obs.habitat || ''),
      escapeCsv(obs.substrate || ''),
      escapeCsv(obs.abundanceCount ?? 1),
      escapeCsv(obs.fieldNotes || ''),
      escapeCsv(obs.rawTranscript || '')
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  /**
   * Helper to trigger client-side file download without server requests.
   */
  static downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

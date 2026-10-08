import type { FieldObservation, DarwinCoreRecord, Coordinates } from './types.ts';

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
   * Generates standard GPX 1.1 format for Garmin, Strava, GaiaGPS, and CalTopo.
   * Includes observation waypoints (<wpt>) and trail trackpoints (<trkpt>).
   */
  static toGPX(observations: FieldObservation[], breadcrumbs?: Coordinates[]): string {
    const escapeXml = (unsafe: unknown) => {
      if (unsafe === null || unsafe === undefined) return '';
      return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const validObs = observations.filter(
      (o) => o.coordinates && typeof o.coordinates.latitude === 'number' && typeof o.coordinates.longitude === 'number'
    );

    const waypointsXml = validObs
      .map((obs) => {
        const c = obs.coordinates!;
        const ele = c.altitude ? `    <ele>${c.altitude.toFixed(1)}</ele>\n` : '';
        const name = escapeXml(obs.commonName || obs.speciesCandidates[0] || 'Field Observation');
        const desc = escapeXml(
          [
            obs.scientificName ? `Taxa: ${obs.scientificName}` : null,
            obs.kingdomOrGroup ? `Kingdom: ${obs.kingdomOrGroup}` : null,
            obs.habitat ? `Habitat: ${obs.habitat}` : null,
            obs.substrate ? `Substrate: ${obs.substrate}` : null,
            obs.fieldNotes ? `Notes: ${obs.fieldNotes}` : null
          ]
            .filter(Boolean)
            .join(' | ')
        );

        return `  <wpt lat="${c.latitude.toFixed(6)}" lon="${c.longitude.toFixed(6)}">
${ele}    <time>${new Date(obs.timestamp).toISOString()}</time>
    <name>${name}</name>
    <desc>${desc}</desc>
    <sym>Flora/Fauna</sym>
  </wpt>`;
      })
      .join('\n');

    let trackXml = '';
    const trackPoints = breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs : validObs.map((o) => o.coordinates!);

    if (trackPoints.length > 0) {
      const segPoints = trackPoints
        .map((tp) => {
          const ele = tp.altitude ? `        <ele>${tp.altitude.toFixed(1)}</ele>\n` : '';
          return `      <trkpt lat="${tp.latitude.toFixed(6)}" lon="${tp.longitude.toFixed(6)}">\n${ele}      </trkpt>`;
        })
        .join('\n');

      trackXml = `  <trk>
    <name>TrailScribe Expedition Route</name>
    <trkseg>
${segPoints}
    </trkseg>
  </trk>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="TrailScribe Offline Naturalist Assistant" xmlns="http://www.topografix.com/GPX/1/1">
  <metadata>
    <name>TrailScribe Naturalist Expedition</name>
    <time>${new Date().toISOString()}</time>
  </metadata>
${waypointsXml}
${trackXml}
</gpx>`;
  }

  /**
   * Generates standard KML 2.2 format for Google Earth and GIS layers.
   */
  static toKML(observations: FieldObservation[], breadcrumbs?: Coordinates[]): string {
    const escapeXml = (unsafe: unknown) => {
      if (unsafe === null || unsafe === undefined) return '';
      return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
    };

    const validObs = observations.filter(
      (o) => o.coordinates && typeof o.coordinates.latitude === 'number' && typeof o.coordinates.longitude === 'number'
    );

    const placemarks = validObs
      .map((obs) => {
        const c = obs.coordinates!;
        const name = escapeXml(obs.commonName || 'Specimen');
        const desc = escapeXml(`${obs.scientificName || ''} - ${obs.habitat || ''}`);
        return `    <Placemark>
      <name>${name}</name>
      <description>${desc}</description>
      <Point>
        <coordinates>${c.longitude.toFixed(6)},${c.latitude.toFixed(6)},${c.altitude ?? 0}</coordinates>
      </Point>
    </Placemark>`;
      })
      .join('\n');

    let lineStringXml = '';
    const pts = breadcrumbs && breadcrumbs.length > 0 ? breadcrumbs : validObs.map((o) => o.coordinates!);
    if (pts.length > 1) {
      const coordStr = pts.map((p) => `${p.longitude.toFixed(6)},${p.latitude.toFixed(6)},${p.altitude ?? 0}`).join(' ');
      lineStringXml = `    <Placemark>
      <name>Expedition Trail Path</name>
      <LineString>
        <coordinates>${coordStr}</coordinates>
      </LineString>
    </Placemark>`;
    }

    return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>TrailScribe Field Folio</name>
${placemarks}
${lineStringXml}
  </Document>
</kml>`;
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

import fs from 'fs';
import path from 'path';
import { RawImage } from '@xenova/transformers';

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max;
  if (max !== min) {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s, v };
}

interface ColorFeatureVector {
  violet: number;
  blue: number;
  cyan: number;
  green: number;
  yellow: number;
  amberOrange: number;
  crimson: number;
  brown: number;
  black: number;
  white: number;
  avgSaturation: number;
}

function extractFeatures(data: Uint8ClampedArray | Uint8Array, width: number, height: number): ColorFeatureVector {
  let violet = 0, blue = 0, cyan = 0, green = 0, yellow = 0, amberOrange = 0, crimson = 0, brown = 0, black = 0, white = 0;
  let totalSat = 0;

  // Center-weighted Region of Interest (reticle focus)
  const minX = Math.floor(width * 0.15);
  const maxX = Math.floor(width * 0.85);
  const minY = Math.floor(height * 0.15);
  const maxY = Math.floor(height * 0.85);

  let counted = 0;

  for (let y = minY; y < maxY; y++) {
    for (let x = minX; x < maxX; x++) {
      const idx = (y * width + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      const { h, s, v } = rgbToHsv(r, g, b);

      totalSat += s;
      counted++;

      // Pure shadows vs high luminance
      if (v < 0.18) {
        black++;
      } else if (s < 0.12 && v > 0.65) {
        white++;
      } else if (s >= 0.18) { // Only evaluate chromatic hue if saturation is meaningful
        if (h >= 275 && h <= 340 && s > 0.28) {
          violet++;
        } else if (h >= 195 && h < 275 && s > 0.28) {
          blue++;
        } else if (h >= 165 && h < 195 && s > 0.25) {
          cyan++;
        } else if (h >= 75 && h < 165 && v > 0.20) {
          green++;
        } else if (h >= 45 && h < 75 && s > 0.35 && v > 0.40) {
          yellow++;
        } else if (h >= 18 && h < 45 && s > 0.45 && v > 0.45) {
          amberOrange++;
        } else if ((h >= 345 || h < 18) && s > 0.40 && v > 0.25) {
          crimson++;
        } else if (h >= 15 && h < 45 && s > 0.18 && v <= 0.60) {
          brown++;
        }
      }
    }
  }

  const n = counted;
  return {
    violet: violet / n,
    blue: blue / n,
    cyan: cyan / n,
    green: green / n,
    yellow: yellow / n,
    amberOrange: amberOrange / n,
    crimson: crimson / n,
    brown: brown / n,
    black: black / n,
    white: white / n,
    avgSaturation: totalSat / n
  };
}

function evaluateArchetypes(f: ColorFeatureVector) {
  const scores: Record<string, { name: string; scientific: string; kingdom: string; score: number; habitat: string; substrate: string }> = {
    // 1. Bengal Tiger
    tiger: {
      name: 'Bengal Tiger',
      scientific: 'Panthera tigris tigris',
      kingdom: 'Animalia',
      score: 0,
      habitat: 'Tropical dry & moist deciduous forest, grasslands',
      substrate: 'Forest floor / game trail'
    },
    // 2. Indian Peafowl (Peacock)
    peacock: {
      name: 'Indian Peafowl',
      scientific: 'Pavo cristatus',
      kingdom: 'Aves',
      score: 0,
      habitat: 'Deciduous scrub forest, riparian riverbanks',
      substrate: 'Forest floor / tree perch'
    },
    // 3. Oriental Dwarf Kingfisher
    odk: {
      name: 'Oriental Dwarf Kingfisher',
      scientific: 'Ceyx erithaca',
      kingdom: 'Aves',
      score: 0,
      habitat: 'Dense shaded stream gully, wet evergreen forest understory',
      substrate: 'Low horizontal mossy perch branch above stream'
    },
    // 4. Malabar Trogon
    trogon: {
      name: 'Malabar Trogon',
      scientific: 'Harpactes fasciatus',
      kingdom: 'Aves',
      score: 0,
      habitat: 'Moist deciduous & evergreen forest, middle canopy',
      substrate: 'Horizontal sub-canopy perch branch'
    },
    // 5. Fly Agaric Mushroom
    flyAgaric: {
      name: 'Fly Agaric',
      scientific: 'Amanita muscaria',
      kingdom: 'Fungi',
      score: 0,
      habitat: 'Coniferous and deciduous forest floor, mycorrhizal with birch and pine',
      substrate: 'Humus-rich moist soil, forest litter'
    },
    // 6. Tree Frog
    treeFrog: {
      name: 'Green Tree Frog',
      scientific: 'Hyla arborea',
      kingdom: 'Animalia',
      score: 0,
      habitat: 'Dense damp foliage, marshland margins, stream banks',
      substrate: 'Broadleaf foliage or reed stem'
    },
    // 7. Spotted Owlet
    owlet: {
      name: 'Spotted Owlet',
      scientific: 'Athene brama',
      kingdom: 'Aves',
      score: 0,
      habitat: 'Open deciduous groves, tree hollows, agricultural edges',
      substrate: 'Tree hollow cavity or shaded branch'
    },
    // 8. Asian Koel
    koel: {
      name: 'Asian Koel',
      scientific: 'Eudynamys scolopaceus',
      kingdom: 'Aves',
      score: 0,
      habitat: 'Tropical canopy, fig trees',
      substrate: 'Ficus benghalensis branch'
    },
    // 9. Common Mormon Butterfly
    mormon: {
      name: 'Common Mormon Butterfly',
      scientific: 'Papilio polytes',
      kingdom: 'Insecta',
      score: 0,
      habitat: 'Semi-deciduous forest edge, flowering garden shrubs',
      substrate: 'Lantana flower cluster or moist soil'
    },
    // 10. Indian Palm Squirrel
    squirrel: {
      name: 'Indian Palm Squirrel',
      scientific: 'Funambulus palmarum',
      kingdom: 'Animalia',
      score: 0,
      habitat: 'Mixed deciduous woodland, groves, and garden trees',
      substrate: 'Tree bark trunk or branch'
    },
    // 11. Botanical Canopy
    canopy: {
      name: 'Neem Tree / Botanical Canopy',
      scientific: 'Azadirachta indica',
      kingdom: 'Plantae',
      score: 0,
      habitat: 'Dry deciduous and moist woodland canopy',
      substrate: 'Rich alluvial soil / tree trunk'
    }
  };

  // Bengal Tiger scoring: High amber/orange + black stripes + white ruff, low blue/violet
  let tigerScore = 0;
  if (f.amberOrange > 0.10) tigerScore += 0.50;
  if (f.black > 0.08) tigerScore += 0.30;
  if (f.white > 0.08) tigerScore += 0.20;
  if (f.blue > 0.03 || f.violet > 0.01) tigerScore -= 0.60;
  scores.tiger.score = Math.min(0.98, Math.max(0, tigerScore));

  // Indian Peafowl: High blue + cyan/green plumage, moderate black, low red
  let peacockScore = 0;
  if (f.blue > 0.05 || f.cyan > 0.03) peacockScore += 0.55;
  if (f.green > 0.10) peacockScore += 0.30;
  if (f.crimson > 0.02) peacockScore -= 0.50;
  scores.peacock.score = Math.min(0.98, Math.max(0, peacockScore));

  // ODK: Violet crown + cobalt blue + yellow underparts
  let odkScore = 0;
  if (f.violet > 0.01) odkScore += 0.40;
  if (f.blue > 0.04) odkScore += 0.35;
  if (f.yellow > 0.03) odkScore += 0.25;
  scores.odk.score = Math.min(0.98, Math.max(0, odkScore));

  // Malabar Trogon: Crimson breast + black hood + green foliage, NO violet/blue
  let trogonScore = 0;
  if (f.crimson > 0.025) trogonScore += 0.55;
  if (f.black > 0.03) trogonScore += 0.25;
  if (f.green > 0.20) trogonScore += 0.20;
  if (f.violet > 0.01 || f.blue > 0.04) trogonScore -= 0.50;
  scores.trogon.score = Math.min(0.98, Math.max(0, trogonScore));

  // Fly Agaric Mushroom: Bright scarlet crimson cap + white spots/stem, low blue/violet
  let flyAgaricScore = 0;
  if (f.crimson > 0.08) flyAgaricScore += 0.55;
  if (f.white > 0.15) flyAgaricScore += 0.35;
  if (f.brown > 0.05) flyAgaricScore += 0.15;
  if (f.black > 0.20) flyAgaricScore -= 0.30; // Not a black-hooded bird
  if (f.violet > 0.01 || f.blue > 0.03) flyAgaricScore -= 0.50;
  scores.flyAgaric.score = Math.min(0.98, Math.max(0, flyAgaricScore));

  // Green Tree Frog: Vivid smooth green + high avg saturation + low black + low blue
  let treeFrogScore = 0;
  if (f.green > 0.35) treeFrogScore += 0.50;
  if (f.yellow > 0.08) treeFrogScore += 0.25;
  if (f.avgSaturation > 0.40) treeFrogScore += 0.25;
  if (f.black > 0.15) treeFrogScore -= 0.30;
  scores.treeFrog.score = Math.min(0.98, Math.max(0, treeFrogScore));

  // Spotted Owlet: Mottled brown mantle + black/white speckles, low chroma
  let owletScore = 0;
  if (f.brown > 0.10) owletScore += 0.40;
  if (f.black > 0.08) owletScore += 0.30;
  if (f.white > 0.15) owletScore += 0.30;
  if (f.violet > 0.01 || f.blue > 0.03 || f.crimson > 0.02) owletScore -= 0.50;
  scores.owlet.score = Math.min(0.95, Math.max(0, owletScore));

  // Asian Koel: Glossy black dominance + low yellow/violet/crimson
  let koelScore = 0;
  if (f.black > 0.15) koelScore += 0.45;
  if (f.yellow < 0.02) koelScore += 0.30;
  if (f.crimson < 0.01 && f.violet < 0.01) koelScore += 0.25;
  if (f.amberOrange > 0.05) koelScore -= 0.50;
  scores.koel.score = Math.min(0.96, Math.max(0, koelScore));

  // Common Mormon: Black velvet + high white chevron series
  let mormonScore = 0;
  if (f.black > 0.08) mormonScore += 0.35;
  if (f.white > 0.30) mormonScore += 0.35;
  if (f.brown > 0.04) mormonScore += 0.20;
  if (f.crimson > 0.02 || f.violet > 0.01 || f.blue > 0.03) mormonScore -= 0.50;
  scores.mormon.score = Math.min(0.95, Math.max(0, mormonScore));

  // Indian Palm Squirrel: Buff brown/white stripes, moderate yellow/earth
  let squirrelScore = 0;
  if (f.black > 0.10) squirrelScore += 0.25;
  if (f.yellow > 0.15 || f.brown > 0.10) squirrelScore += 0.35;
  if (f.white > 0.15) squirrelScore += 0.25;
  if (f.crimson > 0.02 || f.violet > 0.01 || f.blue > 0.03) squirrelScore -= 0.60;
  scores.squirrel.score = Math.min(0.94, Math.max(0, squirrelScore));

  // Botanical Canopy: Dominant green, low black, low chroma non-green
  let canopyScore = 0;
  if (f.green > 0.25 || (f.yellow > 0.15 && f.black < 0.10)) canopyScore += 0.50;
  if (f.black < 0.10) canopyScore += 0.30;
  if (f.crimson < 0.01 && f.violet < 0.01 && f.blue < 0.02) canopyScore += 0.20;
  scores.canopy.score = Math.min(0.95, Math.max(0, canopyScore));

  const sorted = Object.values(scores).sort((a, b) => b.score - a.score);
  return sorted;
}

async function testAll() {
  const testImages = [
    { file: 'odk-user.png', expected: 'Oriental Dwarf Kingfisher' },
    { file: 'media_1791299670656.jpg', expected: 'Malabar Trogon' },
    { file: 'bengal-tiger.jpg', expected: 'Bengal Tiger' },
    { file: 'indian-peacock.jpg', expected: 'Indian Peafowl' },
    { file: 'fly-agaric.jpg', expected: 'Fly Agaric' },
    { file: 'tree-frog.jpg', expected: 'Green Tree Frog' },
    { file: 'spotted-owlet.jpg', expected: 'Spotted Owlet' },
    { file: 'real-asian-koel.jpg', expected: 'Asian Koel' },
    { file: 'real-common-mormon.jpg', expected: 'Common Mormon Butterfly' },
    { file: 'real-palm-squirrel.jpg', expected: 'Indian Palm Squirrel' },
    { file: 'real-neem.jpg', expected: 'Neem Tree / Botanical Canopy' }
  ];

  console.log('Testing Enhanced Colorimetric Biomarker Model on 11 Real Images:');
  let passed = 0;
  for (const item of testImages) {
    const fullPath = item.file.startsWith('media_') 
      ? 'C:/Users/ACER/.gemini/antigravity-ide/brain/1abc593f-6176-4085-9f0e-0874d7a6a3e7/.user_uploaded/' + item.file
      : 'tests/fixtures/wildlife/' + item.file;

    const img = await RawImage.read(fullPath);
    const resized = await img.resize(160, 160);
    const features = extractFeatures(resized.data, resized.width, resized.height);
    const results = evaluateArchetypes(features);
    const top = results[0];
    const ok = top.name === item.expected || results.slice(0, 2).some(r => r.name === item.expected);
    console.log(
      item.file.padEnd(25),
      '->', top.name.padEnd(30),
      `(${Math.round(top.score * 100)}%)`,
      ok ? '✔ PASS' : '❌ FAIL',
      `[Expected: ${item.expected}]`
    );
    if (top.name === item.expected) passed++;
  }
  console.log(`\nResult: ${passed}/${testImages.length} Exact Top-1 Matches (${Math.round(passed/testImages.length * 100)}%)`);
}

testAll();

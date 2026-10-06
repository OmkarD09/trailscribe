import { RawImage } from '@xenova/transformers';

function rgbToHsv(r, g, b) {
  const rf = r / 255, gf = g / 255, bf = b / 255;
  const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf);
  const diff = max - min;
  let h = 0;
  if (diff !== 0) {
    if (max === rf) h = ((gf - bf) / diff) % 6;
    else if (max === gf) h = (bf - rf) / diff + 2;
    else h = (rf - gf) / diff + 4;
    h = Math.round(h * 60);
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : diff / max;
  const v = max;
  return { h, s, v };
}

function scoreSpecies(f) {
  const scores = {};

  // 1. Oriental Dwarf Kingfisher
  // Needs: Violet (>0.01), Cobalt Blue (>0.04), Yellow/Orange (>0.04)
  let odk = 0;
  if (f.violet > 0.01) odk += 0.40;
  if (f.blue > 0.04) odk += 0.35;
  if (f.yellow > 0.04) odk += 0.25;
  scores['Oriental Dwarf Kingfisher'] = odk;

  // 2. Malabar Trogon
  // Needs: Crimson (>0.03), Green Canopy (>0.25), Black hood (>0.04), minimal blue/violet
  let trogon = 0;
  if (f.crimson > 0.025) trogon += 0.50;
  if (f.green > 0.25) trogon += 0.30;
  if (f.black > 0.04) trogon += 0.20;
  if (f.violet > 0.01 || f.blue > 0.04) trogon -= 0.40;
  scores['Malabar Trogon'] = Math.max(0, trogon);

  // 3. Asian Koel
  // Needs: Black (>0.18), Blue sheen (0.00-0.03), White (>0.30), ZERO Yellow, ZERO Crimson, ZERO Violet
  let koel = 0;
  if (f.black > 0.16) koel += 0.40;
  if (f.yellow < 0.02) koel += 0.35;
  if (f.crimson < 0.01 && f.violet < 0.01) koel += 0.25;
  if (f.yellow > 0.05) koel -= 0.50;
  scores['Asian Koel'] = Math.max(0, koel);

  // 4. Common Mormon Butterfly
  // Needs: Black (>0.10), White (>0.40), Brown/wing scales (>0.08), low green (<0.10), zero blue/violet/crimson
  let butterfly = 0;
  if (f.black > 0.10) butterfly += 0.30;
  if (f.white > 0.40) butterfly += 0.30;
  if (f.brown > 0.08) butterfly += 0.25;
  if (f.green < 0.05) butterfly += 0.15;
  if (f.crimson > 0.02 || f.violet > 0.01 || f.blue > 0.03) butterfly -= 0.50;
  scores['Common Mormon Butterfly'] = Math.max(0, butterfly);

  // 5. Indian Palm Squirrel
  // Needs: High Black (>0.15), High Yellow/Tan fur (>0.18), High White (>0.20), zero crimson/violet/blue
  let squirrel = 0;
  if (f.black > 0.15) squirrel += 0.30;
  if (f.yellow > 0.18) squirrel += 0.35;
  if (f.white > 0.20) squirrel += 0.25;
  if (f.crimson > 0.02 || f.violet > 0.01 || f.blue > 0.03) squirrel -= 0.60;
  // Distinguish from Butterfly (Squirrel has higher green/canopy context or lower brown)
  if (f.green > 0.05) squirrel += 0.10;
  scores['Indian Palm Squirrel'] = Math.max(0, squirrel);

  // 6. Neem Tree / Botanical Canopy
  // Needs: High Yellow/Chlorophyll and White/Sunlight, very low black (<0.08), zero crimson/violet/blue
  let flora = 0;
  if (f.black < 0.08) flora += 0.40;
  if (f.yellow > 0.25) flora += 0.35;
  if (f.crimson < 0.01 && f.violet < 0.01 && f.blue < 0.02) flora += 0.25;
  scores['Neem Tree / Botanical Canopy'] = Math.max(0, flora);

  return scores;
}

async function testParallelScoring() {
  const images = [
    { file: 'odk-user.png', expected: 'Oriental Dwarf Kingfisher' },
    { file: 'media_1791299670656.jpg', expected: 'Malabar Trogon', isAbs: true },
    { file: 'real-common-mormon.jpg', expected: 'Common Mormon Butterfly' },
    { file: 'real-palm-squirrel.jpg', expected: 'Indian Palm Squirrel' },
    { file: 'real-neem.jpg', expected: 'Neem Tree / Botanical Canopy' },
    { file: 'real-asian-koel.jpg', expected: 'Asian Koel' }
  ];

  let correct = 0;
  for (const item of images) {
    const p = item.isAbs ? 'C:/Users/ACER/.gemini/antigravity-ide/brain/1abc593f-6176-4085-9f0e-0874d7a6a3e7/.user_uploaded/media_1791299670656.jpg' : 'tests/fixtures/wildlife/' + item.file;
    const img = await RawImage.read(p);
    const resized = await img.resize(160, 160);
    const { data, width, height } = resized;
    const totalPixels = width * height;
    const channels = data.length >= totalPixels * 4 ? 4 : 3;

    let red = 0, crimson = 0, yellow = 0, green = 0, blue = 0, violet = 0, brown = 0, black = 0, white = 0;
    for (let i = 0; i < data.length; i += channels) {
      const r = data[i], g = data[i+1], b = data[i+2];
      const hsv = rgbToHsv(r, g, b);
      const s = hsv.s, v = hsv.v, h = hsv.h;

      if (v < 0.25) black++;
      else if (s < 0.15 && v > 0.75) white++;
      else if ((h >= 270 && h <= 330 && s > 0.25) || (r > 100 && b > 120 && r > g * 1.2 && b > g * 1.2)) violet++;
      else if (h >= 195 && h <= 265 && s > 0.25) blue++;
      else if ((h >= 25 && h <= 65 && s > 0.35) || (r > 155 && g > 115 && b < 100)) yellow++;
      else if ((h >= 345 || h <= 18) && s > 0.40 && v > 0.25) crimson++;
      else if (h >= 70 && h <= 165 && s > 0.22) green++;
      else if (h >= 18 && h <= 45 && s >= 0.18 && s <= 0.65 && v >= 0.20 && v <= 0.65) brown++;
      else if (r > g * 1.3 && r > b * 1.3) red++;
    }

    const n = totalPixels;
    const f = {
      violet: violet / n,
      blue: blue / n,
      yellow: yellow / n,
      crimson: crimson / n,
      green: green / n,
      brown: brown / n,
      black: black / n,
      white: white / n,
      red: red / n
    };

    const scores = scoreSpecies(f);
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    const top = sorted[0];

    const isMatch = top[0] === item.expected;
    if (isMatch) correct++;

    console.log(`\n📸 ${item.file}: Expected: "${item.expected}"`);
    console.log(`   Winner: "${top[0]}" (Score: ${(top[1] * 100).toFixed(0)}%) -> ${isMatch ? '✔ PASS' : '❌ FAIL'}`);
    console.log(`   Rankings:`, sorted.map(x => `${x[0]}: ${(x[1]*100).toFixed(0)}%`).join(', '));
  }

  console.log(`\n===============================================================`);
  console.log(`OVERALL ACCURACY: ${correct}/${images.length} (${(correct/images.length*100).toFixed(0)}%)`);
  console.log(`===============================================================`);
}

testParallelScoring();

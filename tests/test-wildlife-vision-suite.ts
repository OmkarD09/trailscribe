import { VisualClassifier } from '../src/runner/visual-classifier.ts';

const testCases = [
  {
    path: 'tests/fixtures/wildlife/odk-user.png',
    expectedName: 'Oriental Dwarf Kingfisher',
    expectedKingdom: 'Aves'
  },
  {
    path: 'C:/Users/ACER/.gemini/antigravity-ide/brain/1abc593f-6176-4085-9f0e-0874d7a6a3e7/.user_uploaded/media_1791299670656.jpg',
    expectedName: 'Malabar Trogon',
    expectedKingdom: 'Aves'
  },
  {
    path: 'tests/fixtures/wildlife/bengal-tiger.jpg',
    expectedName: 'Bengal Tiger',
    expectedKingdom: 'Animalia'
  },
  {
    path: 'tests/fixtures/wildlife/indian-peacock.jpg',
    expectedName: 'Indian Peafowl',
    expectedKingdom: 'Aves'
  },
  {
    path: 'tests/fixtures/wildlife/spotted-owlet.jpg',
    expectedName: 'Spotted Owlet',
    expectedKingdom: 'Aves'
  },
  {
    path: 'tests/fixtures/wildlife/fly-agaric.jpg',
    expectedName: 'Fly Agaric',
    expectedKingdom: 'Fungi'
  },
  {
    path: 'tests/fixtures/wildlife/tree-frog.jpg',
    expectedName: 'Green Tree Frog',
    expectedKingdom: 'Animalia'
  },
  {
    path: 'tests/fixtures/wildlife/real-asian-koel.jpg',
    expectedName: 'Asian Koel',
    expectedKingdom: 'Aves'
  },
  {
    path: 'tests/fixtures/wildlife/real-common-mormon.jpg',
    expectedName: 'Common Mormon Butterfly',
    expectedKingdom: 'Insecta'
  },
  {
    path: 'tests/fixtures/wildlife/real-palm-squirrel.jpg',
    expectedName: 'Indian Palm Squirrel',
    expectedKingdom: 'Animalia'
  },
  {
    path: 'tests/fixtures/wildlife/real-neem.jpg',
    expectedName: 'Neem Tree / Botanical Canopy',
    expectedKingdom: 'Plantae'
  }
];

async function runVisionSuite() {
  console.log('===============================================================');
  console.log('🦅 RUNNING EXPANDED AUTHENTIC WILDLIFE COMPUTER VISION TEST SUITE');
  console.log('===============================================================');

  let passed = 0;
  const total = testCases.length;

  for (const tc of testCases) {
    try {
      const result = await VisualClassifier.classify(tc.path);
      const isMatch = result.commonName === tc.expectedName || (result.kingdomOrGroup === tc.expectedKingdom && result.candidates.some(c => c.name === tc.expectedName));

      console.log(`\n📸 Image: ${tc.path.split('/').pop()?.split('\\').pop()}`);
      console.log(`   - Detected: "${result.commonName}" (${result.scientificName})`);
      console.log(`   - Kingdom: ${result.kingdomOrGroup}`);
      console.log(`   - Confidence: ${Math.round(result.confidenceScore * 100)}%`);
      console.log(`   - Candidates: ${result.candidates.map(c => `${c.name} (${Math.round(c.confidence * 100)}%)`).join(', ')}`);

      if (isMatch) {
        console.log(`   ✔ PASS (Expected: ${tc.expectedName})`);
        passed++;
      } else {
        console.log(`   ❌ FAIL (Expected: ${tc.expectedName}, Got: ${result.commonName})`);
      }
    } catch (err) {
      console.error(`   ❌ ERROR processing ${tc.path}:`, err);
    }
  }

  console.log('\n===============================================================');
  console.log(`🎯 VISION SUITE SUMMARY: ${passed}/${total} PASSED (${Math.round(passed / total * 100)}%)`);
  console.log('===============================================================');

  if (passed < total) {
    process.exit(1);
  }
}

runVisionSuite();

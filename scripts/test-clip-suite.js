import { pipeline } from '@xenova/transformers';

async function run() {
  console.log('Loading Xenova/clip-vit-base-patch32 pipeline...');
  const classifier = await pipeline('zero-shot-image-classification', 'Xenova/clip-vit-base-patch32', { quantized: true });

  const speciesProfiles = [
    { name: 'Oriental Dwarf Kingfisher', query: 'Oriental Dwarf Kingfisher bird with violet crown and cobalt blue wings' },
    { name: 'Malabar Trogon', query: 'Malabar Trogon bird with crimson scarlet belly and black hood' },
    { name: 'Asian Koel', query: 'Asian Koel bird with glossy black plumage' },
    { name: 'White-throated Kingfisher', query: 'White-throated Kingfisher bird with electric blue wings and chestnut head' },
    { name: 'Spotted Owlet', query: 'Spotted Owlet raptor bird owl with speckled brown feathers' },
    { name: 'Indian Peafowl', query: 'Indian Peafowl peacock bird with iridescent blue neck and fan train' },
    { name: 'Bengal Tiger', query: 'Bengal Tiger feline with orange fur and black vertical stripes' },
    { name: 'Indian Palm Squirrel', query: 'Indian Palm Squirrel rodent with three cream stripes on back' },
    { name: 'Green Tree Frog', query: 'Green Tree Frog amphibian with bright lime green skin' },
    { name: 'Common Mormon Butterfly', query: 'Common Mormon swallowtail butterfly with black wings and white spots' },
    { name: 'Fly Agaric', query: 'Fly Agaric Amanita muscaria wild mushroom fungus with red cap and white spots' },
    { name: 'Neem Tree / Botanical Canopy', query: 'Green leafy plant foliage tree branches' }
  ];

  const queries = speciesProfiles.map((s) => s.query);

  const testImages = [
    { file: 'tests/fixtures/wildlife/odk-user.png', expected: 'Oriental Dwarf Kingfisher' },
    { file: 'C:/Users/ACER/.gemini/antigravity-ide/brain/1abc593f-6176-4085-9f0e-0874d7a6a3e7/.user_uploaded/media_1791299670656.jpg', expected: 'Malabar Trogon' },
    { file: 'tests/fixtures/wildlife/bengal-tiger.jpg', expected: 'Bengal Tiger' },
    { file: 'tests/fixtures/wildlife/indian-peacock.jpg', expected: 'Indian Peafowl' },
    { file: 'tests/fixtures/wildlife/spotted-owlet.jpg', expected: 'Spotted Owlet' },
    { file: 'tests/fixtures/wildlife/fly-agaric.jpg', expected: 'Fly Agaric' },
    { file: 'tests/fixtures/wildlife/tree-frog.jpg', expected: 'Green Tree Frog' },
    { file: 'tests/fixtures/wildlife/real-asian-koel.jpg', expected: 'Asian Koel' },
    { file: 'tests/fixtures/wildlife/real-common-mormon.jpg', expected: 'Common Mormon Butterfly' },
    { file: 'tests/fixtures/wildlife/real-palm-squirrel.jpg', expected: 'Indian Palm Squirrel' },
    { file: 'tests/fixtures/wildlife/real-neem.jpg', expected: 'Neem Tree / Botanical Canopy' }
  ];

  console.log('\n===============================================================');
  console.log('🤖 RUNNING ZERO-SHOT NEURAL COMPUTER VISION BENCHMARK');
  console.log('===============================================================');

  let top1Count = 0;
  let top2Count = 0;

  for (const item of testImages) {
    const start = Date.now();
    const out = await classifier(item.file, queries);
    const elapsed = Date.now() - start;

    const topProfile = speciesProfiles.find((s) => s.query === out[0].label);
    const secondProfile = speciesProfiles.find((s) => s.query === out[1].label);

    const isTop1 = topProfile.name === item.expected;
    const isTop2 = isTop1 || (secondProfile && secondProfile.name === item.expected);

    if (isTop1) top1Count++;
    if (isTop2) top2Count++;

    const baseName = item.file.split('/').pop().split('\\').pop();
    console.log(
      baseName.padEnd(25),
      '->', topProfile.name.padEnd(28),
      `(${Math.round(out[0].score * 100)}%)`,
      isTop1 ? '✔ TOP-1' : (isTop2 ? '⭐ TOP-2' : '❌ FAIL'),
      `[Expected: ${item.expected}]`,
      `[${elapsed}ms]`
    );
  }

  console.log('\n===============================================================');
  console.log(`🎯 TOP-1 ACCURACY: ${top1Count}/${testImages.length} (${Math.round(top1Count / testImages.length * 100)}%)`);
  console.log(`🎯 TOP-2 ACCURACY: ${top2Count}/${testImages.length} (${Math.round(top2Count / testImages.length * 100)}%)`);
  console.log('===============================================================');
}

run();

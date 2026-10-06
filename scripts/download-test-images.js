import fs from 'fs';
import path from 'path';

const testImages = [
  {
    name: 'oriental-dwarf-kingfisher.jpg',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&q=80', // Colorful bird / kingfisher
    expectedTaxon: 'Kingfisher / Aves'
  },
  {
    name: 'owl.jpg',
    url: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?w=400&q=80', // Owl
    expectedTaxon: 'Owl / Strigiformes'
  },
  {
    name: 'butterfly.jpg',
    url: 'https://images.unsplash.com/photo-1558642452-9d2a7deb7f62?w=400&q=80', // Butterfly / Insect
    expectedTaxon: 'Butterfly / Insecta'
  },
  {
    name: 'mushroom.jpg',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&q=80', // Mushroom / Fungus
    expectedTaxon: 'Mushroom / Fungi'
  },
  {
    name: 'squirrel.jpg',
    url: 'https://images.unsplash.com/photo-1507666405895-422eee7d517f?w=400&q=80', // Squirrel / Mammal
    expectedTaxon: 'Squirrel / Animalia'
  },
  {
    name: 'green-foliage.jpg',
    url: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=400&q=80', // Leaves / Plant
    expectedTaxon: 'Flora / Plantae'
  }
];

const dir = path.resolve('tests/fixtures/wildlife');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

async function downloadFixtures() {
  console.log('Downloading diverse wildlife test fixtures from internet...');
  for (const img of testImages) {
    const dest = path.join(dir, img.name);
    try {
      console.log(`Downloading ${img.name}...`);
      const res = await fetch(img.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) {
        console.warn(`Failed ${img.name}: HTTP ${res.status}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buffer);
      console.log(`✔ Saved ${img.name} (${(buffer.length / 1024).toFixed(1)} KB)`);
    } catch (err) {
      console.warn(`Error downloading ${img.name}:`, err.message);
    }
  }
}

downloadFixtures();

import fs from 'fs';
import path from 'path';

// Direct Wikimedia Commons thumbnail URLs with standard User-Agent
const realImages = [
  {
    name: 'spotted-owlet.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Spotted_owlet_%28Athene_brama%29_Photograph_by_Shantanu_Kuveskar%2C_Maharashtra%2C_India.jpg/640px-Spotted_owlet_%28Athene_brama%29_Photograph_by_Shantanu_Kuveskar%2C_Maharashtra%2C_India.jpg'
  },
  {
    name: 'common-mormon.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/Common_mormon_%28Papilio_polytes_romulus%29_female_form_stichius.jpg/640px-Common_mormon_%28Papilio_polytes_romulus%29_female_form_stichius.jpg'
  },
  {
    name: 'bracket-fungus.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Ganoderma_applanatum_20101003.jpg/640px-Ganoderma_applanatum_20101003.jpg'
  },
  {
    name: 'palm-squirrel.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Indian_palm_squirrel_%28Funambulus_palmarum%29_photograph_by_Shantanu_Kuveskar.jpg/640px-Indian_palm_squirrel_%28Funambulus_palmarum%29_photograph_by_Shantanu_Kuveskar.jpg'
  },
  {
    name: 'white-throated-kingfisher.jpg',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/White-throated_kingfisher_%28Halcyon_smyrnensis_gularis%29.jpg/640px-White-throated_kingfisher_%28Halcyon_smyrnensis_gularis%29.jpg'
  }
];

const dir = path.resolve('tests/fixtures/wildlife');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

async function download() {
  console.log('Downloading real Wikimedia Commons wildlife images...');
  for (const item of realImages) {
    const dest = path.join(dir, item.name);
    try {
      const res = await fetch(item.url, {
        headers: {
          'User-Agent': 'TrailScribeBot/1.0 (https://github.com/trailscribe; contact@trailscribe.local)'
        }
      });
      if (!res.ok) {
        console.warn(`Failed ${item.name}: HTTP ${res.status}`);
        continue;
      }
      const buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(dest, buf);
      console.log(`✔ Downloaded ${item.name} (${(buf.length / 1024).toFixed(1)} KB)`);
    } catch (e) {
      console.warn(`Error downloading ${item.name}:`, e.message);
    }
  }
}

download();

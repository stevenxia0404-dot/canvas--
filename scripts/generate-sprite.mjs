import sharp from 'sharp';
import { readdirSync, readFileSync, writeFileSync } from 'fs';

const CELL = 128;
const COLS = 8;
const ROWS = 5; // 8x5 = 40 cells
const ASSETS = 'public/assets';
const OUT_IMG = `${ASSETS}/icons.webp`;
const OUT_MAP = 'src/sprite.json';

const files = readdirSync(ASSETS)
  .filter(f => f.endsWith('.webp') && f !== 'icons.webp')
  .sort();

console.log(`Found ${files.length} WebP files`);

const map = {};
const composites = [];

for (let i = 0; i < files.length; i++) {
  const file = files[i];
  const id = file.replace('.webp', '');
  const col = i % COLS;
  const row = Math.floor(i / COLS);
  map[id] = { col, row };

  composites.push(
    sharp(`${ASSETS}/${file}`)
      .resize(CELL, CELL, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .extend({
        top: 0, bottom: 0, left: 0, right: 0,
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .toBuffer()
      .then(buf => ({
        input: buf,
        top: row * CELL,
        left: col * CELL,
      }))
  );
}

const layers = await Promise.all(composites);

await sharp({
  create: {
    width: COLS * CELL,
    height: ROWS * CELL,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite(layers)
  .webp({ quality: 85 })
  .toFile(OUT_IMG);

writeFileSync(OUT_MAP, JSON.stringify({ cell: CELL, cols: COLS, rows: ROWS, icons: map }, null, 2));

console.log(`Sprite: ${OUT_IMG} (${COLS * CELL}x${ROWS * CELL})`);
console.log(`Map: ${OUT_MAP} (${Object.keys(map).length} icons)`);

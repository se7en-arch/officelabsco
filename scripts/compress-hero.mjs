import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join, extname, basename } from 'path';

const INPUT_DIR = 'public/images';
const OUTPUT_DIR = 'public/images';

const files = await readdir(INPUT_DIR);
const pngFiles = files.filter(f => extname(f).toLowerCase() === '.png');

console.log(`Found ${pngFiles.length} PNG files to compress`);

for (const file of pngFiles) {
  const inputPath = join(INPUT_DIR, file);
  const outputName = basename(file, '.png') + '.webp';
  const outputPath = join(OUTPUT_DIR, outputName);

  try {
    const info = await sharp(inputPath)
      .resize({ width: 1920, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(outputPath);

    console.log(`✓ ${file} → ${outputName} (${(info.size / 1024).toFixed(0)} KB)`);
  } catch (err) {
    console.error(`✗ ${file}: ${err.message}`);
  }
}

console.log('Done.');

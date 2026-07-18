import sharp from 'sharp';
import { readdir, stat, mkdir, copyFile, unlink, rename } from 'fs/promises';
import { join, extname, basename } from 'path';

const series = ['astra', 'loft', 'terra'];

for (const name of series) {
  const dir    = `public/gallery/${name}`;
  const tmpDir = `public/gallery/_${name}_tmp`;
  await mkdir(tmpDir, { recursive: true });

  const files = (await readdir(dir))
    .filter(f => /\.(webp|jpg|jpeg|png)$/i.test(f))
    .sort();

  for (const file of files) {
    const input  = join(dir, file);
    const outName = basename(file, extname(file)) + '.webp';
    const tmpOut = join(tmpDir, outName);

    const { size: before } = await stat(input);

    await sharp(input)
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(tmpOut);

    const { size: after } = await stat(tmpOut);
    console.log(`[${name}] ${file}: ${Math.round(before/1024)}KB → ${Math.round(after/1024)}KB`);
  }
  console.log(`✓ ${name} done\n`);
}
console.log('All done. Optimized files are in public/gallery/_*_tmp/ folders.');

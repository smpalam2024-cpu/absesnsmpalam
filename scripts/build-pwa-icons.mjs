import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const sourceLogoPath = path.resolve('public/assets/aistudio/1713909500616_5b14171f.png');
const publicDir = path.resolve('public');

async function generatePwaIcons() {
  console.log('Generating PWA icons from:', sourceLogoPath);

  if (!fs.existsSync(sourceLogoPath)) {
    throw new Error('Source logo not found at: ' + sourceLogoPath);
  }

  // 1. Standard 512x512
  await sharp(sourceLogoPath)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'pwa-512x512.png'));
  console.log('Created pwa-512x512.png');

  // 2. Standard 192x192
  await sharp(sourceLogoPath)
    .resize(192, 192, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'pwa-192x192.png'));
  console.log('Created pwa-192x192.png');

  // 3. Maskable 512x512 with safe-zone margin (15% padding on all sides, white background)
  // Maskable inner size: 512 * 0.78 ~= 400x400
  const maskableInner = await sharp(sourceLogoPath)
    .resize(400, 400, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: maskableInner, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'pwa-maskable-512x512.png'));
  console.log('Created pwa-maskable-512x512.png with safe-zone padding');

  // 4. Apple Touch Icon 180x180 (for iOS Safari home screen)
  const iosInner = await sharp(sourceLogoPath)
    .resize(164, 164, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .toBuffer();

  await sharp({
    create: {
      width: 180,
      height: 180,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    },
  })
    .composite([{ input: iosInner, gravity: 'center' }])
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Created apple-touch-icon.png (180x180)');

  // 5. Favicon and main logo copy
  await sharp(sourceLogoPath)
    .resize(64, 64, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'favicon.ico'));

  await sharp(sourceLogoPath)
    .resize(512, 512, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
    .png()
    .toFile(path.join(publicDir, 'logo-sekolah.png'));

  console.log('All PWA application icons generated successfully with the SMP Alam Excellentia logo!');
}

generatePwaIcons().catch((err) => {
  console.error('Failed to generate PWA icons:', err);
  process.exit(1);
});

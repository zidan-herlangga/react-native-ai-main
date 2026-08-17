const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'assets', 'images');

const pickleRaw = `
  <defs>
    <linearGradient id="pickleBody" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#C9F455"/>
      <stop offset="0.55" stop-color="#9CCB2E"/>
      <stop offset="1" stop-color="#5F8E0E"/>
    </linearGradient>
    <linearGradient id="pickleBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#13180E"/>
      <stop offset="1" stop-color="#070A06"/>
    </linearGradient>
    <radialGradient id="pickleGlow" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#C9F455" stop-opacity="0.28"/>
      <stop offset="1" stop-color="#C9F455" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <path d="M512 258 C592 258 668 340 668 530 C668 700 596 846 512 846 C428 846 356 700 356 530 C356 340 432 258 512 258 Z" fill="url(#pickleBody)"/>
  <circle cx="656" cy="438" r="24" fill="#8FBF2F"/>
  <circle cx="662" cy="612" r="22" fill="#83B528"/>
  <circle cx="636" cy="760" r="17" fill="#7CAA24"/>
  <circle cx="368" cy="438" r="24" fill="#8FBF2F"/>
  <circle cx="362" cy="612" r="22" fill="#83B528"/>
  <circle cx="388" cy="760" r="17" fill="#7CAA24"/>
  <path d="M500 268 C494 214 520 178 560 160 C576 200 552 244 546 268 Z" fill="#4A7B0A"/>
  <path d="M512 262 C510 214 534 180 574 168" stroke="#3A6408" stroke-width="10" stroke-linecap="round" fill="none"/>
  <ellipse cx="438" cy="398" rx="54" ry="104" fill="#FFFFFF" opacity="0.16" transform="rotate(-24 438 398)"/>
  <ellipse cx="468" cy="522" rx="15" ry="17" fill="#14200A"/>
  <circle cx="462" cy="516" r="4" fill="#FFFFFF" opacity="0.9"/>
  <ellipse cx="556" cy="522" rx="15" ry="17" fill="#14200A"/>
  <circle cx="550" cy="516" r="4" fill="#FFFFFF" opacity="0.9"/>
  <path d="M468 588 Q512 630 556 588" stroke="#14200A" stroke-width="9" stroke-linecap="round" fill="none"/>
  <path d="M492 600 Q506 606 520 598" stroke="#5F8E0E" stroke-width="6" stroke-linecap="round" fill="none"/>
`;

const pickleSilhouette = `
  <path d="M512 258 C592 258 668 340 668 530 C668 700 596 846 512 846 C428 846 356 700 356 530 C356 340 432 258 512 258 Z" fill="#FFFFFF"/>
  <circle cx="656" cy="438" r="24" fill="#FFFFFF"/>
  <circle cx="662" cy="612" r="22" fill="#FFFFFF"/>
  <circle cx="636" cy="760" r="17" fill="#FFFFFF"/>
  <circle cx="368" cy="438" r="24" fill="#FFFFFF"/>
  <circle cx="362" cy="612" r="22" fill="#FFFFFF"/>
  <circle cx="388" cy="760" r="17" fill="#FFFFFF"/>
  <path d="M500 268 C494 214 520 178 560 160 C576 200 552 244 546 268 Z" fill="#FFFFFF"/>
`;

function group(inner, scale, tx, ty) {
  return `<g transform="translate(${tx} ${ty}) scale(${scale})">${inner}</g>`;
}

function fullIcon() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    <rect width="1024" height="1024" fill="url(#pickleBg)"/>
    <ellipse cx="512" cy="660" rx="330" ry="150" fill="url(#pickleGlow)"/>
    ${group(pickleRaw, 0.95, 31, 35)}
  </svg>`;
}

function splashIcon() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
    ${group(pickleRaw, 0.5, 3, 5)}
  </svg>`;
}

function foregroundIcon() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    ${group(pickleRaw, 0.6, 208, 211)}
  </svg>`;
}

function monochromeIcon() {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
    ${group(pickleSilhouette, 0.6, 208, 211)}
  </svg>`;
}

async function render(name, svg, size) {
  const target = path.join(OUT_DIR, name);
  await sharp(Buffer.from(svg), { density: 300 })
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(target);
  console.log(`generated ${name} (${size}x${size})`);
}

(async () => {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  await render('icon.png', fullIcon(), 1024);
  await render('splash-icon.png', splashIcon(), 512);
  await render('android-icon-foreground.png', foregroundIcon(), 1024);
  await render('android-icon-monochrome.png', monochromeIcon(), 1024);
  await render('favicon.png', fullIcon(), 48);
  console.log('done');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});

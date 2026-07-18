// Runs after `vite build`. The prayer check-in app and the revelation
// tracker are deployed to two separate Firebase Hosting sites, and each
// site needs its OWN index.html at its root — Firebase Hosting serves a
// literal "index.html" for "/" before it ever consults rewrite rules, so
// if both sites shared the same "dist" folder, the tracker's site would
// always show the prayer app's index.html instead of revelations.html.
// This copies just what the standalone tracker needs into dist-revelations/,
// with revelations.html renamed to index.html at that folder's root.
import { existsSync, mkdirSync, cpSync, copyFileSync, rmSync, readdirSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const dist = path.join(root, 'dist');
const target = path.join(root, 'dist-revelations');

if (existsSync(target)) {
  rmSync(target, { recursive: true, force: true });
}
mkdirSync(target, { recursive: true });

cpSync(path.join(dist, 'assets'), path.join(target, 'assets'), { recursive: true });
copyFileSync(path.join(dist, 'revelations.html'), path.join(target, 'index.html'));

const rootFiles = [
  'manifest.webmanifest',
  'icon.svg',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
  'favicon-32.png',
];
for (const file of rootFiles) {
  const src = path.join(dist, file);
  if (existsSync(src)) {
    copyFileSync(src, path.join(target, file));
  }
}

for (const file of readdirSync(dist)) {
  if (file === 'sw.js' || (file.startsWith('workbox-') && file.endsWith('.js'))) {
    copyFileSync(path.join(dist, file), path.join(target, file));
  }
}

console.log('Prepared dist-revelations/ for the standalone revelation tracker Hosting site.');

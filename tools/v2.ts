import * as fs from 'fs';

const manifest = JSON.parse(fs.readFileSync('./dist/manifest.json', 'utf8'));

manifest.manifest_version = 2;

fs.writeFileSync('./dist/manifest.json', JSON.stringify(manifest, null, 2));
import * as fs from 'fs';

const appConfig = JSON.parse(fs.readFileSync('./app.config.json', 'utf8'));
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync('./public/manifest.json', 'utf8'));

pkg.version = appConfig.AppData.version;
pkg.name = appConfig.AppData.id;
pkg.authors = appConfig.AppData.authors;
pkg.description = appConfig.AppData.description;
pkg.homepage = appConfig.AppData.homepage;
pkg.license = appConfig.AppData.license;
pkg.repository = appConfig.AppData.repository;
pkg.bugs = appConfig.AppData.bugs;

manifest.version = appConfig.AppData.version;
manifest.name = appConfig.AppData.name;
manifest.description = appConfig.AppData.description;
manifest.homepage_url = appConfig.AppData.homepage;

fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
fs.writeFileSync('./public/manifest.json', JSON.stringify(manifest, null, 2));
// @ts-ignore
const fs = require('fs');

const appConfig = JSON.parse(fs.readFileSync('./app.config.json', 'utf8'));
const pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const manifestJson = JSON.parse(fs.readFileSync('./public/manifest.json', 'utf8'));

pkg.version = appConfig.AppData.version;
pkg.name = appConfig.AppData.id;
pkg.authors = appConfig.AppData.authors;
pkg.description = appConfig.AppData.description;
pkg.homepage = appConfig.AppData.homepage;
pkg.license = appConfig.AppData.license;
pkg.repository = appConfig.AppData.repository;
pkg.bugs = appConfig.AppData.bugs;

manifestJson.version = appConfig.AppData.version;
manifestJson.name = appConfig.AppData.name;
manifestJson.description = appConfig.AppData.description;
manifestJson.homepage_url = appConfig.AppData.homepage;

fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));
fs.writeFileSync('./public/manifest.json', JSON.stringify(manifestJson, null, 2));

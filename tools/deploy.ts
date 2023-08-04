const path = require('path');
// @ts-ignore
const fs = require('fs');

const appConfigJson = JSON.parse(fs.readFileSync('./app.config.json', 'utf8'));
const DEPLOY_ENTRY = "./public/";
const DEPLOY_TARGET = "./dist/";

function deleteFolderRecursive(path: string) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file: string) {
      const curPath = path + "/" + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}

function findHtmlFilesRecursive(source: string): string[] {
  let files: string[] = [];
  const dir = fs.readdirSync(source);
  dir.forEach(function (file: string) {
    const sourceFile = path.join(source, file);
    const stat = fs.lstatSync(sourceFile);
    if (stat.isDirectory()) {
      files = files.concat(findHtmlFilesRecursive(sourceFile));
    } else {
      if (path.extname(sourceFile) == '.html') {
        files.push(sourceFile);
      }
    }
  });
  return files;
}

function replaceKeywordsInHtmlFile(file: string) {
  let content = fs.readFileSync(file, 'utf8');
  const pairs = appConfigJson.htmlTemplatePairs;
  pairs.forEach(function (pair: object) {
    // @ts-ignore
    content = content.replaceAll(pair.key, pair.value);
  });
  file = file.replace("public\\", DEPLOY_TARGET);
  fs.writeFileSync(file, content);
}

function buildHtmlFiles(source: string) {
  const files = findHtmlFilesRecursive(source);
  files.forEach(function (file: string) {
    replaceKeywordsInHtmlFile(file);
  });
}

function mkdirSync(path: string) {
  try {
    fs.mkdirSync(path);
  } catch (e: any) {
    if (e.code != 'EEXIST') throw e;
  }
}

function copyFiles(source: string, target: string) {
  const files = fs.readdirSync(source);
  files.forEach(function (file: string) {
    const sourceFile = path.join(source, file);
    const targetFile = path.join(target, file);
    const stat = fs.lstatSync(sourceFile);
    if (stat.isDirectory()) {
      mkdirSync(targetFile);
      copyFiles(sourceFile, targetFile);
    } else {
      fs.writeFileSync(targetFile, fs.readFileSync(sourceFile));
    }
  });
}

deleteFolderRecursive(DEPLOY_TARGET);
mkdirSync(DEPLOY_TARGET);
copyFiles(DEPLOY_ENTRY, DEPLOY_TARGET);
buildHtmlFiles(DEPLOY_ENTRY);

console.log("Deployed to " + DEPLOY_TARGET);

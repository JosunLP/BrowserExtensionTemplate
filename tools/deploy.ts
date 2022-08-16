import * as fs from 'fs';
import * as path from 'path';
const appConfig = JSON.parse(fs.readFileSync('./app.config.json', 'utf8'));
var DEPLOY_ENTRY = "./public/";
var DEPLOY_TARGET = "./dist/";

function deleteFolderRecursive(path: string) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach(function (file: string) {
      var curPath = path + "/" + file;
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
  var files: string[] = [];
  var dir = fs.readdirSync(source);
  dir.forEach(function (file: any) {
    var sourceFile = path.join(source, file);
    var stat = fs.lstatSync(sourceFile);
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
  var content = fs.readFileSync(file, 'utf8');
  let pairs = appConfig.htmlTemplatePairs;
  pairs.forEach(function (pair: any) {
    // @ts-ignore
    content = content.replaceAll(pair.key, pair.value);
  });
  file = file.replace("public\\", DEPLOY_TARGET);
  fs.writeFileSync(file, content);
}

function buildHtmlFiles(source: string) {
  let files = findHtmlFilesRecursive(source);
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
  var files = fs.readdirSync(source);
  files.forEach(function (file: any) {
    var sourceFile = path.join(source, file);
    var targetFile = path.join(target, file);
    var stat = fs.lstatSync(sourceFile);
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
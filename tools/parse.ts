import * as fs from "fs";
import * as path from "path";
const appConfig = JSON.parse(fs.readFileSync("./app.config.json", "utf8"));
const DEPLOY_TARGET = "./dist/";

function findCssFileNames(source: string): string[] {
	let files: string[] = [];
	const dir = fs.readdirSync(source);
	dir.forEach(function (file: string) {
		const sourceFile = path.join(source, file);
		const stat = fs.lstatSync(sourceFile);
		if (stat.isDirectory()) {
			files = files.concat(findCssFileNames(sourceFile));
		} else {
			if (path.extname(sourceFile) == ".css") {
				files.push(file);
			}
		}
	});
	return files;
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
			if (path.extname(sourceFile) == ".html") {
				files.push(sourceFile);
			}
		}
	});
	return files;
}

function replaceKeywordsInHtmlFile(file: string) {
	let content = fs.readFileSync(file, "utf8");
	const pairs: { key: string; value: string }[] = appConfig.htmlTemplatePairs;
	pairs.forEach(function (pair: { key: string; value: string }) {
		//@ts-ignore
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

findCssFileNames(DEPLOY_TARGET).forEach((file: string) => {
	const files = findHtmlFilesRecursive(DEPLOY_TARGET);
	files.forEach(function (htmlFile: string) {
		let content = fs.readFileSync(htmlFile, "utf8");
		content = content.replace(
			"</head>",
			`<link rel="stylesheet" href="./assets/${file}">\n</head>`
		);
		fs.writeFileSync(htmlFile, content);
	});
});

buildHtmlFiles(DEPLOY_TARGET);

console.log("Parsed Files: ", findHtmlFilesRecursive(DEPLOY_TARGET));

// @ts-ignore
const fs = require("fs");

function removeExport(file: string) {
	let content = fs.readFileSync(file, "utf8");
	content = content.replace("export {};", "");
	fs.writeFileSync(file, content);
}

removeExport("./dist/js/background.js");

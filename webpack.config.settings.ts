const path = require('path');

module.exports = {
	entry: './src/settings.ts',
	mode: 'production',
	devtool: 'source-map',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: [
					"/node_modules/",
					"/dist/",
					"/src/background.ts",
					"/src/app.ts"
				],
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts'],
	},
	output: {
		filename: 'settings.js',
		path: path.resolve(__dirname, 'dist/js'),
	},
};

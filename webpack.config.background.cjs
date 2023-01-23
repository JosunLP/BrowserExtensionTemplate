const path = require('path');

module.exports = {
	entry: './src/background.ts',
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
					"/src/app.ts",
					"/src/settings.ts"
				],
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts'],
	},
	output: {
		filename: 'background.js',
		path: path.resolve(__dirname, 'dist/js'),
	},
};

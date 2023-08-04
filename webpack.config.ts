const path = require('path');

module.exports = {
	entry: './src/app.ts',
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
					"/src/settings.ts"
				],
			},
		],
	},
	resolve: {
		extensions: ['.tsx', '.ts'],
	},
	output: {
		filename: 'app.js',
		path: path.resolve(__dirname, 'dist/js'),
	},
};

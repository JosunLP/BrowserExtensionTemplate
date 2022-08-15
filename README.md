# BrowserExtensionTemplate

A basic template based on SASS and TypeScript to create browser extensions without directly relying on a larger framework.

## Installation

You can download the source code from [GitHub](https://github.com/JosunLP/BrowserExtensionTemplate). Just copy it in your project and run `npm install` to install the dependencies.
The basic configuration, wich will sync with `npm run sync` with the `package.json` file and the `manifest.json` file, is in `app.config.json`.

## Usage

Your sourcecode can be written in the `src` folder. The `public` folder contains static files like images, html and the manifest.json.
With the `npm run deploy-v3` command you can deploy the extension to the dist folder, ready to be published to the chrome web store.
With the `npm run deploy-v2` command you can deploy the extension to the dist folder, ready to be published to the firefox web store.
This is necessary because the firefox web store needs the `manifest.json` file to be present in the version v2.

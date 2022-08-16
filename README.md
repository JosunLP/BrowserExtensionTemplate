# BrowserExtensionTemplate

[![GitHub issues](https://img.shields.io/github/issues/JosunLP/BrowserExtensionTemplate?style=for-the-badge)](https://github.com/JosunLP/BrowserExtensionTemplate/issues)
[![GitHub forks](https://img.shields.io/github/forks/JosunLP/BrowserExtensionTemplate?style=for-the-badge)](https://github.com/JosunLP/BrowserExtensionTemplate/network)
[![GitHub stars](https://img.shields.io/github/stars/JosunLP/BrowserExtensionTemplate?style=for-the-badge)](https://github.com/JosunLP/BrowserExtensionTemplate/stargazers)
[![GitHub license](https://img.shields.io/github/license/JosunLP/BrowserExtensionTemplate?style=for-the-badge)](https://github.com/JosunLP/BrowserExtensionTemplate)
[![Twitter URL](https://img.shields.io/twitter/url?logo=twitter&style=for-the-badge&url=https%3A%2F%2Fgithub.com%2FJosunLP%2FBrowserExtensionTemplate)](https://twitter.com/intent/tweet?text=Look+what+i+found+on+GitHub+%23Developer%2C+%23SoftwareDeveloper%3A&url=https%3A%2F%2Fgithub.com%2FJosunLP%2FBrowserExtensionTemplate)
[![CodeFactor](https://www.codefactor.io/repository/github/josunlp/browserextensiontemplate/badge?style=for-the-badge)](https://www.codefactor.io/repository/github/josunlp/browserextensiontemplate)
[![Known Vulnerabilities](https://snyk.io/test/github/JosunLP/BrowserExtensionTemplate/badge.svg?style=for-the-badge)](https://snyk.io/test/github/JosunLP/BrowserExtensionTemplate)

## Description

A basic template based on SASS and TypeScript to create browser extensions without directly relying on a larger framework.

## Installation

You can download the source code from [GitHub](https://github.com/JosunLP/BrowserExtensionTemplate). Just copy it in your project and run `npm install` to install the dependencies.
The basic configuration, wich will sync with `npm run sync` with the `package.json` file and the `manifest.json` file, is in `app.config.json`.
Alternatively, you can fork the project and run `npm install` in the forked project.

## Usage

Your sourcecode can be written in the `src` folder. The `public` folder contains static files like images, html and the manifest.json.
With the `npm run deploy-v3` command you can deploy the extension to the dist folder, ready to be published to the chrome web store.
With the `npm run deploy-v2` command you can deploy the extension to the dist folder, ready to be published to the firefox web store.
This is necessary because the firefox web store needs the `manifest.json` file to be present in the version v2.

## License

This project is licensed under the [MIT license](https://opensource.org/licenses/MIT).

## Contributing

This project is open source. Feel free to fork and contribute!

## Author

Jonas Pfalzgraf

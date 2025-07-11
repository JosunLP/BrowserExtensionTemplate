# BrowserExtensionTemplate

[![GitHub issues](https://img.shields.io/github/issues/JosunLP/BrowserExtensionTemplate?style=for-the-badge)](https://github.com/JosunLP/BrowserExtensionTemplate/issues)
[![GitHub forks](https://img.shields.io/github/forks/JosunLP/BrowserExtensionTemplate?style=for-the-badge)](https://github.com/JosunLP/BrowserExtensionTemplate/network)
[![GitHub stars](https://img.shields.io/github/stars/JosunLP/BrowserExtensionTemplate?style=for-the-badge)](https://github.com/JosunLP/BrowserExtensionTemplate/stargazers)
[![GitHub license](https://img.shields.io/github/license/JosunLP/BrowserExtensionTemplate?style=for-the-badge)](https://github.com/JosunLP/BrowserExtensionTemplate)
[![CodeFactor](https://www.codefactor.io/repository/github/josunlp/browserextensiontemplate/badge?style=for-the-badge)](https://www.codefactor.io/repository/github/josunlp/browserextensiontemplate)

## Description

A modern, production-ready template for building browser extensions using TypeScript, SASS, and Vite. This template provides a solid foundation with best practices, type safety, and modern development tools.

## Features

- 🚀 **Modern Tech Stack**: TypeScript, SASS, Vite, Bootstrap
- 🛡️ **Type Safety**: Strict TypeScript configuration with comprehensive error checking
- 🔧 **Development Tools**: ESLint, Prettier, automated workflows
- 🎯 **Cross-Browser**: Supports both Chrome (Manifest v3) and Firefox (Manifest v2)
- 📦 **Component System**: Reusable UI components with type safety
- 💾 **Session Management**: Robust localStorage-based session handling
- 🛠️ **Build System**: Optimized Vite configuration with code splitting
- 🎨 **Modern CSS**: CSS Custom Properties with SASS preprocessing
- 🔒 **Security**: Content Security Policy and secure coding practices
- ⚡ **Error Handling**: Comprehensive error boundary system

## Installation

### Quick Start

```bash
git clone https://github.com/JosunLP/BrowserExtensionTemplate.git
cd BrowserExtensionTemplate
npm install
```

### Development Setup

```bash
# Install dependencies
npm install

# Start development mode with auto-rebuild
npm run dev

# Type checking
npm run type-check

# Linting and formatting
npm run validate
```

## Usage

### Project Structure

```bash
src/
├── classes/           # Core classes (Session, ErrorBoundary)
├── components/        # Reusable UI components
├── sass/             # SASS styles with CSS custom properties
├── types/            # TypeScript type definitions
├── app.ts            # Popup entry point
├── settings.ts       # Options page entry point
└── background.ts     # Background service worker

public/
├── icons/            # Extension icons
├── manifest.json     # Extension manifest
├── popup.html        # Popup HTML template
└── options.html      # Options page HTML template

tools/                # Build and automation scripts
```

### Configuration

The main configuration is in `app.config.json`. This file is automatically synchronized with `package.json` and `manifest.json`:

```json
{
  "AppData": {
    "id": "your_extension_id",
    "name": "Your Extension Name",
    "version": "1.0.0",
    "description": "Your extension description"
  },
  "htmlTemplatePairs": [
    {
      "key": "{{PLACEHOLDER}}",
      "value": "Replacement Value"
    }
  ]
}
```

### Build Commands

```bash
# Development
npm run dev              # Start development with watch mode
npm run sync            # Sync configuration files

# Production
npm run deploy-v3       # Build for Chrome (Manifest v3)
npm run deploy-v2       # Build for Firefox (Manifest v2)

# Quality Assurance
npm run validate        # Type check + lint
npm run lint           # ESLint with auto-fix
npm run format         # Prettier formatting

# Utilities
npm run clean          # Clean dist folder
npm run build-tooling  # Compile TypeScript tools
```

### Development Workflow

1. **Configure your extension** in `app.config.json`
2. **Run sync** to update all config files: `npm run sync`
3. **Start development**: `npm run dev`
4. **Write your code** in the `src/` directory
5. **Build for production**: `npm run deploy-v3` or `npm run deploy-v2`
6. **Load the extension** from the `dist/` folder in your browser

### Session Management

The template includes a robust session management system:

```typescript
import { Session } from './classes/session';

// Get session instance (async)
const session = await Session.getInstance();

// Save data
session.contentTest = 'New value';
await session.save();

// Reset session
await Session.reset();
```

### Error Handling

Built-in error boundary system:

```typescript
import { ErrorBoundary } from './classes/errorBoundary';

const errorBoundary = ErrorBoundary.getInstance();

// Wrap async functions
const safeAsyncFunction = errorBoundary.wrapAsync(asyncFunction);

// Add custom error handlers
errorBoundary.addErrorHandler(error => {
  console.log('Custom error handling:', error);
});
```

### Component System

Type-safe, reusable components:

```typescript
import { BasicButton } from './components/button';

// Create button
const button = new BasicButton('primary', 'Click me', 'my-button');

// Render as HTML string
const htmlString = button.render();

// Or create as DOM element
const buttonElement = button.createElement();
```

## Browser Compatibility

- **Chrome**: Manifest v3 (recommended)
- **Firefox**: Manifest v2 (automatically converted)
- **Edge**: Manifest v3 compatible

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and ensure tests pass: `npm run validate`
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## Development Guidelines

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add proper error handling
- Write self-documenting code
- Follow the established project structure
- Run `npm run validate` before committing

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

## Author

**_Jonas Pfalzgraf_**

- Email: <info@josunlp.de>
- GitHub: [@JosunLP](https://github.com/JosunLP)

## Changelog

### v0.0.1 (Current)

- ✨ Modern TypeScript setup with strict type checking
- 🛡️ Comprehensive error handling system
- 🎨 CSS Custom Properties with SASS
- 🔧 ESLint and Prettier configuration
- 📦 Optimized Vite build system
- 🚀 Cross-browser compatibility (Chrome/Firefox)
- 💾 Robust session management
- 🎯 Component-based architecture

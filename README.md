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
- ⚡ **bQuery.js Built-in**: First-class integration of [`@bquery/bquery`](https://bquery.flausch-code.de) — signals, reactive forms, Web Components, sanitized DOM, and the unified storage adapter ship with the template
- 🛡️ **Type Safety**: Strict TypeScript configuration with comprehensive error checking
- 🔧 **Development Tools**: ESLint, Prettier, automated workflows
- 🎯 **Cross-Browser**: Supports both Chrome (Manifest v3) and Firefox (Manifest v2)
- 📦 **Component System**: Reusable UI components with type safety, including a native `<bet-button>` bQuery Web Component
- 💾 **Session Management**: Reactive session powered by bQuery's `platform/storage` adapter and signals
- 🛠️ **Build System**: Optimized Vite configuration with code splitting
- 🎨 **Modern CSS**: CSS Custom Properties with SASS preprocessing
- 🔒 **Security**: Content Security Policy plus bQuery `safeHtml`/text sinks for DOM rendering and `sanitizeHtml` for settings persistence normalization
- ⚡ **Error Handling**: Comprehensive error boundary system

## Installation

### Quick Start

```bash
git clone https://github.com/JosunLP/BrowserExtensionTemplate.git
cd BrowserExtensionTemplate
bun install
```

### Development Setup

```bash
# Install dependencies
bun install

# Start development mode with auto-rebuild
bun run dev

# Type checking
bun run type-check

# Linting and formatting
bun run validate
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
bun run dev              # Start development with watch mode
bun run sync            # Sync configuration files

# Production
bun run deploy-v3       # Build for Chrome (Manifest v3)
bun run deploy-v2       # Build for Firefox (Manifest v2)

# Quality Assurance
bun run validate        # Type check + lint
bun run lint           # ESLint with auto-fix
bun run format         # Prettier formatting

# Utilities
bun run clean          # Clean dist folder
bun run build-tooling  # Compile TypeScript tools
```

### Development Workflow

1. **Configure your extension** in `app.config.json`
2. **Run sync** to update all config files: `bun run sync`
3. **Start development**: `bun run dev`
4. **Write your code** in the `src/` directory
5. **Build for production**: `bun run deploy-v3` or `bun run deploy-v2`
6. **Load the extension** from the `dist/` folder in your browser

### Session Management

Sessions are powered by bQuery's reactive primitives and the unified
`platform/storage` adapter. The `contentTest` field is exposed both as a
plain accessor and as a reactive `Signal`, so consumers can subscribe to
updates without polling:

```typescript
import { Session } from './classes/session';
import { effect } from '@bquery/bquery/reactive';

const session = await Session.getInstance();

// Reactive subscription — re-runs on every change.
effect(() => {
  console.log('Content changed:', session.contentTest$.value);
});

// Either accessor or signal write; both persist via storage.local() automatically.
session.contentTest = 'New value';
// Or: session.contentTest$.value = 'New value';
```

### bQuery.js Integration

The template wires up [`@bquery/bquery`](https://bquery.flausch-code.de) as a
first-class dependency. Use any of its tree-shakeable entry points directly
from `src/`:

```typescript
import { $, $$ } from '@bquery/bquery/core';
import { signal, computed, effect } from '@bquery/bquery/reactive';
import { createForm, required } from '@bquery/bquery/forms';
import { component, safeHtml, bool } from '@bquery/bquery/component';
import { escapeHtml, sanitizeHtml } from '@bquery/bquery/security';
import { storage, useAnnouncer } from '@bquery/bquery/platform';
```

What ships out of the box:

- **Reactive popup (`src/app.ts`)** — uses `$` for DOM scripting and `effect`
  to keep the popup in sync with the session signal.
- **Reactive options page (`src/settings.ts`)** — uses `createForm` for
  validated form state, `useAnnouncer` for accessible status messages, and
  bQuery security helpers for render-time escaping plus form-time value
  normalization before persistence.
- **`<bet-button>` Web Component (`src/components/button.ts`)** — defined via
  `component()` with typed props (`variant`, `text`, `disabled`) and
  rendered through `safeHtml` + `bool()`.
- **Reactive background worker (`src/background.ts`)** — tracks runtime
  state (`installReason`, `messageCount`) with signals and `computed`.
- **Security helpers included** — error rendering uses `escapeHtml`, the
  options form normalizes persisted text with `sanitizeHtml`, and DOM writes
  still use context-appropriate escaping/sanitization at the sink.

### Error Handling

Built-in error boundary system, integrated with bQuery's `escapeHtml`:

```typescript
import { ErrorBoundary } from './classes/errorBoundary';

const errorBoundary = ErrorBoundary.getInstance();

// Wrap async functions
const safeAsyncFunction = errorBoundary.wrapAsync(asyncFunction);

// Add custom error handlers
errorBoundary.addErrorHandler(error => {
  console.log('Custom error handling:', error);
});

// Render an error message safely (HTML-escaped via bQuery security)
element.innerHTML = ErrorBoundary.formatErrorMessage(unsafeMessage);
```

### Component System

Type-safe, reusable components — both as imperative helpers and as native
Web Components built with bQuery:

```typescript
import { BasicButton } from './components/button';

// Imperative helper (kept for backward compatibility)
const button = new BasicButton('primary', 'Click me', 'my-button');
const buttonElement = button.createElement();

// Or use the <bet-button> Web Component directly in HTML/templates.
// Importing the module auto-registers the custom element in page contexts.
document.body.insertAdjacentHTML(
  'beforeend',
  '<bet-button variant="success" text="Save"></bet-button>'
);
```

## Browser Compatibility

- **Chrome**: Manifest v3 (recommended)
- **Firefox**: Manifest v2 (automatically converted)
- **Edge**: Manifest v3 compatible

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and ensure tests pass: `bun run validate`
4. Commit your changes: `git commit -m 'Add amazing feature'`
5. Push to the branch: `git push origin feature/amazing-feature`
6. Open a Pull Request

## Development Guidelines

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add proper error handling
- Write self-documenting code
- Follow the established project structure
- Run `bun run validate` before committing

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

## Author

**_Jonas Pfalzgraf_**

- Email: <info@josunlp.de>
- GitHub: [@JosunLP](https://github.com/JosunLP)

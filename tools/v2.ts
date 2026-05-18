import { buildSync } from 'esbuild';
import * as fs from 'fs';

interface ManifestJson {
  manifest_version: number;
  background: {
    persistent?: boolean;
    scripts?: string[];
    service_worker?: string;
    type?: string;
    [key: string]: unknown;
  };
  permissions?: unknown[];
  host_permissions?: unknown;
  optional_host_permissions?: unknown;
  content_security_policy?: unknown;
  web_accessible_resources?: unknown;
  action?: unknown;
  browser_action?: unknown;
  [key: string]: unknown;
}

const FIREFOX_BACKGROUND_BUNDLE = 'background.firefox.js';

buildSync({
  entryPoints: ['./src/background.ts'],
  outfile: `./dist/${FIREFOX_BACKGROUND_BUNDLE}`,
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: ['firefox102', 'es2022'],
  sourcemap: true,
  minify: true,
  legalComments: 'none',
});

const manifest = JSON.parse(fs.readFileSync('./dist/manifest.json', 'utf8')) as ManifestJson;

manifest.manifest_version = 2;
manifest.background.scripts = [FIREFOX_BACKGROUND_BUNDLE];

delete manifest.background.type;
delete manifest.background.service_worker;

manifest.background.persistent = true;

if (manifest.host_permissions) {
  manifest.permissions ??= [];
  manifest.permissions.push(manifest.host_permissions);
}

if (manifest.optional_host_permissions) {
  manifest.permissions ??= [];
  manifest.permissions.push(manifest.optional_host_permissions);
}

delete manifest.host_permissions;
delete manifest.optional_host_permissions;

let newContentSecurityPolicy = '';

try {
  if (typeof manifest.content_security_policy === 'string') {
    newContentSecurityPolicy = manifest.content_security_policy;
  } else if (manifest.content_security_policy && typeof manifest.content_security_policy === 'object') {
    newContentSecurityPolicy = Object.values(manifest.content_security_policy as Record<string, string>).join(
      ' '
    );
  }
} catch {
  newContentSecurityPolicy = "default-src 'self'";
}

if (!newContentSecurityPolicy) {
  newContentSecurityPolicy = "default-src 'self'";
}

manifest.content_security_policy = newContentSecurityPolicy;

try {
  const webAccessibleResources = manifest.web_accessible_resources as
    | Array<{ resources: string[] }>
    | undefined;
  manifest.web_accessible_resources = webAccessibleResources?.[0]?.resources ?? [];
} catch {
  manifest.web_accessible_resources = [];
}

if (manifest.action) {
  manifest.browser_action = manifest.action;
}

delete manifest.action;

fs.writeFileSync('./dist/manifest.json', JSON.stringify(manifest, null, 2));

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
  optional_permissions?: unknown[];
  host_permissions?: unknown;
  optional_host_permissions?: unknown;
  content_security_policy?: unknown;
  web_accessible_resources?: unknown;
  action?: unknown;
  browser_action?: unknown;
  [key: string]: unknown;
}

const FIREFOX_BACKGROUND_BUNDLE = 'background.firefox.js';
const DEFAULT_MV2_CONTENT_SECURITY_POLICY = "default-src 'self'";

const toPermissionList = (value: unknown): string[] => {
  if (typeof value === 'string') {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter((entry): entry is string => typeof entry === 'string');
  }

  return [];
};

const toWebAccessibleResourceList = (value: unknown): string[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  if (value.every(entry => typeof entry === 'string')) {
    return value;
  }

  return value.flatMap(entry => {
    if (!entry || typeof entry !== 'object') {
      return [];
    }

    const resources = (entry as { resources?: unknown }).resources;
    return Array.isArray(resources)
      ? resources.filter((resource): resource is string => typeof resource === 'string')
      : [];
  });
};

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
  manifest.permissions.push(...toPermissionList(manifest.host_permissions));
}

if (manifest.optional_host_permissions) {
  manifest.optional_permissions ??= [];
  manifest.optional_permissions.push(...toPermissionList(manifest.optional_host_permissions));
}

delete manifest.host_permissions;
delete manifest.optional_host_permissions;

let newContentSecurityPolicy = '';

try {
  if (typeof manifest.content_security_policy === 'string') {
    newContentSecurityPolicy = manifest.content_security_policy;
  } else if (manifest.content_security_policy && typeof manifest.content_security_policy === 'object') {
    const policyMap = manifest.content_security_policy as Record<string, unknown>;
    if (typeof policyMap.extension_pages === 'string') {
      newContentSecurityPolicy = policyMap.extension_pages;
    }
  }
} catch {
  newContentSecurityPolicy = DEFAULT_MV2_CONTENT_SECURITY_POLICY;
}

if (!newContentSecurityPolicy) {
  newContentSecurityPolicy = DEFAULT_MV2_CONTENT_SECURITY_POLICY;
}

manifest.content_security_policy = newContentSecurityPolicy;

try {
  manifest.web_accessible_resources = [
    ...new Set(toWebAccessibleResourceList(manifest.web_accessible_resources)),
  ];
} catch {
  manifest.web_accessible_resources = [];
}

if (manifest.action) {
  manifest.browser_action = manifest.action;
}

delete manifest.action;

fs.writeFileSync('./dist/manifest.json', JSON.stringify(manifest, null, 2));

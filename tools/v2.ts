// @ts-ignore
const fs = require('fs');

const manifest = JSON.parse(fs.readFileSync('./dist/manifest.json', 'utf8'));

manifest.manifest_version = 2

manifest.background.scripts = []

manifest.background.scripts.push(manifest.background.service_worker)
delete manifest.background.type
delete manifest.background.service_worker
manifest.background.persistent = true
if (manifest.host_permissions) {
    manifest.permissions.push(manifest.host_permissions)
}
if (manifest.optional_host_permissions) {
    manifest.permissions.push(manifest.optional_host_permissions)
}
delete manifest.host_permissions
delete manifest.optional_host_permissions

let newContentSecurityPolicy = ""

try {
    for (const policy of manifest.content_security_policy) {
        newContentSecurityPolicy += policy.key + "'" + policy.value + "'" + " "
    }
} catch (e) {
    newContentSecurityPolicy = "default-src 'self'"
}

manifest.content_security_policy = newContentSecurityPolicy

try {
    manifest.web_accessible_resources = manifest.web_accessible_resources.resources
} catch (e) {
    manifest.web_accessible_resources = []
}

if (manifest.action) {
    manifest.browser_action = manifest.action
}
delete manifest.action

fs.writeFileSync('./dist/manifest.json', JSON.stringify(manifest, null, 2));

// Regression against the real reviewed APK that still declared a disabled listener.
// Read-only inspection; no Android execution, network or phone access.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {inspectApk} from './inspect-gadgetbridge-apk.mjs';
import {assertNoSensitiveAccess} from './android-diagnostic-permissions.mjs';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const report = inspectApk(fs.readFileSync(path.join(root, 'artifacts/android-offline-test-r87/RW4Diagnostics-r87.apk')));
assert.equal(report.apkSha256, 'bf95f228b51e4ff1920f918b9c8502f0d85b9a7d8975b40e5c82fedcee975fd2');
assert.equal(report.manifest.permissions.length, 10);
assert.equal(report.manifest.components.find(c => c.permission === 'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE').enabled, false);
assert.throws(() => assertNoSensitiveAccess(report.manifest), /Sensitive component binding declared/);
console.log('PASS: real r87 APK rejected for sensitive service binding despite disabled state and limited uses-permission list.');

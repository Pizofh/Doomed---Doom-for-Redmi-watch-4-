// SPDX-License-Identifier: AGPL-3.0-or-later
// Capabilities needed for foreground discovery/one bounded Bluetooth diagnostic.
// No phone data, firmware installation, InternetHelper or background location.
export const diagnosticPermissions = new Map([
  ['android.permission.BLUETOOTH', 'android:maxSdkVersion="30"'],
  ['android.permission.BLUETOOTH_ADMIN', 'android:maxSdkVersion="30"'],
  ['android.permission.ACCESS_FINE_LOCATION', 'android:maxSdkVersion="30"'],
  ['android.permission.BLUETOOTH_SCAN', 'android:usesPermissionFlags="neverForLocation"'],
  ['android.permission.BLUETOOTH_CONNECT', ''],
  ['android.permission.POST_NOTIFICATIONS', ''],
  ['android.permission.FOREGROUND_SERVICE', ''],
  ['android.permission.FOREGROUND_SERVICE_CONNECTED_DEVICE', ''],
  ['android.permission.WAKE_LOCK', '']
]);
export const internalReceiverPermission = 'nodomain.freeyourgadget.gadgetbridge.rw4diagnostic.DYNAMIC_RECEIVER_NOT_EXPORTED_PERMISSION';
export function permissionAllowed(name) {
  return diagnosticPermissions.has(name) || name === internalReceiverPermission;
}

// Binding permissions on disabled components still declare sensitive capabilities.
// Check both locations; counting only uses-permission missed the original listener.
export function assertNoSensitiveAccess(manifest) {
  const sensitive = new Set([
    'android.permission.READ_SMS', 'android.permission.RECEIVE_SMS',
    'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
    'android.permission.BIND_ACCESSIBILITY_SERVICE', 'android.permission.BIND_DEVICE_ADMIN'
  ]);
  if (manifest.permissions.some(name => sensitive.has(name))) throw Error('Sensitive uses-permission declared');
  if (manifest.components.some(component => sensitive.has(component.permission))) throw Error('Sensitive component binding declared (including disabled components)');
}

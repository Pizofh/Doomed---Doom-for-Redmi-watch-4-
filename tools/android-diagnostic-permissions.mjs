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

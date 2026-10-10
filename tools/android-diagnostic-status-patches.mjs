// Stage display for historical transport code. r104's entrypoint reads local cache only.
const pkg = 'nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi';
const mark = (context, device, event) => `${pkg}.Rw4DiagnosticStatus.record(${context}, ${device}, ${pkg}.Rw4DiagnosticTrace.Event.${event});`;
function once(text, anchor, replacement) {
  if (text.split(anchor).length !== 2) throw Error('Diagnostic stage anchor differs');
  return text.replace(anchor, replacement);
}

export function addDiagnosticStatus(name, text) {
  if (name === 'GBDeviceAdapterv2.java') {
    text = once(text, 'holder.deviceStatusLabel.setText(device.getStateString(context));',
      `holder.deviceStatusLabel.setText("r104: toca el reloj para consultar la caché local\\n" + ${pkg}.Rw4DiagnosticStatus.render(context));`);
  }
  if (name === 'DeviceCommunicationService.java') {
    text = once(text, '                    registeredStruct.setDeviceSupport(deviceSupport);',
      `                    registeredStruct.setDeviceSupport(deviceSupport);\n                    ${pkg}.Rw4DiagnosticStatus.record(this, gbDevice, deviceSupport == null ? ${pkg}.Rw4DiagnosticTrace.Event.SUPPORT_UNAVAILABLE : ${pkg}.Rw4DiagnosticTrace.Event.SUPPORT_CREATED);`);
    text = once(text, 'LOG.warn("exception in connectToDevice for {}", deviceAddress, e);',
      `${mark('this', 'gbDevice', 'CONNECTION_EXCEPTION')}\n                LOG.warn("RW4 diagnostic: connection setup failed");`);
    text = once(text, 'GB.toast(this, getString(R.string.cannot_connect, e.getLocalizedMessage()), Toast.LENGTH_SHORT, GB.ERROR, e);',
      'GB.toast(this, "No se pudo iniciar la conexión. Consulta el código de etapa.", Toast.LENGTH_SHORT, GB.ERROR);');
  }
  if (name === 'BtBRQueue.java') {
    text = once(text, '                            mBtSocket.connect();', `                            ${mark('mContext', 'mGbDevice', 'SOCKET_REQUESTED')}\n                            mBtSocket.connect();\n                            ${mark('mContext', 'mGbDevice', 'SOCKET_CONNECTED')}`);
    for (const [anchor, event] of [
      ['LOG.error("Got request to connect to RFCOMM socket, but it is null");', 'SUPPORT_UNAVAILABLE'],
      ['LOG.error("IO exception while establishing socket connection: ", e);', 'SOCKET_IO_FAILED'],
      ['LOG.error("Security exception while establishing socket connection: ", e);', 'SOCKET_PERMISSION_FAILED']
    ]) text = once(text, anchor, `${mark('mContext', 'mGbDevice', event)}\n                            ${anchor}`);
  }
  if (name === 'XiaomiSppSupport.java') {
    text = once(text, '            builder.setDeviceState(GBDevice.State.INITIALIZING);', `            ${mark('getContext()', 'getDevice()', 'PROTOCOL_QUERY')}\n            builder.setDeviceState(GBDevice.State.INITIALIZING);`);
    text = once(text, '        if (payloadBytes != null && payloadBytes.length > 0) {', `        if (payloadBytes != null && payloadBytes.length > 0) {\n            ${mark('mXiaomiSupport.getContext()', 'mXiaomiSupport.getDevice()', 'PROTOCOL_RESPONSE')}`);
    text = once(text, '            LOG.warn("SPP protocol version request timed out");', `            ${mark('mXiaomiSupport.getContext()', 'mXiaomiSupport.getDevice()', 'PROTOCOL_TIMEOUT')}\n            LOG.warn("SPP protocol version request timed out");`);
  }
  if (name === 'XiaomiAuthService.java') {
    text = once(text, '    protected void startEncryptedHandshake() {', `    protected void startEncryptedHandshake() {\n        ${mark('getSupport().getContext()', 'getSupport().getDevice()', 'AUTH_STARTED')}`);
    text = once(text, 'LOG.debug("Got watch nonce");', `${mark('getSupport().getContext()', 'getSupport().getDevice()', 'AUTH_RESPONSE')}\n                LOG.debug("Got watch nonce");`);
    for (const anchor of [
      'LOG.error("handleWatchNonce returned null, disconnecting");',
      'LOG.warn("Authentication failed, subtype={}, status={}", cmd.getSubtype(), cmd.getStatus());'
    ]) text = once(text, anchor, `${mark('getSupport().getContext()', 'getSupport().getDevice()', 'AUTH_REJECTED')}\n                    ${anchor}`);
  }
  if (name === 'XiaomiSupport.java') {
    text = once(text, '            diagnosticSession.close();\n            GBApplication.deviceService(getDevice()).disconnect();',
      `            ${mark('getContext()', 'getDevice()', 'LIMIT_REACHED')}\n            diagnosticSession.close();\n            GBApplication.deviceService(getDevice()).disconnect();`);
    text = once(text, '        if (!diagnosticSession.authenticated()) return;', `        if (!diagnosticSession.authenticated()) return;\n        ${mark('getContext()', 'getDevice()', 'AUTH_SUCCESS')}`);
    text = once(text, '            evaluateGBDeviceEvent(battery);', `            evaluateGBDeviceEvent(battery);\n            ${mark('getContext()', 'getDevice()', 'BATTERY_RECEIVED')}`);
    text = once(text, '            evaluateGBDeviceEvent(version);', `            evaluateGBDeviceEvent(version);\n            ${mark('getContext()', 'getDevice()', 'INFO_RECEIVED')}`);
    text = once(text, '        if (!isRw4DiagnosticCommandAllowed(command)) return;', `        if (!isRw4DiagnosticCommandAllowed(command)) { ${mark('getContext()', 'getDevice()', 'COMMAND_BLOCKED')} return; }`);
    text = once(text, '    public void onDisconnect() {', `    public void onDisconnect() {\n        ${mark('getContext()', 'getDevice()', 'DISCONNECTED')}`);
  }
  return text;
}

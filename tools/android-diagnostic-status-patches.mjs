// Consolidated diagnostic stages; fixed details only, no raw exception text stored.
const pkg = 'nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi';
const mark = (context, device, event) => `${pkg}.Rw4DiagnosticStatus.record(${context}, ${device}, ${pkg}.Rw4DiagnosticTrace.Event.${event});`;
function once(text, anchor, replacement) {
  if (text.split(anchor).length !== 2) throw Error('Diagnostic stage anchor differs');
  return text.replace(anchor, replacement);
}

export function addDiagnosticStatus(name, text) {
  if (name === 'GBDeviceAdapterv2.java') {
    text = once(text, 'holder.deviceStatusLabel.setText(device.getStateString(context));',
      `holder.deviceStatusLabel.setText("r106: toca el reloj para abrir diagnóstico\\n" + ${pkg}.Rw4DiagnosticStatus.render(context));`);
  }
  if (name === 'DeviceCommunicationService.java') {
    text = once(text, '                    registeredStruct.setDeviceSupport(deviceSupport);',
      `                    registeredStruct.setDeviceSupport(deviceSupport);\n                    ${pkg}.Rw4DiagnosticStatus.record(this, gbDevice, deviceSupport == null ? ${pkg}.Rw4DiagnosticTrace.Event.SUPPORT_UNAVAILABLE : ${pkg}.Rw4DiagnosticTrace.Event.SUPPORT_CREATED);`);
    text = once(text, 'LOG.warn("exception in connectToDevice for {}", deviceAddress, e);',
      `${mark('this', 'gbDevice', 'CONNECTION_EXCEPTION')}\n                ${pkg}.Rw4DiagnosticStatus.error(this, gbDevice, e);\n                LOG.warn("RW4 diagnostic: connection setup failed");`);
    text = once(text, 'GB.toast(this, getString(R.string.cannot_connect, e.getLocalizedMessage()), Toast.LENGTH_SHORT, GB.ERROR, e);',
      'GB.toast(this, "No se pudo iniciar la conexión. Consulta el código de etapa.", Toast.LENGTH_SHORT, GB.ERROR);');
  }
  if (name === 'BtBRQueue.java') {
    text = once(text, '                            mBtSocket.connect();', `                            ${mark('mContext', 'mGbDevice', 'SOCKET_REQUESTED')}
                            mBtSocket.connect();
                            ${mark('mContext', 'mGbDevice', 'SOCKET_CONNECTED')}
                            if (${pkg}.Rw4DiagnosticAttempt.PROCESS.isCancelled()
                                    || ${pkg}.Rw4DiagnosticAttempt.PROCESS.isExpired(android.os.SystemClock.elapsedRealtime())) {
                                if (!${pkg}.Rw4DiagnosticAttempt.PROCESS.isCancelled()) { ${mark('mContext', 'mGbDevice', 'LIMIT_REACHED')} }
                                cleanup();
                                mGbDevice.setUpdateState(GBDevice.State.NOT_CONNECTED, mContext);
                                GBApplication.deviceService(mGbDevice).disconnect();
                                return;
                            }
                            if (${pkg}.Rw4DiagnosticAttempt.PROCESS.isTransportOnly()) {
                                ${mark('mContext', 'mGbDevice', 'TRANSPORT_TEST_PASSED')}
                                cleanup();
                                mGbDevice.setUpdateState(GBDevice.State.NOT_CONNECTED, mContext);
                                GBApplication.deviceService(mGbDevice).disconnect();
                                return;
                            }`);
    for (const [anchor, event] of [
      ['LOG.error("Got request to connect to RFCOMM socket, but it is null");', 'SUPPORT_UNAVAILABLE'],
      ['LOG.error("IO exception while establishing socket connection: ", e);', 'SOCKET_IO_FAILED'],
      ['LOG.error("Security exception while establishing socket connection: ", e);', 'SOCKET_PERMISSION_FAILED']
    ]) {
      const failure = event !== 'SUPPORT_UNAVAILABLE';
      text = once(text, anchor, `${mark('mContext', 'mGbDevice', event)}
                            ${failure ? `${pkg}.Rw4DiagnosticStatus.error(mContext, mGbDevice, e);\n                            GBApplication.deviceService(mGbDevice).disconnect();\n                            LOG.warn("Diagnostic socket failed; see fixed report category");` : anchor}`);
    }
    text = once(text, 'LOG.error("Unable to connect to RFCOMM endpoint: ", e);',
      `${mark('mContext', 'mGbDevice', 'SOCKET_IO_FAILED')}\n            ${pkg}.Rw4DiagnosticStatus.error(mContext, mGbDevice, e);\n            GBApplication.deviceService(mGbDevice).disconnect();\n            LOG.warn("Diagnostic endpoint setup failed");`);
    text = once(text, '        LOG.debug("Socket created, connecting in handler");',
      `        ${mark('mContext', 'mGbDevice', 'SOCKET_CREATED')}\n        LOG.debug("Socket created, connecting in handler");`);
    text = once(text, '                mBtSocket.close();\n            } catch (final IOException ignored)',
      `                mBtSocket.close();\n                ${mark('mContext', 'mGbDevice', 'SOCKET_CLOSED')}\n            } catch (final IOException ignored)`);
    text = once(text, '                mBtSocket.close();\n            } catch (IOException e)',
      `                mBtSocket.close();\n                ${mark('mContext', 'mGbDevice', 'SOCKET_CLOSED')}\n            } catch (IOException e)`);
    text = once(text, 'LOG.error("IO exception while closing socket in disconnect(): ", e);',
      `${mark('mContext', 'mGbDevice', 'SOCKET_CLOSE_FAILED')}\n                LOG.warn("Diagnostic socket close failed");`);
    text = once(text, '            } catch (final IOException ignored) {', `            } catch (final IOException ignored) {\n                ${mark('mContext', 'mGbDevice', 'SOCKET_CLOSE_FAILED')}`);
  }
  if (name === 'XiaomiSppSupport.java') {
    text = once(text, '            builder.setDeviceState(GBDevice.State.INITIALIZING);', `            ${mark('getContext()', 'getDevice()', 'PROTOCOL_QUERY')}\n            builder.setDeviceState(GBDevice.State.INITIALIZING);`);
    text = once(text, '        if (payloadBytes != null && payloadBytes.length > 0) {', `        if (payloadBytes != null && payloadBytes.length > 0) {\n            ${mark('mXiaomiSupport.getContext()', 'mXiaomiSupport.getDevice()', 'PROTOCOL_RESPONSE')}`);
    text = once(text, '            LOG.warn("SPP protocol version request timed out");', `            ${mark('mXiaomiSupport.getContext()', 'mXiaomiSupport.getDevice()', 'PROTOCOL_TIMEOUT')}\n            LOG.warn("SPP protocol version request timed out");`);
    text = once(text, '        if (mProtocol.initializeSession()) {',
      `        ${pkg}.Rw4DiagnosticStatus.record(mXiaomiSupport.getContext(), mXiaomiSupport.getDevice(), mProtocol instanceof XiaomiSppProtocolV2 ? ${pkg}.Rw4DiagnosticTrace.Event.PROTOCOL_V2 : ${pkg}.Rw4DiagnosticTrace.Event.PROTOCOL_V1);\n        if (mProtocol.initializeSession()) {`);
  }
  if (name === 'XiaomiAuthService.java') {
    text = once(text, '    protected void startEncryptedHandshake() {', `    protected void startEncryptedHandshake() {\n        ${mark('getSupport().getContext()', 'getSupport().getDevice()', 'AUTH_STARTED')}`);
    text = once(text, 'LOG.debug("Got watch nonce");', `${mark('getSupport().getContext()', 'getSupport().getDevice()', 'AUTH_RESPONSE')}\n                LOG.debug("Got watch nonce");`);
    text = once(text, 'LOG.warn("Watch hmac mismatch");', `${mark('getSupport().getContext()', 'getSupport().getDevice()', 'AUTH_HMAC_MISMATCH')}\n            LOG.warn("Watch hmac mismatch");`);
    text = once(text, '        final XiaomiProto.AuthDeviceInfo authDeviceInfo =', `        ${mark('getSupport().getContext()', 'getSupport().getDevice()', 'AUTH_HMAC_VERIFIED')}\n        final XiaomiProto.AuthDeviceInfo authDeviceInfo =`);
    for (const anchor of [
      'LOG.error("handleWatchNonce returned null, disconnecting");',
      'LOG.warn("Authentication failed, subtype={}, status={}", cmd.getSubtype(), cmd.getStatus());'
    ]) text = once(text, anchor, `${mark('getSupport().getContext()', 'getSupport().getDevice()', 'AUTH_REJECTED')}\n                    ${anchor}`);
  }
  if (name === 'XiaomiSupport.java') {
    text = once(text, '            diagnosticSession.close();\n            GBApplication.deviceService(getDevice()).disconnect();',
      `            ${mark('getContext()', 'getDevice()', 'LIMIT_REACHED')}\n            diagnosticSession.close();\n            GBApplication.deviceService(getDevice()).disconnect();`);
    text = once(text, '        if (!diagnosticSession.authenticated()) return;', `        if (!diagnosticSession.authenticated()) return;\n        ${mark('getContext()', 'getDevice()', 'AUTH_SUCCESS')}`);
    text = once(text, '            evaluateGBDeviceEvent(battery);', `            Rw4DiagnosticStatus.battery(getContext(), battery.level);\n            evaluateGBDeviceEvent(battery);\n            ${mark('getContext()', 'getDevice()', 'BATTERY_RECEIVED')}`);
    text = once(text, '            evaluateGBDeviceEvent(version);', `            Rw4DiagnosticStatus.identity(getContext(), version.hwVersion, version.fwVersion);\n            evaluateGBDeviceEvent(version);\n            ${mark('getContext()', 'getDevice()', 'INFO_RECEIVED')}`);
    text = once(text, '        if (!isRw4DiagnosticCommandAllowed(command)) return;', `        if (!isRw4DiagnosticCommandAllowed(command)) { ${mark('getContext()', 'getDevice()', 'COMMAND_BLOCKED')} return; }`);
    text = once(text, '    public void onDisconnect() {', `    public void onDisconnect() {\n        ${mark('getContext()', 'getDevice()', 'DISCONNECTED')}`);
  }
  return text;
}

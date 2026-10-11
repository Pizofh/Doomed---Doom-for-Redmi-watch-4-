I am investigating stock Redmi Watch 4 compatibility, initially without sending
Xiaomi application commands. Is there a known-working transport/setup for:

- Watch model M2315W1, firmware 2.2.86; region not independently established.
- Xiaomi phone, HyperOS 3.0.302.0, Android 16 / API 36.
- Mi Fitness 3.59.1i connects and synchronizes normally.

My limited diagnostic fork is based on Gadgetbridge 0.94.0 sources. It opens a
single secure `BluetoothDevice.createRfcommSocketToServiceRecord()` socket with
the standard SPP UUID, with no reconnect loop or Xiaomi auth/config/upload.
It closes after success/failure and has a bounded cancellation timeout.

Attempts fail inside `BluetoothSocket.connect()`, before application-level
authentication. The exception indicates EOF while waiting for the socket
connection signal; it does not identify the closer or prove a timeout.
The most recent attempt spent approximately 529 ms in connect. Android reports
a bonded Classic device and SDP lists SPP, HFP and HID; this does not prove an
available remote SPP channel.

Stopping Mi Fitness, temporarily removing its Nearby permission and cycling
the phone Bluetooth adapter did not resolve the issue. This does not establish
exclusive ownership of the radio/socket or exclude Xiaomi's core service.
Mi Fitness and the watch worked normally again after restoring settings.
An authorized full-HCI bugreport copy only contained empty snoop buffers, so
there is no packet-level failure attribution yet.

A static review of the installed Bluetooth APK (com.android.bluetooth version
16, signature verified) traced the ordinary socket binder to connectSocketNative.
The JNI library is outside this APK, so this did not establish the native failure
cause or a client-side fix. AdapterService.dump attempts to copy a snoop file
from sdcard into MIUI debug logs; neither exact path was present in the two
existing bugreport ZIPs. This is not proof of effective logging or file absence
on the phone. No extra probe or logging cycle was run after that review.

Could you point to a verified working firmware/Android setup, a known HyperOS
SPP restriction, or a relevant transport change? I have not tested unpair/reset,
firmware changes, insecure sockets or manual RFCOMM channels. I can provide
sanitized code details, but no keys, addresses or raw phone logs.

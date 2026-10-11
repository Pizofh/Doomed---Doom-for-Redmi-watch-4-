# Draft: RW4 connection compatibility question

Prepared locally in R144, 2026-10-11. **Not sent or published.** The user explicitly
authorized publication in R146; do not request that authorization again. No APKs, private logs, keys,
addresses or device serials attached. This is a diagnostic fork, not a claim
that the unmodified upstream application reproduces the issue.

Updated after the bounded R145 offline review; still not posted.

R146: official project README directs support to
https://codeberg.org/Freeyourgadget/Gadgetbridge/issues/new/choose . Browser
inventory returned no browsers; attempts to open IAB and Chrome returned
"Browser is not available". No publication was performed. The user can post
the [body-only message](upstream-connection-message.md) with the title below.
Record the actual issue URL only after a successful publication. No alternative
recipient, account creation or credential access attempted.

## Suggested title

Redmi Watch 4 2.2.86: secure SPP connection fails before auth on HyperOS / Android 16

## Suggested body

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

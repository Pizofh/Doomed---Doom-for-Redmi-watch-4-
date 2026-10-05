// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

/** Command kinds only. Protobuf payload validation is enforced at the transport. */
public final class Rw4DiagnosticPolicy {
    public enum Phase { HANDSHAKE, QUERIES, CLOSED }
    public static final int MAX_SESSION_MS = 30000;
    private Rw4DiagnosticPolicy() { }

    public static boolean allows(Phase phase, int type, int subtype) {
        if (phase == Phase.HANDSHAKE) return type == 1 && (subtype == 26 || subtype == 27);
        if (phase == Phase.QUERIES) return type == 2 && (subtype == 1 || subtype == 2);
        return false;
    }

    /** Strict proto2 wire shape from reviewed xiaomi.proto. No unknown fields. */
    public static boolean allowsSerialized(Phase phase, byte[] command) {
        if (command == null || command.length < 4 || command.length > 2048) return false;
        int type = command[1] & 255, subtype = command[3] & 255;
        if (command[0] != 8 || command[2] != 16 || !allows(phase, type, subtype)) return false;
        if (type == 2) return command.length == 4; // GET must carry no payload/status.
        try {
            Cursor outer = new Cursor(command, 4, command.length);
            Cursor auth = outer.message(26);
            Cursor body = auth.message(subtype == 26 ? 242 : 258);
            if (subtype == 26) body.bytes(10, 16, 16); // PhoneNonce.nonce; no deviceId.
            else {
                body.bytes(10, 32, 32); // AuthStep3 HMAC.
                body.bytes(18, 1, 512); // Encrypted phone metadata only.
            }
            return outer.done() && auth.done() && body.done();
        } catch (IllegalArgumentException ignored) { return false; }
    }

    private static final class Cursor {
        private final byte[] data;
        private final int end;
        private int pos;
        Cursor(byte[] data, int pos, int end) { this.data = data; this.pos = pos; this.end = end; }
        int varint() {
            int value = 0;
            for (int shift = 0; shift <= 14; shift += 7) {
                if (pos >= end) throw new IllegalArgumentException();
                int b = data[pos++] & 255;
                value |= (b & 127) << shift;
                if ((b & 128) == 0) {
                    if (shift > 0 && b == 0) throw new IllegalArgumentException();
                    return value;
                }
            }
            throw new IllegalArgumentException();
        }
        Cursor message(int tag) {
            if (varint() != tag) throw new IllegalArgumentException();
            int size = varint();
            if (size < 1 || size > end - pos) throw new IllegalArgumentException();
            Cursor child = new Cursor(data, pos, pos + size); pos += size; return child;
        }
        void bytes(int tag, int min, int max) {
            Cursor child = message(tag);
            if (child.end - child.pos < min || child.end - child.pos > max) throw new IllegalArgumentException();
        }
        boolean done() { return pos == end; }
    }
}

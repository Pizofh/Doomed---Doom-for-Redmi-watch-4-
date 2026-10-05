// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

import java.io.ByteArrayOutputStream;
import java.util.Arrays;

public final class Rw4DiagnosticPolicyTest {
    private static void require(boolean value) { if (!value) throw new AssertionError("Policy contract failed"); }
    private static byte[] join(byte[]... parts) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        for (byte[] part : parts) out.write(part, 0, part.length);
        return out.toByteArray();
    }
    private static byte[] varint(int n) {
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        do { int b = n & 127; n >>>= 7; out.write(n == 0 ? b : b | 128); } while (n != 0);
        return out.toByteArray();
    }
    private static byte[] field(int tag, byte[] value) { return join(varint(tag), varint(value.length), value); }
    public static void main(String[] args) {
        int allowed = 0;
        for (Rw4DiagnosticPolicy.Phase phase : Rw4DiagnosticPolicy.Phase.values()) {
            for (int type = -1; type <= 32; type++) {
                for (int subtype = -1; subtype <= 255; subtype++) {
                    boolean result = Rw4DiagnosticPolicy.allows(phase, type, subtype);
                    if (result) allowed++;
                    if (phase == Rw4DiagnosticPolicy.Phase.CLOSED) require(!result);
                }
            }
        }
        require(allowed == 4);
        require(Rw4DiagnosticPolicy.allows(Rw4DiagnosticPolicy.Phase.HANDSHAKE, 1, 26));
        require(Rw4DiagnosticPolicy.allows(Rw4DiagnosticPolicy.Phase.HANDSHAKE, 1, 27));
        require(Rw4DiagnosticPolicy.allows(Rw4DiagnosticPolicy.Phase.QUERIES, 2, 1));
        require(Rw4DiagnosticPolicy.allows(Rw4DiagnosticPolicy.Phase.QUERIES, 2, 2));
        // Critical writes from the audited default startup, firmware/password and uploads.
        int[][] forbidden = {{8,0}, {10,10}, {12,1}, {2,3}, {2,5}, {2,21}, {1,5}, {23,0}};
        for (int[] command : forbidden) {
            for (Rw4DiagnosticPolicy.Phase phase : Rw4DiagnosticPolicy.Phase.values())
                require(!Rw4DiagnosticPolicy.allows(phase, command[0], command[1]));
        }
        require(!Rw4DiagnosticPolicy.allows(null, 1, 26));
        require(!Rw4DiagnosticPolicy.allows(Rw4DiagnosticPolicy.Phase.QUERIES, Integer.MAX_VALUE, Integer.MIN_VALUE));
        byte[] nonce = join(new byte[] {8,1,16,26}, field(26, field(242, field(10, new byte[16]))));
        byte[] confirm = join(new byte[] {8,1,16,27}, field(26, field(258, join(field(10, new byte[32]), field(18, new byte[48])))));
        require(Rw4DiagnosticPolicy.allowsSerialized(Rw4DiagnosticPolicy.Phase.HANDSHAKE, nonce));
        require(Rw4DiagnosticPolicy.allowsSerialized(Rw4DiagnosticPolicy.Phase.HANDSHAKE, confirm));
        require(Rw4DiagnosticPolicy.allowsSerialized(Rw4DiagnosticPolicy.Phase.QUERIES, new byte[] {8,2,16,1}));
        require(Rw4DiagnosticPolicy.allowsSerialized(Rw4DiagnosticPolicy.Phase.QUERIES, new byte[] {8,2,16,2}));
        require(!Rw4DiagnosticPolicy.allowsSerialized(Rw4DiagnosticPolicy.Phase.QUERIES, join(new byte[] {8,2,16,1}, field(34, new byte[] {1}))));
        require(!Rw4DiagnosticPolicy.allowsSerialized(Rw4DiagnosticPolicy.Phase.HANDSHAKE, join(nonce, new byte[] {8,1})));
        require(!Rw4DiagnosticPolicy.allowsSerialized(Rw4DiagnosticPolicy.Phase.HANDSHAKE, join(new byte[] {8,1,16,26}, field(26, field(242, field(10, new byte[15]))))));
        for (byte[] valid : new byte[][] {nonce, confirm}) {
            for (int n = 0; n < valid.length; n++)
                require(!Rw4DiagnosticPolicy.allowsSerialized(Rw4DiagnosticPolicy.Phase.HANDSHAKE, Arrays.copyOf(valid, n)));
            require(!Rw4DiagnosticPolicy.allowsSerialized(Rw4DiagnosticPolicy.Phase.CLOSED, valid));
        }
        require(!Rw4DiagnosticPolicy.allowsSerialized(Rw4DiagnosticPolicy.Phase.HANDSHAKE, null));
        System.out.println("PASS: phase allowlist and strict wire payloads; writes, injected fields, invalid nonce, truncation and closed-session commands denied.");
    }
}

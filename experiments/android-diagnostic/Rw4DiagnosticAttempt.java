// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

import java.util.UUID;

/** Process-local ticket issued by a foreground click, not a persistent reconnect preference. */
public final class Rw4DiagnosticAttempt {
    public static final String EXTRA_TICKET = "rw4.diagnostic.manualTicket";
    public static final Rw4DiagnosticAttempt PROCESS = new Rw4DiagnosticAttempt();
    private static final long TICKET_MS = 5000;
    private boolean consumed;
    private String target;
    private String ticket;
    private long issued;

    public synchronized String issue(String address, long now) {
        if (consumed || address == null || address.isEmpty() || now < 0) return null;
        target = address;
        issued = now;
        ticket = UUID.randomUUID().toString();
        return ticket;
    }

    public synchronized boolean consume(String address, String presented, long now) {
        if (consumed || ticket == null || presented == null || !ticket.equals(presented)
                || !target.equals(address)) return false;
        if (now < issued || now - issued >= TICKET_MS) {
            ticket = null;
            target = null;
            return false;
        }
        consumed = true;
        ticket = null;
        target = null;
        return true;
    }
}

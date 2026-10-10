// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

import java.util.UUID;

/** Process-local ticket issued by a foreground click, not a persistent reconnect preference. */
public final class Rw4DiagnosticAttempt {
    public enum Mode { TRANSPORT_ONLY, QUERY }
    public static final String EXTRA_TICKET = "rw4.diagnostic.manualTicket";
    public static final Rw4DiagnosticAttempt PROCESS = new Rw4DiagnosticAttempt();
    private static final long TICKET_MS = 5000;
    private boolean consumed;
    private String target;
    private String ticket;
    private long issued;
    private Mode pendingMode;
    private Mode acceptedMode;
    private boolean cancelled;
    private long acceptedAt;

    public synchronized String issue(String address, long now) {
        return issue(address, now, Mode.QUERY);
    }

    public synchronized String issue(String address, long now, Mode mode) {
        if (consumed || address == null || address.isEmpty() || now < 0 || mode == null) return null;
        target = address;
        issued = now;
        ticket = UUID.randomUUID().toString();
        pendingMode = mode;
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
        acceptedAt = now;
        acceptedMode = pendingMode;
        ticket = null;
        target = null;
        return true;
    }

    public synchronized boolean isTransportOnly() { return consumed && acceptedMode == Mode.TRANSPORT_ONLY; }
    public synchronized boolean hasConsumed() { return consumed; }
    public synchronized boolean hasIssued() { return consumed || ticket != null; }
    public synchronized boolean isCancelled() { return cancelled; }
    public synchronized boolean isExpired(long now) {
        return consumed && (now < acceptedAt || now - acceptedAt >= 30000L);
    }
    public synchronized void cancel() {
        if (!hasIssued()) return;
        if (!consumed) acceptedMode = pendingMode;
        cancelled = true;
        consumed = true;
        ticket = null;
        target = null;
    }
}

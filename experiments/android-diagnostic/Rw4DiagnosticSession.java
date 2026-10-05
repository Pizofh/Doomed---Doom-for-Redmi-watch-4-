// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

/** One bounded attempt. Supply a monotonic clock, never wall-clock time. */
public final class Rw4DiagnosticSession {
    public interface Clock { long millis(); }
    private final Clock clock;
    private boolean attempted;
    private long started;
    private Rw4DiagnosticPolicy.Phase state = Rw4DiagnosticPolicy.Phase.CLOSED;

    public Rw4DiagnosticSession(Clock clock) {
        if (clock == null) throw new IllegalArgumentException("Missing clock");
        this.clock = clock;
    }
    public synchronized boolean begin() {
        if (attempted) return false;
        attempted = true;
        started = clock.millis();
        if (started < 0) return false;
        state = Rw4DiagnosticPolicy.Phase.HANDSHAKE;
        return true;
    }
    public synchronized Rw4DiagnosticPolicy.Phase phase() {
        long now = clock.millis();
        if (state != Rw4DiagnosticPolicy.Phase.CLOSED &&
                (now < started || now - started >= Rw4DiagnosticPolicy.MAX_SESSION_MS)) close();
        return state;
    }
    public synchronized boolean authenticated() {
        if (phase() != Rw4DiagnosticPolicy.Phase.HANDSHAKE) return false;
        state = Rw4DiagnosticPolicy.Phase.QUERIES;
        return true;
    }
    public synchronized boolean isOpen() { return phase() != Rw4DiagnosticPolicy.Phase.CLOSED; }
    public synchronized void close() { state = Rw4DiagnosticPolicy.Phase.CLOSED; }
}

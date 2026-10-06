// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

import java.util.concurrent.CountDownLatch;
import java.util.concurrent.atomic.AtomicInteger;

public final class Rw4DiagnosticAttemptTest {
    private static void require(boolean condition) {
        if (!condition) throw new AssertionError("Manual attempt boundary failed");
    }
    public static void main(String[] args) throws Exception {
        var attempt = new Rw4DiagnosticAttempt();
        require(!attempt.consume("synthetic-rw4", null, 100));
        require(attempt.issue(null, 100) == null);
        require(attempt.issue("synthetic-rw4", -1) == null);
        String ticket = attempt.issue("synthetic-rw4", 100);
        require(!attempt.consume("other-target", ticket, 101));
        require(!attempt.consume("synthetic-rw4", "not-a-ticket", 101));
        require(attempt.consume("synthetic-rw4", ticket, 101));
        require(!attempt.consume("synthetic-rw4", ticket, 102));
        require(attempt.issue("synthetic-rw4", 103) == null);

        var expired = new Rw4DiagnosticAttempt();
        require(!expired.consume("synthetic-rw4", expired.issue("synthetic-rw4", 100), 5100));
        var backwards = new Rw4DiagnosticAttempt();
        require(!backwards.consume("synthetic-rw4", backwards.issue("synthetic-rw4", 100), 99));

        // A later click replaces an unused ticket; an old queued intent cannot take its place.
        var replaced = new Rw4DiagnosticAttempt();
        String old = replaced.issue("synthetic-rw4", 100);
        String current = replaced.issue("synthetic-rw4", 101);
        require(!replaced.consume("synthetic-rw4", old, 102));
        require(replaced.consume("synthetic-rw4", current, 102));

        var concurrent = new Rw4DiagnosticAttempt();
        String shared = concurrent.issue("synthetic-rw4", 100);
        var start = new CountDownLatch(1);
        var successes = new AtomicInteger();
        Thread[] callers = new Thread[12];
        for (int i = 0; i < callers.length; i++) {
            callers[i] = new Thread(() -> {
                try { start.await(); } catch (InterruptedException e) { throw new AssertionError(e); }
                if (concurrent.consume("synthetic-rw4", shared, 101)) successes.incrementAndGet();
            });
            callers[i].start();
        }
        start.countDown();
        for (Thread caller : callers) caller.join();
        require(successes.get() == 1);
        System.out.println("Manual attempt tests passed (expiry, target, replay, concurrency)");
    }
}

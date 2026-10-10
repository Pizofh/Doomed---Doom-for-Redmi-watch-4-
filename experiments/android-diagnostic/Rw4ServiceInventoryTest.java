// SPDX-License-Identifier: AGPL-3.0-or-later
package nodomain.freeyourgadget.gadgetbridge.service.devices.xiaomi;

public final class Rw4ServiceInventoryTest {
    private static final String ADDRESS = "00:11:22:33:44:55", NAME = "Redmi Watch 4 ABCD";
    private static final String SPP = "00001101-0000-1000-8000-00805f9b34fb", FE95 = "0000fe95-0000-1000-8000-00805f9b34fb";
    static void require(boolean b) { if (!b) throw new AssertionError("Inventory contract"); }
    static final class Fixture implements Rw4ServiceInventory.Radio {
        long now = 100; int request, scan, stop, detach;
        boolean requestOk = true, scanOk = true, failRequest, failScan, failStop, failDetach, failSink;
        Rw4ServiceInventory.Snapshot output;
        final Rw4ServiceInventory model = new Rw4ServiceInventory(() -> now, this, snapshot -> {
            if (failSink) throw new IllegalStateException("private-error"); output = snapshot;
        }, ADDRESS, NAME);
        public boolean requestUuids() { request++; if (failRequest) throw new SecurityException("private-error"); return requestOk; }
        public boolean startBle() { scan++; if (failScan) throw new IllegalStateException("private-error"); return scanOk; }
        public boolean stopBle() { stop++; if (failStop) throw new SecurityException("private-error"); return true; }
        public boolean detach() { detach++; if (failDetach) throw new IllegalStateException("private-error"); return true; }
        int value(int index) { return model.snapshot().data[index]; }
    }
    public static void main(String[] args) {
        Fixture a = new Fixture(); require(a.model.start() && a.request == 1 && a.scan == 0);
        require(!a.model.start() && a.request == 1);
        a.model.uuids("00:11:22:33:44:66", new String[]{SPP}); require(a.scan == 0);
        a.now = 300; a.model.uuids(ADDRESS, new String[]{SPP, SPP.toUpperCase(), FE95, null, "private-error"});
        require(a.scan == 1 && a.value(3) == 2 && a.value(4) == 3);
        a.model.advertisement("00:11:22:33:44:66", "other-name", new String[]{FE95});
        require(a.value(5) == 1 && a.value(6) == 0 && a.value(7) == 0);
        a.model.advertisement("00:11:22:33:44:66", NAME, new String[]{FE95});
        require(a.value(7) == 1 && a.value(9) == 2 && a.value(6) == 0);
        a.model.advertisement(ADDRESS, null, new String[]{FE95});
        require(a.value(6) == 1 && a.value(8) == 2);
        a.now = 10300; a.model.tick(); require(a.model.isClosed() && a.value(2) == 1 && a.value(1) == 2);
        require(a.stop == 1 && a.detach == 1);
        String report = a.output.report(36);
        for (String secret : new String[]{ADDRESS, NAME, SPP, FE95, "private-error", "other-name"}) require(!report.contains(secret));
        a.model.advertisement(ADDRESS, NAME, new String[]{SPP}); a.model.uuids(ADDRESS, new String[]{SPP});
        a.model.finish(Rw4ServiceInventory.End.CANCELLED); require(a.stop == 1 && a.detach == 1 && a.value(6) == 1);
        a.output.data[6] = 9999; require(a.value(6) == 1); // Snapshot mutation cannot alter controller.
        Fixture timeout = new Fixture(); timeout.model.start(); timeout.now = 10100; timeout.model.tick();
        require(timeout.scan == 1 && timeout.value(0) == 5);
        timeout.model.uuids(ADDRESS, new String[]{SPP}); require(timeout.value(0) == 5);
        timeout.now = 20100; timeout.model.tick(); require(timeout.value(2) == 1 && timeout.stop == 1);
        Fixture delayed = new Fixture(); delayed.model.start(); delayed.now = 20100; delayed.model.tick();
        require(delayed.value(2) == 6 && delayed.scan == 0 && delayed.detach == 1);
        Fixture background = new Fixture(); background.model.start(); background.model.finish(Rw4ServiceInventory.End.BACKGROUND);
        require(background.scan == 0 && background.stop == 0 && background.detach == 1 && background.value(2) == 3);
        Fixture bond = new Fixture(); bond.model.start(); bond.model.bondChanged("00:11:22:33:44:66", false);
        require(!bond.model.isClosed()); bond.model.bondChanged(ADDRESS, false); require(bond.value(2) == 4);
        Fixture clock = new Fixture(); clock.model.start(); clock.now = 99; clock.model.tick(); require(clock.value(2) == 7);
        Fixture refused = new Fixture(); refused.requestOk = false; refused.scanOk = false;
        refused.model.start(); require(refused.value(0) == 4 && refused.value(1) == 4 && refused.model.isClosed());
        Fixture requestError = new Fixture(); requestError.failRequest = true; requestError.model.start();
        require(requestError.scan == 0 && requestError.detach == 1 && requestError.value(10) == 98);
        Fixture scanError = new Fixture(); scanError.requestOk = false; scanError.failScan = true; scanError.model.start();
        require(scanError.value(10) == 97 && scanError.stop == 1 && scanError.detach == 1);
        Fixture cleanup = new Fixture(); cleanup.requestOk = false; cleanup.failStop = true; cleanup.failDetach = true;
        cleanup.model.start(); cleanup.failSink = true; cleanup.model.scanFailed(5);
        require(cleanup.value(2) == 5 && cleanup.value(12) == 2 && cleanup.value(13) == 2 && cleanup.stop == 1 && cleanup.detach == 1);
        Fixture nulls = new Fixture(); nulls.model.start(); nulls.model.uuids(ADDRESS, null);
        require(nulls.value(0) == 3 && nulls.value(3) == -1); nulls.model.scanFailed(444); require(nulls.value(10) == 99);
        boolean invalid = false; try { new Rw4ServiceInventory.Snapshot(new int[2]); } catch (IllegalArgumentException e) { invalid = true; }
        require(invalid);
        int[] corrupt = new int[Rw4ServiceInventory.KEYS.length]; corrupt[4] = 16;
        invalid = false; try { new Rw4ServiceInventory.Snapshot(corrupt); } catch (IllegalArgumentException e) { invalid = true; }
        require(invalid);
        System.out.println("PASS: inventory phases/deadlines, target attribution, privacy, cancellation, late callbacks, cleanup exceptions and snapshot validation (PC fake radio).");
    }
}

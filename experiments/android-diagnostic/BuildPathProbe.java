// SPDX-License-Identifier: AGPL-3.0-or-later
import java.nio.file.*;
import java.util.Map;

/** Read-only probe for the JDK filesystem failure observed before Android compilation. */
public final class BuildPathProbe {
    public static void main(String[] args) throws Exception {
        if (args.length != 1) throw new IllegalArgumentException("One local JAR path required");
        Path jar = Path.of(args[0]);
        System.out.println("readable=" + Files.isReadable(jar));
        try { jar.toRealPath(); System.out.println("canonical=ok"); }
        catch (Exception e) { System.out.println("canonical=" + e.getClass().getSimpleName()); }
        try { jar.toRealPath(LinkOption.NOFOLLOW_LINKS); System.out.println("nofollow=ok"); }
        catch (Exception e) { System.out.println("nofollow=" + e.getClass().getSimpleName()); }
        try (FileSystem zip = FileSystems.newFileSystem(jar, Map.of())) {
            System.out.println("zip-open=ok");
        } catch (Exception e) { System.out.println("zip-operation=" + e.getClass().getSimpleName()); }
    }
}

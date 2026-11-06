package com.bibo.elearning.upload;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class PdfStorageService {

    public static final String PUBLIC_PREFIX = "/uploads/pdfs/";
    static final long MAX_BYTES = 20L * 1024 * 1024; // 20 MB

    private static final byte[] PDF_MAGIC = "%PDF-".getBytes(StandardCharsets.US_ASCII);

    private final Path pdfDir;

    public PdfStorageService(@Value("${app.upload-dir:uploads}") String uploadDir) throws IOException {
        this.pdfDir = Path.of(uploadDir).toAbsolutePath().normalize().resolve("pdfs");
        Files.createDirectories(pdfDir);
    }

    public Path pdfDir() {
        return pdfDir;
    }

    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please choose a PDF to upload");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("PDF is too large (max 20 MB)");
        }

        // Check the file's real content, not its name: every PDF starts with "%PDF-"
        byte[] header;
        try (InputStream in = file.getInputStream()) {
            header = in.readNBytes(PDF_MAGIC.length);
        }
        if (!Arrays.equals(header, PDF_MAGIC)) {
            throw new IllegalArgumentException("Only PDF files are allowed");
        }

        String name = UUID.randomUUID() + ".pdf";
        Path target = pdfDir.resolve(name).normalize();
        if (!target.startsWith(pdfDir)) { // defensive; name is generated, never user input
            throw new IllegalStateException("Invalid upload path");
        }
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }
        return PUBLIC_PREFIX + name;
    }

    public boolean isStoredUrl(String url) {
        return url != null && url.matches(PUBLIC_PREFIX + "[\\w-]+\\.pdf");
    }

    /** Deletes a PDF this service stored (by its public URL). Other URLs are ignored. */
    public void deleteIfStored(String url) {
        if (!isStoredUrl(url)) return;
        Path target = pdfDir.resolve(url.substring(PUBLIC_PREFIX.length())).normalize();
        if (!target.startsWith(pdfDir)) return;
        try {
            Files.deleteIfExists(target);
        } catch (IOException ignored) {
            // a leftover file is harmless; never fail the delete because of it
        }
    }
}

package com.bibo.elearning.upload;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Arrays;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Saves lesson images to {upload-dir}/images with a random name and returns the public URL.
 * The file type is decided from the file's own bytes (magic numbers), never from the
 * client's filename or Content-Type, so a renamed .html/.svg can't be stored as an "image".
 */
@Service
public class ImageStorageService {

    public static final String PUBLIC_PREFIX = "/uploads/images/";
    static final long MAX_BYTES = 5L * 1024 * 1024; // 5 MB

    private final Path imageDir;

    public ImageStorageService(@Value("${app.upload-dir:uploads}") String uploadDir) throws IOException {
        this.imageDir = Path.of(uploadDir).toAbsolutePath().normalize().resolve("images");
        Files.createDirectories(imageDir);
    }

    public Path imageDir() {
        return imageDir;
    }

    public String store(MultipartFile file) throws IOException {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Please choose an image to upload");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("Image is too large (max 5 MB)");
        }

        byte[] header = new byte[12];
        int read;
        try (InputStream in = file.getInputStream()) {
            read = in.readNBytes(header, 0, header.length);
        }
        String ext = detectExtension(Arrays.copyOf(header, read));
        if (ext == null) {
            throw new IllegalArgumentException("Only PNG, JPG, GIF, or WEBP images are allowed");
        }

        String name = UUID.randomUUID() + "." + ext;
        Path target = imageDir.resolve(name).normalize();
        if (!target.startsWith(imageDir)) { // defensive; name is generated, never user input
            throw new IllegalStateException("Invalid upload path");
        }
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
        }
        return PUBLIC_PREFIX + name;
    }

    /** Returns png/jpg/gif/webp from the leading bytes, or null if it isn't one of those. */
    static String detectExtension(byte[] b) {
        if (b.length >= 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') return "png";
        if (b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) return "jpg";
        if (b.length >= 6 && b[0] == 'G' && b[1] == 'I' && b[2] == 'F' && b[3] == '8') return "gif";
        if (b.length >= 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') return "webp";
        return null;
    }
}

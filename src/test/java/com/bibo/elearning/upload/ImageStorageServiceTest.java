package com.bibo.elearning.upload;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;

class ImageStorageServiceTest {

    private static final byte[] PNG = {(byte) 0x89, 'P', 'N', 'G', 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 0};
    private static final byte[] JPG = {(byte) 0xFF, (byte) 0xD8, (byte) 0xFF, (byte) 0xE0, 0, 0};

    @TempDir Path tmp;

    @Test
    void detectExtension_recognisesSupportedFormats() {
        assertThat(ImageStorageService.detectExtension(PNG)).isEqualTo("png");
        assertThat(ImageStorageService.detectExtension(JPG)).isEqualTo("jpg");
        assertThat(ImageStorageService.detectExtension("GIF89a".getBytes())).isEqualTo("gif");
        assertThat(ImageStorageService.detectExtension("RIFF\0\0\0\0WEBP".getBytes())).isEqualTo("webp");
    }

    @Test
    void detectExtension_rejectsNonImages() {
        assertThat(ImageStorageService.detectExtension("<svg onload=x>".getBytes())).isNull();
        assertThat(ImageStorageService.detectExtension("<html>".getBytes())).isNull();
        assertThat(ImageStorageService.detectExtension(new byte[0])).isNull();
    }

    @Test
    void store_savesWithRandomNameAndReturnsPublicUrl() throws Exception {
        ImageStorageService service = new ImageStorageService(tmp.toString());
        // client lies about the name/type; bytes decide
        var file = new MockMultipartFile("file", "../../evil.html", "text/html", PNG);

        String url = service.store(file);

        assertThat(url).startsWith("/uploads/images/").endsWith(".png").doesNotContain("evil");
        Path saved = tmp.resolve("images").resolve(url.substring("/uploads/images/".length()));
        assertThat(Files.readAllBytes(saved)).isEqualTo(PNG);
    }

    @Test
    void store_rejectsDisguisedFiles() throws Exception {
        ImageStorageService service = new ImageStorageService(tmp.toString());
        var fake = new MockMultipartFile("file", "cat.png", "image/png", "<script>alert(1)</script>".getBytes());
        assertThatThrownBy(() -> service.store(fake))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Only PNG, JPG, GIF, or WEBP");
    }
}

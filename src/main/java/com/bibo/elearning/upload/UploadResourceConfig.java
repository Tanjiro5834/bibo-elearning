package com.bibo.elearning.upload;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import lombok.RequiredArgsConstructor;

@Configuration
@RequiredArgsConstructor
public class UploadResourceConfig implements WebMvcConfigurer {

    private final ImageStorageService imageStorageService;
    private final PdfStorageService pdfStorageService;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler(ImageStorageService.PUBLIC_PREFIX + "**")
                .addResourceLocations(imageStorageService.imageDir().toUri().toString())
                .setCachePeriod(60 * 60 * 24 * 30);
        registry.addResourceHandler(PdfStorageService.PUBLIC_PREFIX + "**")
                .addResourceLocations(pdfStorageService.pdfDir().toUri().toString())
                .setCachePeriod(60 * 60 * 24 * 30);
    }
}

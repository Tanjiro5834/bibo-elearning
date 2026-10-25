package com.bibo.elearning.upload;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import lombok.RequiredArgsConstructor;

/** Serves saved lesson images at /uploads/images/** straight from the upload folder. */
@Configuration
@RequiredArgsConstructor
public class UploadResourceConfig implements WebMvcConfigurer {

    private final ImageStorageService imageStorageService;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler(ImageStorageService.PUBLIC_PREFIX + "**")
                .addResourceLocations(imageStorageService.imageDir().toUri().toString())
                .setCachePeriod(60 * 60 * 24 * 30); // names are random UUIDs, so safe to cache
    }
}

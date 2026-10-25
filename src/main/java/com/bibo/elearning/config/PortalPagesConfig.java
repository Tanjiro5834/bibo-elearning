package com.bibo.elearning.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/** Short, shareable URLs for each portal's login page. */
@Configuration
public class PortalPagesConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        registry.addViewController("/admin").setViewName("forward:/admin_login.html");
        registry.addViewController("/teacher").setViewName("forward:/teacher_login.html");
        registry.addViewController("/parent").setViewName("forward:/parent_login.html");
    }
}

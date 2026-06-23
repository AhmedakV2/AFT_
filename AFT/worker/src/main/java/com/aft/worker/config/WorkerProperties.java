package com.aft.worker.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "aft")
public record WorkerProperties(Selenium  selenium, Storage storage) {
    public record  Selenium(String gridUrl) {}
    public record Storage(String endpoint,String accessKey,String secretKey,String screenshotBucket) {}
}

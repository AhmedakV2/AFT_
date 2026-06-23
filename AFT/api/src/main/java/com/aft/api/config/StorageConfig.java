package com.aft.api.config;

import io.minio.MinioClient;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import lombok.RequiredArgsConstructor;


@Configuration
@RequiredArgsConstructor
public class StorageConfig {

    private final StorageProperties props;

    @Bean
    public MinioClient minioClient() {
        return MinioClient.builder()
                .endpoint(props.endpoint())
                .credentials(props.accessKey(), props.secretKey())
                .build();
    }

    @ConfigurationProperties(prefix = "aft.storage")
    public record StorageProperties(
            String endpoint ,String accessKey ,String secretKey,
            String screenshotBucket, String exportBucket
    ){}

}

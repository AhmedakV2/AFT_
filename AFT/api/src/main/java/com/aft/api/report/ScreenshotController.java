package com.aft.api.report;


import com.aft.api.common.exception.NotFoundException;
import com.aft.api.common.security.SecurityUtils;
import com.aft.api.config.StorageConfig.StorageProperties;
import com.aft.common.domain.StepResult;
import com.aft.common.repository.StepResultRepository;
import io.minio.GetObjectArgs;
import io.minio.MinioClient;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;


@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class ScreenshotController {

    private final StepResultRepository stepResults;
    private final MinioClient minio;
    private final StorageProperties storage;


    @GetMapping("/step-results/{stepResultId}/screenshot")
    public ResponseEntity<InputStreamResource> screenshot(@PathVariable UUID stepResultId) {
        StepResult sr = stepResults.findById(stepResultId)
                .orElseThrow(() -> new NotFoundException("Adım sonucu bulunamadı"));

        UUID owner = sr.getTestRun().getScenario().getModule().getProject().getUser().getId();

        if(!owner.equals(SecurityUtils.currentUserId())) {
            throw new NotFoundException("Adım sonucu bulunamadı");
        }
        if(sr.getScreenshotKey() == null) {
            throw new NotFoundException("Ekran görüntüsü bulunamadı");
        }
        try{
            var stream = minio.getObject(GetObjectArgs.builder()
                    .bucket(storage.screenshotBucket())
                    .object(sr.getScreenshotKey())
                    .build());
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_PNG)
                    .body(new InputStreamResource(stream));
        }catch (Exception e){
            throw new NotFoundException("Ekran görüntüsü okunamadı");
        }
    }
}

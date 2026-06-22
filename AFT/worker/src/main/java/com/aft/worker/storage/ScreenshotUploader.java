package com.aft.worker.storage;

import com.aft.worker.config.WorkerProperties;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.RequiredArgsConstructor;
import org.openqa.selenium.OutputType;
import org.openqa.selenium.TakesScreenshot;
import org.openqa.selenium.WebDriver;
import org.springframework.stereotype.Component;

import java.io.ByteArrayInputStream;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ScreenshotUploader {

    private final MinioClient minio;
    private final WorkerProperties props;

    public String upload(WebDriver driver, UUID testRunId, int stepOrder) {
        try {
            byte [] png = ((TakesScreenshot)driver).getScreenshotAs(OutputType.BYTES);
            String key = "runs/" + testRunId.toString() + "/step-" + stepOrder + ".png";

            minio.putObject(PutObjectArgs.builder()
                    .bucket(props.storage().screenshotBucket())
                    .object(key)
                    .stream(new ByteArrayInputStream(png),png.length, -1)
                    .contentType("image/png")
                    .build());
            return key;
        }catch (Exception e) {
            return null;
        }
    }
}

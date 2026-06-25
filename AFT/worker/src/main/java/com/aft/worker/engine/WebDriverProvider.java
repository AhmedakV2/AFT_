package com.aft.worker.engine;


import com.aft.worker.config.WorkerProperties;
import lombok.RequiredArgsConstructor;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.springframework.stereotype.Component;

import java.net.URL;
import java.time.Duration;

@Component
@RequiredArgsConstructor
public class WebDriverProvider {

    private final WorkerProperties props;

    public WebDriver create() {
        ChromeOptions options = new ChromeOptions();
        options.addArguments("--headless=new","--no-sandbox","--disable-dev-shm-usage");
        try{
            RemoteWebDriver driver = new RemoteWebDriver(new URL(props.selenium().gridUrl()),options);

            driver.manage().timeouts().pageLoadTimeout(Duration.ofSeconds(30));
            return driver;
        }catch(Exception e){
            throw new IllegalStateException("Selenium Gride bağlanilamadi:" + props.selenium().gridUrl(), e);
        }
    }
}

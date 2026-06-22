package com.aft.worker.engine;

import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.ExpectedConditions;
import org.openqa.selenium.support.ui.WebDriverWait;
import org.springframework.stereotype.Component;
import java.time.Duration;
import java.util.Map;


@Component
public class ElementLocator {

    public By toBy(Map<String,String> selectors){
        if(selectors == null) throw new IllegalArgumentException("Bu adım için selector zorunlu");

        String id = selectors.get("id");
        if(id != null && !id.isBlank()) return By.id(id);
        String css = selectors.get("css");
        if(css !=null && !css.isBlank()) return By.cssSelector(css);
        String xpath = selectors.get("xpath");
        if(xpath != null && !xpath.isBlank()) return By.xpath(xpath);
        throw new IllegalArgumentException("selectors içinde id/css/xpath bulunamadı");
    }
    public WebElement waitVisible(WebDriver driver, By by, int timeoutSeconds) {
        return new WebDriverWait(driver, Duration.ofSeconds(timeoutSeconds))
                .until(ExpectedConditions.visibilityOfElementLocated(by));
    }

}

package com.aft.worker.engine;

import com.aft.common.domain.Step;
import lombok.RequiredArgsConstructor;
import org.openqa.selenium.By;
import org.openqa.selenium.WebDriver;
import org.openqa.selenium.WebElement;
import org.springframework.stereotype.Component;


@Component
@RequiredArgsConstructor
public class StepInterpreter {
    private static final int DEFAULT_WAIT = 10 ;
    private final ElementLocator locator;

    public void execute(Step step , WebDriver driver) {
        switch (step.getAction()) {
            case NAVIGATE -> driver.get(requiredValue(step));
            case NAVIGATE_BACK -> driver.navigate().back();
            case NAVIGATE_FORWARD -> driver.navigate().forward();
            case REFRESH -> driver.navigate().refresh();

            case CLICK -> element(driver,step).click();


            case TYPE -> {
                WebElement el = element(driver,step);
                el.clear();
                el.sendKeys(requiredValue(step));
            }

            case CLEAR -> element(driver, step).clear();

            case WAIT_SECONDS -> sleepSeconds(requiredValue(step));

            default -> throw new UnsupportedOperationException("Bu aksiyon henüz desteklenmiyor" + step.getAction());
        }
    }

    private WebElement element (WebDriver driver,Step step) {
        By by = locator.toBy(step.getSelectors());
        return locator.waitVisible(driver,by,DEFAULT_WAIT);
    }

    private String requiredValue(Step step) {
        if(step.getValue()==null || step.getValue().isEmpty()) {
            throw new IllegalArgumentException(step.getAction()+"değer girmke zorunlu");
        }
        return step.getValue();
    }

    private void sleepSeconds(String value) {
        try {
            Thread.sleep((long) (Double.parseDouble(value)*1000));
        }
        catch(InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Bekleme kesildi"+e);
        }
    }
}
